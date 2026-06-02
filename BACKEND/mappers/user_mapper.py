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

        # Fallback to default ROLE_USER if user has no assigned roles in DB
        if not roles_list:
            try:
                from models.role import Role
                role_user = Role.objects.filter(name='ROLE_USER').first()
                if role_user:
                    roles_list.append(RoleDTO(
                        id=role_user.id,
                        name=role_user.name,
                        description=role_user.description
                    ))
                else:
                    roles_list.append(RoleDTO(id=1, name='ROLE_USER', description='Default User Role'))
            except Exception:
                roles_list.append(RoleDTO(id=1, name='ROLE_USER', description='Default User Role'))

        return UserDTO(
            id=user.id,
            email=user.email,
            name=user.full_name,
            phone=user.phone,
            address=user.address,
            avatar=user.avatar,
            gender=user.gender,
            dateOfBirth=user.date_of_birth,
            isEmailConfirmed=user.is_email_confirmed,
            isActive=user.is_active,
            isDelete=user.is_deleted,
            create_by=user.create_by,
            update_by=user.update_by,
            create_at=user.create_at,
            update_at=user.update_at,
            user_total_success_bookings=user.user_total_success_bookings,
            user_total_failed_bookings=user.user_total_failed_bookings,
            sale_total_bookings=user.sale_total_bookings,
            sale_success_percent=user.sale_success_percent,
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
            user_total_success_bookings=user_dto.user_total_success_bookings if user_dto.user_total_success_bookings is not None else 0,
            user_total_failed_bookings=user_dto.user_total_failed_bookings if user_dto.user_total_failed_bookings is not None else 0,
            sale_total_bookings=user_dto.sale_total_bookings if user_dto.sale_total_bookings is not None else 0,
            sale_success_percent=user_dto.sale_success_percent if user_dto.sale_success_percent is not None else 0.0,
        )