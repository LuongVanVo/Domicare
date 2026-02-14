import logging
import uuid
from datetime import datetime
from typing import Optional

import bcrypt
from django.contrib.auth.hashers import make_password, check_password
from django.db import transaction, connection

from dtos.requests.add_user_by_admin_request import AddUserByAdminRequest
from dtos.requests.update_role_for_user_request import UpdateRoleForUserRequest
from dtos.requests.update_user_request import UpdateUserRequest
from dtos.user_dto import UserDTO
from exceptions.base import NotFoundException, ValidationException
from exceptions.user_exceptions import EmailAlreadyExistsException, UserNotFoundException, DeleteAdminException, \
    NotMatchPasswordException
from mappers.user_mapper import UserMapper
from middlewares.current_user import get_current_user
from models.user import User
from models.token import Token
from repositories.booking_repository import BookingRepository
from repositories.review_repository import ReviewRepository
from repositories.token_repository import TokenRepository
from repositories.user_repository import UserRepository
from services.file_service import FileService
from services.role_service import RoleService
from utils.format_string import FormatStringAccents

DEFAULT_ROLE = "ROLE_USER"
ADMIN_ROLE = "ROLE_ADMIN"
DEFAULT_AVATAR = "http://res.cloudinary.com/dnswn0tfq/image/upload/v1768915182/n7fg4oy5mgegoadnqpdr.png"
logger = logging.getLogger(__name__)
class UserService:
    """User Service - Business logic for user management"""
    def __init__(self):
        self.user_repo = UserRepository()
        self.token_repo = TokenRepository()
        self.booking_repo = BookingRepository()
        self.review_repo = ReviewRepository()
        self.role_service = RoleService()
        self.file_service = FileService()

    @transaction.atomic
    def save_user(self, user_dto: UserDTO) -> UserDTO:
        """Create a new user"""
        logger.info(f"[UserService] Creating new user with email: {user_dto.email}")

        # Validate email
        if self.user_repo.exists_by_email(user_dto.email):
            logger.error(f"[UserService] Email already exists: {user_dto.email}")
            raise EmailAlreadyExistsException(f"Email {user_dto.email} already exists.")

        # Create User entity
        user = UserMapper().to_entity(user_dto)

        if user.full_name:
            user.name_unsigned = FormatStringAccents.remove_accents(user.full_name)

        # Hash password
        salt = bcrypt.gensalt(rounds=12)
        user.password = bcrypt.hashpw(user_dto.password.encode('utf-8'), salt).decode('utf-8')

        # Assign roles
        role_entities = []
        if user_dto.roles:
            for role_dto in user_dto.roles:
                try:
                    role = self.role_service.get_role_by_name(role_dto.name)
                    role_entities.append(role)
                except Exception:
                    logger.warning(f"Role {role_dto.name} not found, skipping.")

        if not role_entities:
            default_role = self.role_service.get_role_by_name(DEFAULT_ROLE)
            role_entities = [default_role]

        # Save user
        created_user = self.user_repo.save(user)

        # Set roles (ManyToMany)
        if role_entities:
            with connection.cursor() as cursor:
                for role in role_entities:
                    cursor.execute(
                        "INSERT INTO users_roles (user_id, role_id) VALUES (%s, %s)",
                        [created_user.id, role.id]
                    )

        logger.info(f"[UserService] User created successfully with email: {user_dto.email}")
        return UserMapper.to_dto(created_user)

    def find_user_by_email(self, email: str) -> User:
        """Get user entity by email"""
        logger.info(f"[UserService] Fetching user by email: {email}")
        user = self.user_repo.find_by_email(email)
        if not user:
            logger.warning(f"[UserService] User not found with email: {email}")
            raise UserNotFoundException(f"User with email {email} not found.")
        return user

    def get_user_by_id(self, user_id: int) -> UserDTO:
        """Get user DTO by ID"""
        logger.debug(f"[UserService] Fetching user by ID: {user_id}")
        user = self.user_repo.find_by_id(user_id)
        if not user:
            logger.error(f"[UserService] User not found with ID: {user_id}")
            raise UserNotFoundException(f"User with ID {user_id} not found.")
        return UserMapper.to_dto(user)

    def get_all_users(self, page: int = 1, page_size: int = 20, search_name: Optional[str] = None, search_role_name: Optional[str] = None, sort_by: str = 'create-at', sort_direction: str = 'desc') -> dict:
        """Get all users with pagination and filtering"""
        logger.info(f"[UserService] Fetching users with pagination - Page: {page}, Size: {page_size}")

        users, total = self.user_repo.find_all_paginated(
            page=page,
            page_size=page_size,
            search_name=search_name,
            search_role_name=search_role_name,
            sort_by=sort_by,
            sort_direction=sort_direction,
        )

        user_dtos = [UserMapper.to_dto(user) for user in users]

        total_pages = (total + page_size - 1) // page_size
        logger.info(f"[UserService] Fetched {len(user_dtos)} users out of {total} total users")

        return {
            'meta': {
                'page': page,
                'page_size': page_size,
                'total': total,
                'total_pages': total_pages,
            },
            'data': [dto.model_dump(by_alias=True) for dto in user_dtos]
        }

    # EMAIL CONFIRMATION
    def find_user_by_email_confirm_token(self, token: str) -> UserDTO:
        """Find user by email confirmation token"""
        logger.debug("[UserService] Fetching user by email confirmation token")

        user = self.user_repo.find_by_email_confirmation_token(token)
        if not user:
            logger.error("[UserService] User not found with provided email confirmation token")
            raise UserNotFoundException("User with the provided email confirmation token not found.")

        logger.info(f"[UserService] User found with ID: {user.id} for email confirmation")
        return UserMapper.to_dto(user)

    def create_verification_token(self, email: str) -> str:
        """Create email verification token for user"""
        logger.debug(f"[UserService] Creating verification token for email: {email}")

        user = self.user_repo.find_by_email(email)
        if not user:
            logger.error(f"[UserService] User not found with email: {email}")
            raise UserNotFoundException(f"User with email {email} not found.")

        token = str(uuid.uuid4())
        user.email_confirmation_token = token
        self.user_repo.save(user)

        return token

    @transaction.atomic
    def update_confirmed_email(self, user_dto: UserDTO) -> UserDTO:
        """Update email confirmation status"""
        user_id = user_dto.id
        logger.debug(f"[UserService] Updating email confirmation token for user: {user_id}")

        user = self.user_repo.find_by_id(user_id)
        if not user:
            logger.error(f"[UserService] User not found with ID: {user_id}")
            raise UserNotFoundException(f"User with ID {user_id} not found.")

        user.is_email_confirmed = user.is_email_confirmed
        user.email_confirmation_token = user_dto.email_confirmation_token

        saved_user = self.user_repo.save(user)
        logger.info(f"[UserService] Email confirmation updated for user ID: {user_id}")
        return UserMapper.to_dto(saved_user)

    # USER MANAGEMENT
    @transaction.atomic
    def delete_user_by_id(self, user_id: int) -> None:
        """Soft delete user and cascade related data"""
        logger.info(f"[UserService] Attempting to delete user with ID: {user_id}")

        user = self.user_repo.find_by_id(user_id)
        if not user:
            logger.error(f"[UserService] User not found with ID: {user_id}")
            raise UserNotFoundException(f"User with ID {user_id} not found.")

        # Check if user is admin
        is_admin = any(role.name == ADMIN_ROLE for role in user.roles.all())
        if is_admin:
            logger.error(f"[UserService] Cannot delete admin user with ID: {user_id}")
            raise DeleteAdminException("Cannot delete admin users.")

        # Delete related data
        bookings_count = 0
        reviews_count = 0
        tokens_count = 0

        # Delete bookings
        bookings = user.bookings.all()
        if bookings:
            bookings_count = len(bookings)
            logger.debug(f"[UserService] Deleting {bookings_count} bookings for user ID: {user_id}")
            for booking in bookings:
                booking.delete()

        # Delete reviews
        reviews = user.reviews.all()
        if reviews:
            reviews_count = len(reviews)
            logger.debug(f"[UserService] Deleting {reviews_count} reviews for user ID: {user_id}")
            for review in reviews:
                review.delete()

        # Delete tokens
        tokens = user.refresh_tokens.all()
        if tokens:
            tokens_count = len(tokens)
            logger.debug(f"[UserService] Deleting {tokens_count} tokens for user ID: {user_id}")
            for token in tokens:
                token.delete()

        # Soft delete user
        self.user_repo.soft_delete_by_id(user_id)

        logger.info(f"[UserService] User deleted successfully with ID: {user_id} (removed {bookings_count} bookings, {reviews_count} reviews, {tokens_count} tokens).")

    @transaction.atomic
    def reset_password(self, email: str, password: str) -> None:
        """Reset user password"""
        logger.info(f"[UserService] Attempting to reset password for user with email: {email}")
        user = self.user_repo.find_by_email(email)
        if not user:
            logger.error(f"[UserService] User not found with email: {email}")
            raise UserNotFoundException(f"User with email {email} not found.")

        if password:
            user.password = make_password(password)

        self.user_repo.save(user)
        logger.info(f"[UserService] Password reset successfully for user ID: {user.id}")

    @transaction.atomic
    def update_user_information(self, user_request: UpdateUserRequest) -> UserDTO:
        """Update user information"""
        logger.info("[UserService] Updating user information")

        # Get current user
        current_user = get_current_user()
        if not current_user:
            logger.error(f"[UserService] User not found with ID: {current_user.id}")
            raise UserNotFoundException("Current user not found.")

        user = self.user_repo.find_by_email(current_user.email)
        if not user:
            logger.error(f"[UserService] User not found with email: {current_user.email}")
            raise UserNotFoundException(f"User with email {current_user.email} not found.")

        user_id = user.id
        logger.debug(f"[UserService] Updating information for user by ID: {user_id}")

        has_changes = False

        # Update name
        if user_request.name and user_request.name != user.full_name:
            user.full_name = user_request.name
            user.name_unsigned = FormatStringAccents.remove_accents(user_request.name)
            logger.debug(f"[UserService] Updated name for user ID: {user_id}")
            has_changes = True

        # Update phone
        if user_request.phone and user_request.phone != user.phone:
            user.phone = user_request.phone
            logger.debug(f"[UserService] Updated phone for user ID: {user_id}")
            has_changes = True

        # Update address
        if user_request.address and user_request.address != user.address:
            user.address = user_request.address
            logger.debug(f"[UserService] Updated address for user ID: {user_id}")
            has_changes = True

        # Update date of birth
        if user_request.date_of_birth and user_request.date_of_birth != user.date_of_birth:
            user.date_of_birth = user_request.date_of_birth
            logger.debug(f"[UserService] Updated date of birth for user ID: {user_id}")
            has_changes = True

        # Update gender
        if user_request.gender and user_request.gender != user.gender:
            user.gender = user_request.gender
            logger.debug(f"[UserService] Updated gender for user ID: {user_id}")
            has_changes = True

        # Update password
        if user_request.new_password:
            if not user_request.old_password:
                logger.error(f"[UserService] Password update failed - old password not provided for user ID: {user_id}")
                raise NotMatchPasswordException("Vui lòng nhập mật khẩu cũ để thay đổi mật khẩu.")

            if user_request.new_password != user_request.confirm_password:
                raise ValidationException("Mật khẩu xác nhận không khớp.")

            if user_request.new_password == user_request.old_password:
                raise ValidationException("Mật khẩu mới không được trùng với mật khẩu cũ.")

            if bcrypt.checkpw(user_request.old_password.encode('utf-8'), user.password.encode('utf-8')):
                # user.password = make_password(user_request.new_password)
                salt = bcrypt.gensalt(rounds=12)
                user.password = bcrypt.hashpw(user_request.new_password.encode('utf-8'), salt).decode('utf-8')
                logger.debug(f"[UserService] Updated password for user ID: {user_id}")
                has_changes = True
            else:
                logger.error(
                    f"[UserService] Password update failed - old password does not match for user ID: {user_id}")
                raise NotMatchPasswordException("Mật khẩu cũ không chính xác.")

        # Update avatar
        if user_request.image_id:
            file_dto = self.file_service.fetch_file_by_id(user_request.image_id)
            if not file_dto:
                logger.warning(f"[UserService] Avatar update failed - file not found with ID: {user_request.image_id}")
                raise FileNotFoundError("Avatar not found.")
            user.avatar = file_dto.url
            logger.debug(f"[UserService] Updated avatar for user ID: {user_id} with file ID: {user_request.image_id}")
            has_changes = True

        # Save changes
        saved_user = self.user_repo.save(user)
        logger.info(f"[UserService] User information {'updated' if has_changes else 'unchanged'} for user ID: {user_id}")

        return UserMapper.to_dto(saved_user)

    @transaction.atomic
    def update_role_for_user(self, request: UpdateRoleForUserRequest) -> UserDTO:
        """Update user roles (admin only)"""
        user_id = request.user_id
        role_ids = request.role_ids
        current_user = get_current_user()

        logger.info(f"[UserService] Updating roles for user ID: {user_id}")

        user = self.user_repo.find_by_id(user_id)
        if not user:
            logger.error(f"[UserService] User not found with ID: {user_id}")
            raise UserNotFoundException(f"User with ID {user_id} not found.")

        if not role_ids or len(role_ids) == 0:
            logger.error(f"[UserService] No roles provided to update for user ID: {user_id}")
            raise NotFoundException("At least one role must be provided.")

        # check if current user is admin
        is_admin = any(role.name == ADMIN_ROLE for role in current_user.roles.all())
        if not is_admin:
            logger.error(f"[UserService] Unauthorized role update attempt by user ID: {current_user.id}")
            raise PermissionError("Only admin users can update roles.")

        # Get roles
        roles = []
        for role_id in role_ids:
            role = self.role_service.get_role_entity_by_id(role_id)
            if not role:
                logger.warning(f"[UserService] Role update failed - role not found with ID: {role_id}")
                raise NotFoundException(f"Role not found with ID: {role_id}")
            roles.append(role)
            logger.debug(f"[UserService] Adding role '{role.name}' to user ID: {user_id}")

        # Get original and new role names for logging
        original_role_names = [role.name for role in user.roles.all()]
        new_role_names = [role.name for role in roles]

        # Update roles
        with connection.cursor() as cursor:
            cursor.execute("DELETE FROM users_roles WHERE user_id = %s", [user_id])
            for role in roles:
                cursor.execute(
                    "INSERT INTO users_roles (user_id, role_id) VALUES (%s, %s)",
                    [user_id, role.id]
                )

        user.refresh_from_db()

        logger.info(f"[UserService] Updated roles for user ID: {user_id} from {original_role_names} to {new_role_names}")
        return UserMapper.to_dto(user)

    @transaction.atomic
    def add_user_by_admin(self, request: AddUserByAdminRequest) -> UserDTO:
        """Admin creates a new user"""
        logger.info(f"[UserService] Adding new user by admin with email: {request.email}")
        current_user = get_current_user()
        is_admin = any(role.name == ADMIN_ROLE for role in current_user.roles.all())
        if not is_admin:
            logger.error(f"[UserService] Unauthorized user creation attempt by user ID: {current_user.id}")
            raise PermissionError("Only admin users can add new users.")

        user_dto = UserDTO(
            email=request.email,
            name=request.name,
            password=request.password,
            phone=request.phone,
            address=request.address,
            dateOfBirth=request.date_of_birth,
            gender=request.gender,
            avatar=request.avatar or DEFAULT_AVATAR,
            emailConfirmationToken=None,
            isEmailConfirmed=True,
            isActive=True,
            isDelete=False,
        )

        # Get role
        role_dto = self.role_service.get_role_by_id(request.role_id)
        if not role_dto:
            logger.warning(f"[UserService] User creation by admin failed - role not found with ID: {request.role_id}")
            raise NotFoundException(f"Role not found with ID: {request.role_id}")

        user_dto.roles = [role_dto]
        logger.debug(f"[UserService] Assigning role '{role_dto.name}' to new user")

        # Create user
        created_user = self.save_user(user_dto)
        logger.info(f"[UserService] User created successfully by admin with email: {request.email}")

        return created_user

    # TOKEN MANAGEMENT
    def find_by_refresh_token_with_user(self, refresh_token: str) -> Optional[Token]:
        """Find refresh token with user"""
        return self.token_repo.find_by_refresh_token(refresh_token)

    @transaction.atomic
    def delete_refresh_token_by_user_id(self, user_id: int) -> None:
        """Delete all refresh tokens for a user"""
        logger.debug(f"[UserService] Attempting to delete refresh tokens for user ID: {user_id}")

        if not user_id:
            logger.warning("[UserService] Token deletion failed - User ID is null")
            raise ValueError("User ID cannot be null")

        if not self.user_repo.exists_by_id(user_id):
            logger.warning(f"[UserService] Token deletion failed = User not found with ID: {user_id}")
            raise UserNotFoundException(f"User with ID {user_id} not found.")

        try:
            tokens = self.token_repo.find_by_user_id(user_id)
            if tokens:
                for token in tokens:
                    self.token_repo.delete(token)
                logger.debug(f"[UserService] Deleted {len(tokens)} refresh tokens for user ID: {user_id}")
            else:
                logger.debug(f"[UserService] No refresh tokens found for user ID: {user_id}")

            logger.info(f"[UserService] Successfully deleted all refresh tokens for user ID: {user_id}")
        except Exception as e:
            logger.error(f"[UserService] Failed to delete refresh token for user ID: {user_id}", exc_info=e)
            raise RuntimeError("Failed to delete refresh token")

    def count_new_user_between(self, start_date: datetime, end_date: datetime) -> int:
        """Count new users (with USER role) between two dates"""
        role_name = 'ROLE_USER'
        logger.info(f"[UserService] Counting new users between {start_date} and {end_date}")

        if not start_date or not end_date:
            raise ValueError("Start date and end date cannot be null")
        if start_date > end_date:
            raise ValueError("Start date cannot be after end date")

        new_users = self.user_repo.count_all_users_between(role_name, start_date, end_date)
        logger.info(f"[UserService] Total new users between {start_date} and {end_date} with role '{role_name}': {new_users}")

        return new_users