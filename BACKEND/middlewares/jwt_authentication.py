import logging
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from repositories.user_repository import UserRepository
from services.jwt_service import JwtService

logger = logging.getLogger(__name__)


class JwtAuthenticationMiddleware(BaseAuthentication):
    def __init__(self, get_response=None):
        self.get_response = get_response
        self.jwt_service = JwtService()
        self.user_repo = UserRepository()

    def __call__(self, request):
        """Dùng cho Django middleware"""
        self.process_request(request)
        response = self.get_response(request)
        return response

    def authenticate(self, request):
        """Dùng cho DRF authentication"""
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return None

        try:
            parts = auth_header.split()
            if len(parts) != 2 or parts[0].lower() != 'bearer':
                return None

            token = parts[1]
            payload = self.jwt_service.verify_access_token(token)

            if not payload:
                raise AuthenticationFailed('Invalid or expired token')

            email = payload.get('email')
            if not email:
                raise AuthenticationFailed('Token payload invalid')

            user = self.user_repo.find_by_email(email)
            if not user:
                raise AuthenticationFailed('User not found')

            logger.info(f'[JWT] Authentication successful for user {email}')
            return (user, token)

        except Exception as e:
            logger.error(f'[JWT] Authentication failed: {str(e)}')
            raise AuthenticationFailed(str(e))

    def process_request(self, request):
        """Process request for middleware"""
        public_paths = ['/login', '/register', '/refresh-token', '/verify-email']
        if any(request.path.startswith(path) for path in public_paths):
            return None

        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return None

        token = auth_header[7:]

        try:
            payload = self.jwt_service.verify_access_token(token)
            email = payload.get('email')

            user = self.user_repo.find_by_email(email)
            if user:
                request.user = user
                request.email = email
                logger.debug(f"[JWT] Authenticated user: {email}")

        except Exception as e:
            logger.warning(f"[JWT] Authentication failed: {str(e)}")

        return None
