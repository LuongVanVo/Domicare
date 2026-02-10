from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from dtos.user_dto import UserDTO


class ReviewDTO(BaseModel):
    """Review DTO for response"""
    id: Optional[int] = None
    rating: int
    comment: Optional[str] = None
    product_id: Optional[int] = Field(None, alias="productId")
    user_dto: Optional[UserDTO] = Field(None, alias="userDTO")
    create_by: Optional[str] = Field(None, alias='createBy')
    update_by: Optional[str] = Field(None, alias='updateBy')
    create_at: Optional[datetime] = Field(None, alias='createAt')
    update_at: Optional[datetime] = Field(None, alias='updateAt')

    class Config:
        from_attributes = True
        populate_by_name = True

class ReviewResponse(BaseModel):
    """Review Response"""
    id: int
    rating: int
    comment: Optional[str] = None
    product_id: int = Field(..., alias="productId")
    user_dto: Optional[UserDTO] = Field(None, alias="userDTO")
    create_by: Optional[str] = Field(None, alias='createBy')
    update_by: Optional[str] = Field(None, alias='updateBy')
    create_at: Optional[datetime] = Field(None, alias='createAt')
    update_at: Optional[datetime] = Field(None, alias='updateAt')

    class Config:
        from_attributes = True
        populate_by_name = True