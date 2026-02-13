from pydantic import BaseModel, Field, field_validator

class UpdateBookingStatusRequest(BaseModel):
    """Request DTO for updating booking status"""
    booking_id: int = Field(..., alias='bookingId')
    status: str = Field(..., description='New booking status')

    @field_validator('booking_id')
    @classmethod
    def validate_booking_id(cls, v):
        if not v:
            raise ValueError('booking_id cannot be empty')
        return v

    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        if not v or not v.strip():
            raise ValueError('status cannot be empty')
        return v.strip().upper()

    class Config:
        populate_by_name = True