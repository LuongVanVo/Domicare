from pydantic import BaseModel, Field, validator


class AddCategoryRequest(BaseModel):
    name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description='Name of category'
    )

    description: str = Field(
        None,
        max_length=500,
        description='Description of the category'
    )

    image_id: int = Field(
        ...,
        description='ID/URL of image'
    )

    @validator('name')
    def validate_name(cls, v):
        if not v or not v.strip():
            raise validators.ValidationError('Name category must not be empty')
        return v.strip()

    @validator('description')
    def validate_description(cls, v):
        if v:
            return v.strip()
        return v