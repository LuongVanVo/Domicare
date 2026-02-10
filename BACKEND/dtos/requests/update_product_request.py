from typing import Optional, List

from pydantic import BaseModel, Field, field_validator


class UpdateProductRequest(BaseModel):
    """Request DTO for updating an existing product"""
    old_category_id: int = Field(..., alias='oldCategoryId', description='Old category ID of the product')
    old_product_id: int = Field(..., alias='oldProductId', description='Product ID to update')
    category_id: int = Field(..., alias='categoryId', description='New category ID for the product')
    name: Optional[str] = Field(None, description='Product name for the product')
    description: Optional[str] = Field(None, description='Product description for the product')
    price: Optional[float] = Field(None, gt=0, description='Product price for the product')
    main_image_id: Optional[str] = Field(None, alias='mainImageId', description='Main image file ID/URL')
    discount: Optional[float] = Field(None, ge=0, le=100, description='Discount percentage for the product')
    landing_images: Optional[List[str]] = Field(None, alias='landingImages', description='Landing image file ID/URLs')

    @field_validator('price')
    @classmethod
    def validate_price(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Price must be greater than 0')
        return v

    class Config:
        populate_by_name = True