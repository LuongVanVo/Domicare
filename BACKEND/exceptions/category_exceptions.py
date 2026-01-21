"""Category Exceptions"""
from .base import NotFoundException, ConflictException, BadRequestException, AlreadyExistsException
from .constants import ExceptionConstants


class CategoryNotFoundException(NotFoundException):
    """Category not found exception"""
    def __init__(self, message='Category not found'):
        super().__init__(message)

class CategoryAlreadyExistsException(AlreadyExistsException):
    def __init__(self, message='Category already exists'):
        super().__init__(message)


class CategoryNameExistsException(ConflictException):
    """Category name exists exception"""
    default_detail = ExceptionConstants.CATEGORY_NAME_EXISTS


class CategoryHasProductsException(BadRequestException):
    """Category has products exception"""
    default_detail = ExceptionConstants.CATEGORY_HAS_PRODUCTS
