from datetime import datetime, timezone, timedelta
from typing import Optional

from typing import Tuple
from django.conf import settings
import logging
import jwt
import uuid

from pydantic import EmailStr

from exceptions.auth_exceptions import InvalidRefreshTokenException
from exceptions.base import NotFoundException
from repositories.token_repository import TokenRepository
from repositories.user_repository import UserRepository
from models.token import Token

logger = logging.getLogger(__name__)

class JwtService:
    JWT_ALGORITHM = 'HS256'
    REFRESH_TOKEN_DURATION_SECONDS = 604800  # 7 days

    def __init__(self):
        self.user_repo = UserRepository()
        self.token_repo = TokenRepository()
        self.secret_key = settings.JWT_SECRET_KEY
        self.expiration_minutes = settings.JWT_EXPIRATION_MINUTES

    def create_access_token(self, email: str) -> str:
        if not email or not email.strip():
            raise ValueError('Email cannot be empty')

        now = datetime.now(timezone.utc)
        expiration = now + timedelta(minutes=self.expiration_minutes)

        # Get user
        user = self.user_repo.find_by_email(email)
        if user is None:
            logger.error(f"[JWT] Failed to create access token: User with email {email} not found")
            raise NotFoundException(f"User with email {email} not found")

        # Get roles
        roles = user.roles.all()
        if not roles:
            logger.info(f"[JWT] User {email} has no roles assgined, using default ROLE_USER")
            roles_names = ["ROLE_USER"]
        else:
            roles_names = [role.name for role in roles]

        # Build JWT payload
        payload = {
            'sub': email,
            'email': email,
            'roles': roles_names,
            'type': 'access',
            'iat': now,
            'exp': expiration,
        }

        logger.debug(f'[JWT] Creating access token for user {email}')
        return jwt.encode(payload, self.secret_key, algorithm=self.JWT_ALGORITHM)

    def create_refresh_token(self, email: str) -> str:
        if not email or not email.strip():
            raise ValueError('Email cannot be empty')

        # Get user
        user = self.user_repo.find_by_email(email)
        if user is None:
            logger.error(f"[JWT] Failed to create refresh token: User with email {email} not found")
            raise NotFoundException(f"User with email {email} not found")

        # Delete existing tokens
        existing_tokens = self.token_repo.find_by_user_id(user.id)
        if existing_tokens:
            self.token_repo.delete_all(existing_tokens)
            logger.debug(f"[JWT] Deleted existing refresh tokens for user {email}")

        refresh_token = str(uuid.uuid4())
        expiration = datetime.now(timezone.utc) + timedelta(seconds=self.REFRESH_TOKEN_DURATION_SECONDS)

        token = Token(
            refresh_token=refresh_token,
            expiration=expiration,
            user=user
        )

        return refresh_token

    # create token
    def create_tokens(self, email: str) -> Tuple[str, str]:
        access_token = self.create_access_token(email)
        refresh_token = self.create_refresh_token(email)
        return access_token, refresh_token

    def is_refresh_token_valid(self, refresh_token: str) -> bool:
        if not refresh_token or not refresh_token.strip():
            logger.warning("[JWT] Attempted to validate null or empty refresh token")
            return False

        token = self.token_repo.find_by_refresh_token(refresh_token)
        if token is None:
            logger.warning("[JWT] Token validation failed: Token not found")
            return False

        valid = token.expiration > datetime.now(timezone.utc)

        if not valid:
            logger.warning(f"[JWT] Refresh token has expired for user ID {token.user_id}")
            self.token_repo.delete(token)

        return valid

    def verify_access_token(self, token: str) -> Optional[dict]:
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.JWT_ALGORITHM])
            if payload.get('type') != 'access':
                return None
            return payload
        except jwt.ExpiredSignatureError:
            raise NotFoundException("Token has expired")
        except jwt.InvalidTokenError:
            raise NotFoundException("Invalid token")

    # get user from refresh token
    def get_user_from_refresh_token(self, refresh_token: str):
        token = self.token_repo.find_by_refresh_token(refresh_token)
        if not token:
            raise InvalidRefreshTokenException("Invalid refresh token")
        return token.user

    # delete refresh token
    def delete_refresh_token(self, refresh_token: str):
        token = self.token_repo.find_by_refresh_token(refresh_token)
        if token:
            self.token_repo.delete(token)

    # delete all user tokens
    def delete_all_user_tokens(self, user_id: int):
        self.token_repo.delete_by_user_id(user_id)

    # generate random password
    @staticmethod
    def generate_random_password() -> str:
        return str(uuid.uuid4())