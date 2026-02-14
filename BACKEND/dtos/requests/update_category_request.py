from typing import Optional, Union

from pydantic import BaseModel, Field, validator


class UpdateCategoryRequest(BaseModel):
    category_id: int = Field(
        ...,
        gt=0,
        description='ID of the category to update',
        alias='categoryId'
    )

    name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=100,
        description='New name for the category',
    )

    description: Optional[str] = Field(
        None,
        max_length=500,
        description='New description for the category',
    )

    image_id: Optional[Union[int, str]] = Field(
        None,
        description='ID/URL of the new image',
        alias='imageId'
    )

    @validator('name')
    def validate_name(cls, v):
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError('Name category must not be empty')
        return v

    @validator('description')
    def validate_description(cls, v):
        if v is not None:
            return v.strip()
        return v

    @validator('image_id')
    def validate_image_id(cls, v):
        if v is not None and isinstance(v, str):
            v = v.strip()
            if not v:
                raise ValueError('Image ID/URL must not be empty')
        return v