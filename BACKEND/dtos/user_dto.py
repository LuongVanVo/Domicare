from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, model_validator
from datetime import datetime
from dtos.role_dto import RoleDTO

class UserDTO(BaseModel):
    id: Optional[int] = None
    _id: Optional[str] = None
    name: Optional[str] = None
    email: EmailStr
    password: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    avatar: Optional[str] = None
    google_id: Optional[str] = Field(None, alias="googleId")
    gender: Optional[str] = None
    is_active: Optional[bool] = Field(True, alias="isActive")
    is_delete: Optional[bool] = Field(False, alias="isDelete")
    date_of_birth: Optional[datetime] = Field(None, alias="dateOfBirth")
    is_email_confirmed: bool = Field(False, alias="isEmailConfirmed")
    email_confirmation_token: Optional[str] = Field(None, alias="emailConfirmationToken")
    create_by: Optional[str] = Field(None, alias="createBy")
    update_by: Optional[str] = Field(None, alias="updateBy")
    create_at: Optional[datetime] = Field(None, alias="createAt")
    update_at: Optional[datetime] = Field(None, alias="updateAt")
    user_total_success_bookings: Optional[int] = Field(0, alias="userTotalSuccessBookings")
    user_total_failed_bookings: Optional[int] = Field(0, alias="userTotalFailedBookings")
    sale_total_bookings: Optional[int] = Field(0, alias="saleTotalBookings")
    sale_success_percent: Optional[float] = Field(0.0, alias="saleSuccessPercent")
    roles: Optional[List[RoleDTO]] = []

    @model_validator(mode='after')
    def set_id_compat(self) -> 'UserDTO':
        if self.id is not None and self._id is None:
            self._id = str(self.id)
        return self

    class Config:
        populate_by_name = True
        from_attributes = True # For ORM compatibility

    def to_dict(self) -> dict:
        """Convert to dict with camelCase keys"""
        return self.model_dump(by_alias=True, exclude_none=False)