from dtos.role_dto import RoleDTO
from dtos.user_dto import UserDTO
from models.user import User
from models.user import UserRole
from models.role import Role
import logging

logger = logging.getLogger(__name__)
class UserMapper:
    @staticmethod
    def to_dto(user: User) -> UserDTO:
        """Convert User model to UserDTO"""
        roles_list = []
        try:
            roles = user.roles.all()
            for role in roles:
                roles_list.append(RoleDTO(
                    id=role.id,
                    name=role.name,
                    description=role.description
                ))
        except Exception as e:
            logger.warning(f"Failed to get roles for user {user.email}: {e}")

        return UserDTO(
            id=user.id,
            email=user.email,
            name=user.full_name,
            phone=user.phone,
            address=user.address,
            avatar=user.avatar,
            gender=user.gender,
            date_of_birth=user.date_of_birth,
            isEmailConfirmed=user.is_email_confirmed,
            is_active=user.is_active,
            is_deleted=user.is_deleted,
            roles=roles_list
        )

    @staticmethod
    def to_entity(user_dto: UserDTO) -> User:
        return User(
            # id=user_dto.id, # Bỏ ID khi tạo mới
            full_name=user_dto.name,
            password=user_dto.password, # Password sẽ được hash ở Service
            phone=user_dto.phone,
            address=user_dto.address,
            avatar=user_dto.avatar,
            email=user_dto.email,
            gender=user_dto.gender,
            date_of_birth=user_dto.date_of_birth,
            is_email_confirmed=user_dto.is_email_confirmed,
            email_confirmation_token=user_dto.email_confirmation_token,
            google_id=user_dto.google_id,
            is_active=user_dto.is_active if user_dto.is_active is not None else True,
            is_deleted=user_dto.is_delete if user_dto.is_delete is not None else False,
            create_at=user_dto.create_at,
            update_at=user_dto.update_at,
            create_by=user_dto.create_by,
            update_by=user_dto.update_by,
        )