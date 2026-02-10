"""Product Exceptions"""
from .base import NotFoundException, ConflictException, BadRequestException, ValidationException
from .constants import ExceptionConstants


class ProductNotFoundException(NotFoundException):
    """Product not found exception"""
    default_detail = ExceptionConstants.PRODUCT_NOT_FOUND


class ProductNameExistsException(ConflictException):
    """Product name exists exception"""
    default_detail = ExceptionConstants.PRODUCT_NAME_EXISTS


class ProductDeletedException(BadRequestException):
    """Product deleted exception"""
    default_detail = ExceptionConstants.PRODUCT_DELETED

class UrlAlreadyExistsException(ValidationException):
    """Exception raised when URL already exists"""
    def __init__(self, message: str = 'URL already exists'):
        super().__init__(message)
