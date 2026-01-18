"""Authentication Exceptions"""
from .base import UnauthorizedException, BadRequestException
from .constants import ExceptionConstants

class AuthException(Exception):
    pass
class InvalidEmailOrPassword(UnauthorizedException):
    """Invalid credentials exception"""
    def __init__(self, detail="Email chưa được đăng ký hoặc mật khẩu sa"):
        super().__init__(detail=detail)


class EmailNotConfirmedException(UnauthorizedException):
    """Email not confirmed exception"""
    def __init__(self, detail="Email chưa được xác thực."):
        super().__init__(detail=detail)

class InvalidTokenException(UnauthorizedException):
    """Invalid token exception"""
    def __init__(self, detail="Invalid token"):
        super().__init__(detail=detail)

class InvalidRefreshTokenException(AuthException):
    def __init__(self, message="Invalid or expired refresh token"):
        self.message = message
        super().__init__(self.message)

class TokenExpiredException(UnauthorizedException):
    """Token expired exception"""
    def __init__(self, detail="Token has expired"):
        super().__init__(detail=detail)


class RefreshTokenNotFoundException(UnauthorizedException):
    """Refresh token not found exception"""
    def __init__(self, detail="Refresh token not found"):
        super().__init__(detail=detail)
