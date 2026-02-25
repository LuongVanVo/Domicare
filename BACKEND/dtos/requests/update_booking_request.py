from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator

class UpdateBookingRequest(BaseModel):
    """Request DTO for updating a booking."""
    booking_id: int = Field(..., alias='bookingId')
    name: Optional[str] = Field(None, description="Customer name")
    address: Optional[str] = Field(None, description="Booking address")
    is_periodic: Optional[bool] = Field(None, alias='isPeriodic')
    note: Optional[str] = None
    start_time: Optional[datetime] = Field(None, alias='startTime')
    status: Optional[str] = Field(None, description="Booking status")
    phone: Optional[str] = Field(None, description="Phone number")
    product_id: Optional[int] = Field(None, alias='productId', description="Product ID")

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Name must not be empty')
        return v.strip()

    @field_validator('address')
    @classmethod
    def validate_address(cls, v):
        if not v or not v.strip():
            raise ValueError('Address must not be empty')
        return v.strip()

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if not v:
            raise ValueError('Phone number must not be empty')
        return v.strip()

    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        if not v or not v.strip():
            raise ValueError('Status must not be empty')
        return v.strip()

    class Config:
        populate_by_name = True