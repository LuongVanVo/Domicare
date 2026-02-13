from typing import Optional
from pydantic import BaseModel, Field
from datetime import date

class UpdateUserRequest(BaseModel):
    """Request DTO for updating information"""
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[date] = Field(None, alias="dateOfBirth")
    gender: Optional[str] = None
    old_password: Optional[str] = Field(None, alias="oldPassword")
    new_password: Optional[str] = Field(None, alias="newPassword")
    image_id: Optional[str] = Field(None, alias="imageId")

    class Config:
        populate_by_name = True