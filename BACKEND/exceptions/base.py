"""Base Exception Classes"""
from rest_framework.exceptions import APIException
from rest_framework import status


class BaseAPIException(APIException):
    """Base exception for all custom API exceptions"""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'An error occurred.'
    default_code = 'error'

    def __init__(self, detail=None, code=None):
        if detail is None:
            detail = self.default_detail
        if code is None:
            code = self.default_code
        super().__init__(detail, code)


class NotFoundException(BaseAPIException):
    """404 Not Found"""
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Resource not found.'
    default_code = 'not_found'


class BadRequestException(BaseAPIException):
    """400 Bad Request"""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Bad request.'
    default_code = 'bad_request'


class UnauthorizedException(BaseAPIException):
    """401 Unauthorized"""
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = 'Unauthorized.'
    default_code = 'unauthorized'


class ForbiddenException(BaseAPIException):
    """403 Forbidden"""
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'Forbidden.'
    default_code = 'forbidden'


class ConflictException(BaseAPIException):
    """409 Conflict"""
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'Resource conflict.'
    default_code = 'conflict'

class AlreadyExistsException(BaseAPIException):
    """409 Already Exists"""
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'Resource already exists.'
    default_code = 'exists'