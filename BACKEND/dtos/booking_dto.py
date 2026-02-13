from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from dtos.product_dto import ProductDTO
from dtos.user_dto import UserDTO

class BookingDTO(BaseModel):
    """Full booking DTO with all details"""
    id: Optional[int] = None
    address: str
    total_price: Optional[float] = Field(None, alias='totalPrice')
    note: Optional[str] = None
    start_time: datetime = Field(..., alias='startTime')
    products: Optional[List[ProductDTO]] = None
    user_dto: Optional[UserDTO] = Field(None, alias='userDTO')
    sale_dto: Optional[UserDTO] = Field(None, alias='saleDTO')
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