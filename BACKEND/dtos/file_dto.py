from typing import Optional

from pydantic import BaseModel, Field
from datetime import datetime


class FileDTO(BaseModel):
    id: Optional[int] = Field(None, description='File ID')
    url: Optional[str] = Field(None, description='File URL')
    name: Optional[str] = Field(None, description='File name')
    type: Optional[str] = Field(None, description='File type')
    size: Optional[str] = Field(None, description='File size')
    create_by: Optional[str] = Field(None, alias="createBy", description='Creator username')
    update_by: Optional[str] = Field(None, alias="updateBy", description='Last updater username')
    created_at: Optional[datetime] = Field(None, alias="createAt", description='Creation timestamp')
    updated_at: Optional[datetime] = Field(None, alias="updateAt", description='Last update timestamp')

    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat() if dt else None,
        }

    def to_dict(self) -> dict:
        """Convert to dict with camelCase keys"""
        return self.model_dump(by_alias=True, exclude_none=False)