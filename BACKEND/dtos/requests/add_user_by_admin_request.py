from typing import Optional
from datetime import date
from pydantic import BaseModel, Field, field_validator

class AddUserByAdminRequest(BaseModel):
    """Request DTO for admin to create a new user"""
    name: str = Field(..., description="User name")
    email: str = Field(..., description="User email")
    password: str = Field(..., description="User password")
    phone: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[date] = Field(None, alias='dateOfBirth')
    gender: Optional[str] = None
    avatar: Optional[str] = None
    role_id: int = Field(..., alias='roleId', description="Role ID to assign")

    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        if not v or '@' not in v:
            raise ValueError('Invalid email address')
        return v.lower().strip()

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if not v or len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v

    class Config:
        populate_by_name = True