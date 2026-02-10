from pydantic import Field, BaseModel


class AddProductImageRequest(BaseModel):
    """Request DTO for adding an image to a product"""
    product_id: int = Field(..., alias='productId', description='Product ID')
    image_id: str = Field(..., alias='imageId', description='Image ID')
    is_main_image: bool = Field(..., alias='isMainImage', description='Is main image?')

    class Config:
        populate_by_name = True