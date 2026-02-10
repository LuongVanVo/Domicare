from pydantic import BaseModel, Field, field_validator


class ReviewRequest(BaseModel):
    """Request DTO for creating a review"""
    product_id: int = Field(..., alias="productId", description="Product ID")
    rating: int = Field(..., alias="rating", description="Rating from 1 to 5")
    comment: str = Field(None, alias="comment", description="Review comment")

    @field_validator('product_id')
    @classmethod
    def validate_product_id(cls, v):
        if not v:
            raise ValueError('Product ID must not be null')
        return v

    @field_validator('rating')
    @classmethod
    def validate_rating(cls, v):
        if not v:
            raise ValueError('Rating must not be null')
        if v < 1 or v > 5:
            raise ValueError('Rating must be between 1 and 5')
        return v

    class Config:
        populate_by_name = True