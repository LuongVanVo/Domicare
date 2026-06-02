from typing import Optional, List

from pydantic import BaseModel, Field
from datetime import datetime


class CategoryDTO(BaseModel):
    id: Optional[int] = Field(None, description='Category ID')
    name: Optional[str] = Field(None, description='Category name')
    description: Optional[str] = Field(None, description='Category description')
    image: Optional[str] = Field(None, description='Category image URL')
    create_by: Optional[str] = Field(None, alias="createBy", description='Creator username')
    update_by: Optional[str] = Field(None, alias="updateBy", description='Last updater username')
    create_at: Optional[datetime] = Field(None, alias="createAt", description='Creation timestamp')
    update_at: Optional[datetime] = Field(None, alias="updateAt", description='Last update timestamp')
    products: Optional[List] = Field(None, description='List of products')

    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

    def to_dict(self) -> dict:
        """Convert to dict with camelCase keys"""
        return self.model_dump(by_alias=True, exclude_none=False)
