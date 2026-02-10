from exceptions.base import ValidationException, NotFoundException


class AlreadyReviewProductException(ValidationException):
    """Exception raised when user already reviewed a product"""
    def __init__(self, message: str = "You have already reviewed this product"):
        super().__init__(message)

class NotBookedProductException(ValidationException):
    """Exception raised when user tries to review without booking"""
    def __init__(self, message: str = "User has not booked this product yet"):
        super().__init__(message)


class ReviewNotFoundException(NotFoundException):
    """Exception raised when review is not found"""
    def __init__(self, message: str = "Review not found"):
        super().__init__(message)