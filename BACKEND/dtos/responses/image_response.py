from typing import Optional

from pydantic import BaseModel, Field


class ImageResponse(BaseModel):
    url: str = Field(..., description='Image url')
    name: Optional[str] = Field(None, description='Image name')
    type: Optional[str] = Field(None, description='Image type')

    class Config:
        from_attributes = True
