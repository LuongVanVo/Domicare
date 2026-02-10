from typing import Optional, List
from pydantic import BaseModel, Field, field_validator

class AddProductRequest(BaseModel):
    """Request DTO for adding a new product"""
    category_id: int = Field(..., alias='categoryId', description='Category ID')
    name: str = Field(..., min_length=1, description='Product name')
    description: str = Field(..., min_length=1, description='Product description')
    price: float = Field(..., gt=0, description='Product price')
    main_image_id: str = Field(..., alias='mainImageId', description='Main image file ID/Url')
    discount: Optional[float] = Field(None, ge=0, le=100, description='Discount percentage')
    landing_images: Optional[List[str]] = Field(
        None,
        alias='landingImages',
        description='List of landing image file IDs/Urls'
    )

    @field_validator('price')
    @classmethod
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError('Price must be greater than 0')
        return v

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Product name cannot be empty')
        return v

    @field_validator('description')
    @classmethod
    def validate_description(cls, v):
        if not v or not v.strip():
            raise ValueError('Product description cannot be empty')
        return v

    class Config:
        populate_by_name = True
