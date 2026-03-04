"""Enums for Models"""
from enum import Enum

class Gender(str, Enum):
    """Gender enumeration"""
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

    @classmethod
    def choices(cls):
        return [(gender.value, gender.name.title()) for gender in cls]

    def __str__(self):
        return self.value


class BookingStatus(str, Enum):
    """Booking status enumeration"""
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"
    FAILED = "FAILED"
    SUCCESS = "SUCCESS"

    @classmethod
    def choices(cls):
        return [(status.value, status.name.title()) for status in cls]

    def __str__(self):
        return self.value


class PaymentStatus(str, Enum):
    """Payment status enumeration"""
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    CANCELED = "CANCELED"

    @classmethod
    def choices(cls):
        return [(status.value, status.name.title()) for status in cls]

    def __str__(self):
        return self.value
