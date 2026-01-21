"""File Exceptions"""
from .base import NotFoundException, ConflictException, BadRequestException
from .constants import ExceptionConstants


class FileNotFoundException(NotFoundException):
    """File not found exception"""
    def __init__(self, message='File not found'):
        super().__init__(message)

class FileUrlExistsException(ConflictException):
    """File URL exists exception"""
    default_detail = ExceptionConstants.FILE_URL_EXISTS


class InvalidFileTypeException(BadRequestException):
    """Invalid file type exception"""
    default_detail = ExceptionConstants.INVALID_FILE_TYPE


class FileTooLargeException(BadRequestException):
    """File too large exception"""
    default_detail = ExceptionConstants.FILE_TOO_LARGE

class FileUploadException(Exception):
    """Exception raised when file upload fails"""
    def __init__(self, message='File upload failed'):
        super().__init__(message)
        self.message = message
