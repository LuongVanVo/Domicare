from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class ProductMini(BaseModel):
    """Mini product info for booking response"""
    id: int
    name: str
    image: Optional[str] = None
    price: Optional[float] = None
    discount: Optional[float] = None

    class Config:
        from_attributes = True

class UserMini(BaseModel):
    """Mini user info for booking response"""
    id: int
    name: Optional[str] = None
    email: str
    avatar: Optional[str] = None
    phone: Optional[str] = None

    class Config:
        from_attributes = True

class MiniBookingResponse(BaseModel):
    """Minimal booking response with essential info"""
    id: Optional[int] = None
    address: str
    total_price: Optional[float] = Field(None, alias='totalPrice')
    note: Optional[str] = None
    start_time: datetime = Field(..., alias='startTime')
    products: Optional[List[ProductMini]] = None
    user_dto: Optional[UserMini] = Field(None, alias='userDTO')
    sale_dto: Optional[UserMini] = Field(None, alias='saleDTO')
    is_periodic: Optional[bool] = Field(None, alias='isPeriodic')
    booking_status: Optional[str] = Field(None, alias='bookingStatus')
    phone: Optional[str] = None

    # Audit fields
    create_by: Optional[str] = Field(None, alias='createBy')
    update_by: Optional[str] = Field(None, alias='updateBy')
    create_at: Optional[datetime] = Field(None, alias='createAt')
    update_at: Optional[datetime] = Field(None, alias='updateAt')

    class Config:
        from_attributes = True
        populate_by_name = True