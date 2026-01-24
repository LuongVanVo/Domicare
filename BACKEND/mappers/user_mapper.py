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
        # Get roles as list of RoleDTO - FIX HERE
        roles_list = []
        try:
            # Query roles directly to avoid RoleDTO serialization issues


            role_ids = UserRole.objects.filter(user=user).values_list('role_id', flat=True)
            roles_queryset = Role.objects.filter(id__in=role_ids)

            for role in roles_queryset:
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
            full_name=user.full_name,
            phone=user.phone,
            address=user.address,
            avatar=user.avatar,
            gender=user.gender,
            date_of_birth=user.date_of_birth,
            is_email_confirmed=user.is_email_confirmed,
            is_active=user.is_active,
            roles=roles_list  # List of RoleDTO objects
        )

    @staticmethod
    def to_entity(user_dto: UserDTO) -> User:
        return User(
            id=user_dto.id,
            full_name=user_dto.name,
            password=user_dto.password,
            phone=user_dto.phone,
            address=user_dto.address,
            avatar=user_dto.avatar,
            email=user_dto.email,
            gender=user_dto.gender,
            date_of_birth=user_dto.date_of_birth,
            is_email_confirmed=user_dto.is_email_confirmed,
            email_confirmation_token=user_dto.email_confirmation_token,
            google_id=user_dto.google_id,
            update_at=user_dto.update_at,
            update_by=user_dto.update_by,
            create_at=user_dto.create_at,
            create_by=user_dto.create_by,
            is_active=user_dto.is_active,
        )