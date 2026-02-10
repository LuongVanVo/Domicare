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
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    CANCELLED = "canceled"
    FAILED = "failed"
    SUCCESS = "success"

    @classmethod
    def choices(cls):
        return [(status.value, status.name.title()) for status in cls]

    def __str__(self):
        return self.value


class PaymentStatus(str, Enum):
    """Payment status enumeration"""
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELED = "canceled"

    @classmethod
    def choices(cls):
        return [(status.value, status.name.title()) for status in cls]

    def __str__(self):
        return self.value
