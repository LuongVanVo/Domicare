"""JWT Authentication Middleware for Django Channels"""
import logging
from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser

from repositories.user_repository import UserRepository
from services.jwt_service import JwtService

logger = logging.getLogger(__name__)

@database_sync_to_async
def get_user_from_db(email):
    """Asynchronously fetch user by email using UserRepository"""
    try:
        user_repo = UserRepository()
        return user_repo.find_by_email(email)
    except Exception as e:
        logger.error(f"[WS Auth] Error finding user by email '{email}': {e}")
        return None

class JWTAuthMiddleware:
    """
    Middleware for Channels that authenticates connections via a JWT token.
    Expects connection path to contain query param: ?token=<jwt_token>
    """
    def __init__(self, inner):
        self.inner = inner
        self.jwt_service = JwtService()

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode("utf-8")
        query_params = parse_qs(query_string)
        token_list = query_params.get("token")

        # Default to AnonymousUser
        scope['user'] = AnonymousUser()

        if token_list:
            token = token_list[0]
            try:
                payload = self.jwt_service.verify_access_token(token)
                if payload:
                    email = payload.get("email")
                    if email:
                        user = await get_user_from_db(email)
                        if user:
                            scope['user'] = user
                            logger.info(f"[WS Auth] Successfully authenticated user: {email}")
                        else:
                            logger.warning(f"[WS Auth] User not found for email: {email}")
                else:
                    logger.warning("[WS Auth] Invalid or expired JWT token provided")
            except Exception as e:
                logger.error(f"[WS Auth] Error during JWT validation: {e}")
        else:
            logger.info("[WS Auth] Connection attempt without token")

        return await self.inner(scope, receive, send)

def JWTAuthMiddlewareStack(inner):
    """Helper wrapper function to conform with typical stack naming conventions"""
    return JWTAuthMiddleware(inner)
