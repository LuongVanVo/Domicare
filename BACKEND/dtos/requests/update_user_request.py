from typing import Optional
from pydantic import BaseModel, Field, field_validator
from datetime import date, datetime


class UpdateUserRequest(BaseModel):
    """Request DTO for updating user information"""
    name: Optional[str] = Field(None, alias="fullName")
    phone: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[date] = Field(None, alias="dateOfBirth")
    gender: Optional[str] = None
    old_password: Optional[str] = Field(None, alias="oldPassword")
    new_password: Optional[str] = Field(None, alias="newPassword")
    confirm_password: Optional[str] = Field(None, alias="confirmPassword")
    image_id: Optional[str] = Field(None, alias="imageId")

    @field_validator('date_of_birth', mode='before')
    @classmethod
    def parse_date_of_birth(cls, v):
        """Parse date_of_birth - convert datetime to date"""
        if not v:
            return None

        # Nếu đã là date (không phải datetime), trả về luôn
        if isinstance(v, date) and not isinstance(v, datetime):
            return v

        # Nếu là string, parse thành datetime rồi lấy phần date
        if isinstance(v, str):
            v = v.replace('Z', '+00:00')
            try:
                parsed_dt = datetime.fromisoformat(v)
                return parsed_dt.date()  # Chỉ lấy phần date
            except ValueError:
                try:
                    return datetime.strptime(v, '%Y-%m-%d').date()
                except ValueError:
                    raise ValueError('Invalid date format')

        # Nếu là datetime object, lấy phần date
        if isinstance(v, datetime):
            return v.date()

        raise ValueError('Date of birth must be a valid date')

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError('Name must not be empty')
        return v

    @field_validator('address')
    @classmethod
    def validate_address(cls, v):
        if v is not None:
            return v.strip()
        return v

    @field_validator('gender')
    @classmethod
    def validate_gender(cls, v):
        if v is not None:
            v = v.upper()
            if v not in ['MALE', 'FEMALE', 'OTHER']:
                raise ValueError('Gender must be MALE, FEMALE, or OTHER')
        return v

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "fullName": "Nguyen Van A",
                "phone": "0123456789",
                "address": "123 Street",
                "dateOfBirth": "2000-01-01",
                "gender": "MALE",
                "oldPassword": "oldpass123",
                "newPassword": "newpass123",
                "imageId": "1"
            }
        }
