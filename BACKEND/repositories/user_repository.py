from typing import Optional
from models.user import User

# find user by email
def find_by_email(email: str) -> Optional[User]:
    try:
        return User.objects.select_related().prefetch_related('roles').get(email=email)
    except User.DoesNotExist:
        return None

# exists by email
def exists_by_email(email: str) -> bool:
    return User.objects.filter(email=email).exists()

# find user by id
def find_by_id(user_id: int) -> Optional[User]:
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None

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

    def find_by_id(self, user_id: int) -> Optional[User]:
        return find_by_id(user_id)

    def find_by_email_confirmation_token(self, token: str) -> Optional[User]:
        return find_by_email_confirmation_token(token)

    def save(self, user: User) -> User:
        return save(user)

    def create_user(self, email: str, password_hash: str, **kwargs) -> User:
        return create_user(email, password_hash, **kwargs)
