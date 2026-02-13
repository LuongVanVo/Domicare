import re
from datetime import datetime, timezone as dt_timezone
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator, model_validator
from django.utils import timezone


class BookingRequest(BaseModel):
    """Request DTO for creating a booking"""
    name: Optional[str] = None
    phone: str = Field(..., description='Phone number (10-11 digits)')
    address: str = Field(..., description='Booking address')
    product_ids: List[int] = Field(..., alias='productIds', description='List of product ids')
    is_periodic: bool = Field(..., alias='isPeriodic', description='Is this a periodic booking?')
    note: Optional[str] = None
    start_time: datetime = Field(..., alias='startTime', description='Booking start time')
    guest_email: Optional[str] = Field(None, alias='guestEmail', description='Guest email (for non-logged-in users)')

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if not v:
            raise ValueError('Phone number cannot be empty')
        if not re.match(r'^[0-9]{10,11}$', v):
            raise ValueError('Phone number must be 10 or 11 digits')
        return v

    @field_validator('address')
    @classmethod
    def validate_address(cls, v):
        if not v or not v.strip():
            raise ValueError('Address cannot be empty')
        return v.strip()

    @field_validator('product_ids')
    @classmethod
    def validate_product_ids(cls, v):
        if not v or len(v) == 0:
            raise ValueError('At least one product is required')
        return v

    @field_validator('start_time', mode='before')
    @classmethod
    def validate_start_time(cls, v):
        """Validate and normalize start_time to UTC aware datetime"""
        if not v:
            raise ValueError('Start time cannot be empty')

        if isinstance(v, str):
            v = v.replace('Z', '+00:00')
            try:
                v = datetime.fromisoformat(v)
            except ValueError:
                raise ValueError('Invalid datetime format. Use ISO 8601 format (e.g., 2026-02-14T08:00:00Z)')

        # Make aware if naive (no timezone info)
        if timezone.is_naive(v):
            v = timezone.make_aware(v, dt_timezone.utc)

        # Convert to UTC
        v = v.astimezone(dt_timezone.utc)

        # Business logic validation moved to Service
        return v
    @model_validator(mode='after')
    def validate_guest_fields(self):
        """If guestEmail is provided, name is required"""
        if self.guest_email and (not self.name or not self.name.strip()):
            raise ValueError('Name is required when booking as guest')
        return self

    class Config:
        populate_by_name = True