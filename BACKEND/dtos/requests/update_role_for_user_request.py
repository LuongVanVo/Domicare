from typing import List

from pydantic import BaseModel, Field, field_validator


class UpdateRoleForUserRequest(BaseModel):
    """Request DTO for updating user roles (admin only)"""
    user_id: int = Field(..., alias='userId')
    role_ids: List[int] = Field(..., alias='roleIds')

    @field_validator('role_ids')
    @classmethod
    def validate_role_ids(cls, v):
        if not v or len(v) == 0:
            raise ValueError('role_ids cannot be empty')
        return v

    class Config:
        populate_by_name = True