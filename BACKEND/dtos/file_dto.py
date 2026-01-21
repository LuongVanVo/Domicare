from typing import Optional

from pydantic import BaseModel, Field
from datetime import datetime


class FileDTO(BaseModel):
    id: Optional[int] = Field(None, description='File ID')
    url: Optional[str] = Field(None, description='File URL')
    name: Optional[str] = Field(None, description='File name')
    type: Optional[str] = Field(None, description='File type')
    size: Optional[str] = Field(None, description='File size')
    create_by: Optional[str] = Field(None, description='Creator username')
    update_by: Optional[str] = Field(None, description='Last updater username')
    created_at: Optional[datetime] = Field(None, description='Creation timestamp')
    updated_at: Optional[datetime] = Field(None, description='Last update timestamp')

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat() if v else None,
        }