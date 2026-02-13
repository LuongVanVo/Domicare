from exceptions.base import NotFoundException, ValidationException


class BookingNotFoundException(NotFoundException):
    """Booking not found exception"""
    def __init__(self, message: str = "Booking not found"):
        super().__init__(message)

class BookingStatusException(ValidationException):
    """Invalid booking status transition exception"""
    def __init__(self, message: str = "Cannot update booking with this status"):
        super().__init__(message)

class AlreadyPendingBookingException(ValidationException):
    """User already has a pending booking exception"""
    def __init__(self, message: str = "You already have a pending order for this product."):
        super().__init__(message)

class TooMuchBookingException(ValidationException):
    """Too many bookings in a short time exception"""
    def __init__(self, message: str = "You have placed more than 5 orders in the last 1 hour. Please try again later."):
        super().__init__(message)

class InvalidDateException(ValidationException):
    """Invalid date/time exception"""
    def __init__(self, message: str = "Invalid date or time"):
        super().__init__(message)

class AlreadySaleHandleException(ValidationException):
    """Booking already handled by another sale user exception"""
    def __init__(self, message: str = "This booking has already been handled by another sale user."):
        super().__init__(message)