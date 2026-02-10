from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class ProductDTO(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None
    price: float
    image: Optional[str] = None
    rating_star: Optional[float] = Field(None, alias='ratingStar')
    discount: Optional[float] = None
    price_after_discount: Optional[float] = Field(None, alias='priceAfterDiscount')
    landing_images: Optional[List[str]] = Field(None, alias='landingImages')
    category_id: Optional[int] = Field(None, alias='categoryId')
    review_dtos: Optional[List[dict]] = Field(None, alias='reviewDtos')
    create_by: Optional[str] = None
    update_by: Optional[str] = None
    create_at: Optional[datetime] = None
    update_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        populate_by_name = True

class CategoryMini(BaseModel):
    """Category minial info for ProductResponse"""
    id: int
    name: str
    image: Optional[str] = None

    class Config:
        from_attributes = True

class ProductResponse(BaseModel):
    """Product response with category info"""
    id: int
    name: str
    description: Optional[str] = None
    price: float
    image: Optional[str] = None
    rating_star: Optional[float] = Field(None, alias='ratingStar')
    discount: Optional[float] = None
    price_after_discount: Optional[float] = Field(None, alias='priceAfterDiscount')
    landing_images: Optional[List[str]] = Field(None, alias='landingImages')
    category_mini: Optional[CategoryMini] = Field(None, alias='categoryMini')
    review_dtos: Optional[List[dict]] = Field(None, alias='reviewDtos')
    create_by: Optional[str] = None
    update_by: Optional[str] = None
    create_at: Optional[datetime] = None
    update_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        populate_by_name = True

class ProductMini(BaseModel):
    """Minimal product info"""
    id: int
    name: str
    description: Optional[str] = None
    price: float
    image: Optional[str] = None
    rating_star: Optional[float] = Field(None, alias='ratingStar')
    discount: Optional[float] = None
    price_after_discount: Optional[float] = Field(None, alias='priceAfterDiscount')
    category_mini: Optional[CategoryMini] = Field(None, alias='categoryMini')

    class Config:
        from_attributes = True
        populate_by_name = True