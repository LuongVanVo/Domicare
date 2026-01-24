import logging
from datetime import  timedelta
from typing import Optional, Tuple
from django.utils import timezone

from django.contrib.auth.hashers import make_password

from dtos.auth.login_request import LoginRequest
from dtos.auth.login_response import LoginResponse
from dtos.auth.refresh_token_request import RefreshTokenRequest
from dtos.auth.refresh_token_response import RefreshTokenResponse
from dtos.auth.register_request import RegisterRequest
from dtos.auth.register_response import RegisterResponse
from exceptions.auth_exceptions import InvalidEmailOrPassword, EmailNotConfirmedException, InvalidRefreshTokenException
from exceptions.user_exceptions import UserNotFoundException, EmailAlreadyExistsException
from mappers.user_mapper import UserMapper
from models.user import User
from repositories.token_repository import TokenRepository
from repositories.user_repository import UserRepository
from services.email_service import EmailService
from services.jwt_service import JwtService
import bcrypt
import string
import secrets

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self):
        self.user_repo = UserRepository()
        self.token_repo = TokenRepository()
        self.jwt_service = JwtService()
        self.email_service = EmailService()

    def login(self, login_request: LoginRequest) -> LoginResponse:
        email = login_request.email
        password = login_request.password
        logger.info(f"[JWT] Login attempt for email: {email}")

        try:
            # Find user
            user = self.user_repo.find_by_email(email)
            if not user:
                raise InvalidEmailOrPassword("Email chưa được đăng ký hoặc mật khẩu sai.")

            # Verify password với bcrypt thuần
            if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
                raise InvalidEmailOrPassword("Email chưa được đăng ký hoặc mật khẩu sai.")

            # Check if email is confirmed
            if not user.is_email_confirmed:
                raise EmailNotConfirmedException("Email chưa được xác thực.")

            # Update user active status
            user.is_active = True
            self.user_repo.save(user)

            # Generate tokens
            access_token, refresh_token = self.jwt_service.create_tokens(user.email)

            # save refresh token to db
            self.token_repo.create_token(
                user=user,
                refresh_token=refresh_token,
                expiration=timezone.now() + timedelta(days=7)
            )

            # Response
            user_dto = UserMapper.to_dto(user)
            login_response = LoginResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                user=user_dto
            )

            logger.info(f"[JWT] Login successful for email: {email}")
            return login_response

        except (InvalidEmailOrPassword, EmailNotConfirmedException) as e:
            logger.info(f"[JWT] Login failed from email: {email}. Reason: {str(e)}")
            raise e
        except Exception as e:
            logger.error(f"[JWT] Unexpected error during login for email: {email}. Reason: {str(e)}")
            raise e

    def logout(self, email: str):
        logger.info("[JWT] Logout attempt")

        user = self.user_repo.find_by_email(email)
        if not user:
            logger.warning("[JWT] Logout failed - no user found")
            raise UserNotFoundException("Không tìm thấy người dùng")

        self.token_repo.delete_by_user_id(user.id)
        logger.info(f"[JWT] User {user.email} logged out and tokens cleared")

    # register
    def register(self, request: RegisterRequest) -> RegisterResponse:
        email = request.email
        password = request.password

        logger.info(f"[Auth] Registration attempt for email: {email}")

        # Check if email exists
        if self.user_repo.exists_by_email(email):
            logger.warning(f"[Auth] Registration failed - email {email} already in use")
            raise EmailAlreadyExistsException("Email đã được đăng ký.")

        # Hash password với bcrypt thuần (không qua Django wrapper)
        salt = bcrypt.gensalt(rounds=12)
        password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

        # Create user
        user = self.user_repo.create_user(
            email=email,
            password_hash=password_hash,
            is_active=False,
            is_deleted=False,
        )

        # send verification email
        try:
            self.email_service.send_verification_email(email)
        except Exception as e:
            logger.error(f"[Auth] Failed to send verification email to {email}: {str(e)}")

        logger.info(f"[Auth] User registered successfully with email: {email}")

        return RegisterResponse(
            id=user.id,
            email=user.email,
            message="Register successful. Please check your email to verify your account."
        )

    # refresh token
    def refresh_token(self, request: RefreshTokenRequest) -> RefreshTokenResponse:
        refresh_token = request.refresh_token

        logger.debug("[Auth] Attempting to refresh token")

        # Validate refresh token
        if not self.jwt_service.is_refresh_token_valid(refresh_token):
            logger.warning("[Auth] Refresh token failed - invalid refresh token")
            raise InvalidRefreshTokenException("Invalid or expired refresh token")

        # Get user from refresh token
        user = self.jwt_service.get_user_from_refresh_token(refresh_token)

        # Generate new access token
        access_token = self.jwt_service.create_access_token(user.email)

        logger.info(f"[Auth] Refresh token successful for email: {user.email}")

        return RefreshTokenResponse(
            access_token=access_token,
            email=user.email
        )

    # verify email
    def verify_email(self, token: str):
        logger.info("[Auth] Email verification attempt with token")

        user = self.user_repo.find_by_email_confirmation_token(token)
        if not user:
            logger.warning("[Auth] Email verification failed - invalid email confirmation token")
            raise UserNotFoundException("Invalid email confirmation token")

        user.is_email_confirmed = True
        user.email_confirmation_token = None
        self.user_repo.save(user)

        logger.info(f"[Auth] Email verified successfully for email: {user.email}")

    # reset password
    def reset_password(self, email: str, new_password: str):
        logger.info(f"[Auth] Password reset attempt for email: {email}")

        user = self.user_repo.find_by_email(email)
        if not user:
            logger.warning(f"[Auth] Password reset failed - no user found with email: {email}")
            raise UserNotFoundException("Không tìm thấy người dùng với email đã cho.")

        salt = bcrypt.gensalt(rounds=12)
        password_hash = bcrypt.hashpw(new_password.encode('utf-8'), salt).decode('utf-8')

        user.password = password_hash
        user.email_confirmation_token = None
        self.user_repo.save(user)

        logger.info(f"[Auth] Password reset successful for email: {email}")

    def send_reset_password_email(self, email: str):
        logger.info(f"[Auth] Password reset attempt for email: {email}")

        user = self.user_repo.find_by_email(email)
        if not user:
            raise UserNotFoundException("Không tìm thấy người dùng với email đã cho.")

        self.email_service.send_reset_password_email(user.email)

    @staticmethod
    def _user_to_dict(user) -> dict:
        return {
            "id": user.id,
            "email": user.email,
            'name': user.full_name,
            'name_unsigned': user.name_unsigned,
            'phone': user.phone,
            'address': user.address,
            'avatar': user.avatar,
            "is_active": user.is_active,
            "is_email_confirmed": user.is_email_confirmed,
        }
        
    def generate_random_password(self, length: int = 20) -> str:
        """Generate a random password of OAuth users"""
        alphabet = string.ascii_letters + string.digits + string.punctuation
        return ''.join(secrets.choice(alphabet) for _ in range(length))
    
    def handle_google_oauth2(
        self, email: str, 
        name: Optional[str] = None, 
        picture: Optional[str] = None, 
        locale: Optional[str] = None, 
        google_id: Optional[str] = None) -> Tuple[str, str, User]:
        """
        Handle Google OAuth2 login or registration
        Returns access token, refresh token, and user
        """
        if not email:
            raise ValueError("Email is required for OAuth2 authentication")
        
        # Check if user exists
        user = self.user_repo.find_by_email(email)
        is_new_user = user is None
        
        if is_new_user:
            logger.info(f"[OAuth2] Creating new user for email: {email} via Google OAuth2")
            # Create new user
            user = User(
                email=email,
                full_name=name or email.split('@')[0],
                password=self.generate_random_password(),
                google_id=google_id,
                avatar=picture,
                address=locale,
                is_email_confirmed=True,
                email_confirmation_token=None,
                is_active=True,
                is_deleted=False,
            )
            user.set_password(user.password)
            self.user_repo.save(user)
        else:
            logger.info(f"[OAuth2] Updating existing user for email: {email} via Google OAuth2")
            # Update existing user info
            self._update_user_information(user, email, name, picture, locale, google_id)
            self.user_repo.save(user)

        # Generate tokens
        access_token, refresh_token = self.jwt_service.create_tokens(user.email)
        
        # Save refresh token to DB
        self.token_repo.create_token(
            user=user,
            refresh_token=refresh_token,
            expiration=timezone.now() + timedelta(days=7)
        )
        
        logger.info(f"[OAuth2] OAuth2 login successful for email: {email}")
        return access_token, refresh_token, user
    
    def _update_user_information(self, user: User, email: str, name: Optional[str], picture: Optional[str], locale: Optional[str], google_id: Optional[str]) -> None:
        if google_id and not user.google_id:
            user.google_id = google_id
        
        # Confirm email and activate account
        user.is_email_confirmed = True
        user.email_confirmation_token = None
        user.is_active = True
        user.is_deleted = False
        
        # Update name if not set
        if name and not user.full_name:
            user.full_name = name
        
        # Update avatar if not set
        if picture and not user.avatar:
            user.avatar = picture
        # Update address if not set
        if locale and not user.address:
            user.address = locale