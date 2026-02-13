from datetime import datetime
from typing import Optional, Tuple, List
from models.user import User
from utils.format_string import FormatStringAccents


# find user by email
def find_by_email(email: str) -> Optional[User]:
    try:
        return User.objects.select_related().prefetch_related('roles').get(email=email)
    except User.DoesNotExist:
        return None

# exists by email
def exists_by_email(email: str) -> bool:
    return User.objects.filter(email=email).exists()

# find by email confirmation token
def find_by_email_confirmation_token(token: str) -> Optional[User]:
    try:
        return User.objects.get(email_confirmation_token=token, is_deleted=False)
    except User.DoesNotExist:
        return None

# save user
def save(user: User) -> User:
    user.save()
    return user

# create user
def create_user(email: str, password_hash: str, **kwargs) -> User:
    user = User(
        email=email,
        password=password_hash,
        **kwargs
    )
    user.save()
    return user

class UserRepository:
    def find_by_email(self, email: str) -> Optional[User]:
        return find_by_email(email)

    def exists_by_email(self, email: str) -> bool:
        return exists_by_email(email)

    def find_by_email_confirmation_token(self, token: str) -> Optional[User]:
        return find_by_email_confirmation_token(token)

    def save(self, user: User) -> User:
        return save(user)

    def create_user(self, email: str, password_hash: str, **kwargs) -> User:
        return create_user(email, password_hash, **kwargs)

    @staticmethod
    def find_all_paginated(
        page: int = 1,
        page_size: int = 20,
        search_name: Optional[str] = None,
        search_role_name: Optional[str] = None,
        sort_by: str = 'create_at',
        sort_direction: str = 'desc',
    ) -> Tuple[List[User], int]:
        """Find all users with pagination and filtering"""
        queryset = User.objects.prefetch_related('roles').filter(is_deleted=False)

        # Search by name
        if search_name and search_name.strip():
            clean_search_name = FormatStringAccents.remove_accents(search_name)
            queryset = queryset.filter(name_unsigned__icontains=clean_search_name)

        # Filter by role name
        if search_role_name and search_role_name.strip():
            queryset = queryset.filter(roles__name__icontains=search_role_name)

        # Sorting
        sort_field = sort_by if sort_direction == 'asc' else f'-{sort_by}'
        queryset = queryset.order_by(sort_field)

        # Get total count
        total = queryset.count()

        # Pagination
        start = (page - 1) * page_size
        end = start + page_size
        users = list(queryset[start:end])

        return users, total

    @staticmethod
    def soft_delete_by_id(user_id: int) -> None:
        """Soft delete user by ID"""
        User.objects.filter(id=user_id).update(is_deleted=True)

    @staticmethod
    def count_all_users_between(role_name: str, start_date: datetime, end_date: datetime) -> int:
        """Count users with specific role created between two dates"""
        return User.objects.filter(
            roles__name=role_name,
            create_at__gte=start_date,
            create_at__lte=end_date,
        ).count()

    @staticmethod
    def find_by_id(user_id: int) -> Optional[User]:
        """Find user by ID"""
        try:
            return User.objects.prefetch_related('roles').get(id=user_id)
        except User.DoesNotExist:
            return None

    @staticmethod
    def exists_by_id(user_id: int) -> bool:
        """Check if user exists by ID"""
        return User.objects.filter(id=user_id).exists()