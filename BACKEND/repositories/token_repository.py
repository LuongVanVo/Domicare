from typing import Optional

from models.token import Token
from models.user import User


# find by refresh token
def find_by_refresh_token(refresh_token: str) -> Optional[Token]:
    try:
        return Token.objects.select_related('user').get(refresh_token=refresh_token)
    except Token.DoesNotExist:
        return None

# find token by user id
def find_by_user_id(user_id: int) -> list[Token]:
    return list(Token.objects.filter(user_id=user_id))

# save token
def save(token: Token) -> Token:
    token.save()
    return token

# delete token
def delete(token: Token):
    token.delete()

# delete all
def delete_all(tokens: list[Token]):
    token_ids = [t.id for t in tokens]
    Token.objects.filter(id__in=token_ids).delete()

# delete by user id
def delete_by_user_id(user_id: int):
    Token.objects.filter(user_id=user_id).delete()

# create token
def create_token(user: User, refresh_token: str, expiration) -> Token:
    token = Token(
        user=user,
        refresh_token=refresh_token,
        expiration=expiration
    )
    token.save()
    return token

class TokenRepository:
    def find_by_refresh_token(self, refresh_token: str) -> Optional[Token]:
        return find_by_refresh_token(refresh_token)

    def find_by_user_id(self, user_id: int) -> list[Token]:
        return find_by_user_id(user_id)

    def save(self, token: Token) -> Token:
        return save(token)

    def delete(self, token: Token):
        delete(token)

    def delete_all(self, tokens: list[Token]):
        delete_all(tokens)

    def delete_by_user_id(self, user_id: int):
        delete_by_user_id(user_id)

    def create_token(self, user: User, refresh_token: str, expiration) -> Token:
        return create_token(user, refresh_token, expiration)