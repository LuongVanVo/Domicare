"""Chat DTOs for REST API"""
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class ConversationDTO(BaseModel):
    """DTO matching the Frontend's Conversation interface structure"""
    id: Optional[str] = Field(None, alias="_id")
    sender_id: str = Field(..., alias="sender_id")
    receiver_id: str = Field(..., alias="receiver_id")
    message: str
    created_at: Optional[datetime] = Field(None, alias="created_at")
    updated_at: Optional[datetime] = Field(None, alias="updated_at")

    class Config:
        populate_by_name = True
        from_attributes = True

class CursorDTO(BaseModel):
    """Cursor pagination DTO"""
    last_updated_at: str
    last_message_id: str

class ConversationResponseDTO(BaseModel):
    """Wrapper response for a list of conversations/messages with cursor"""
    cursor: Optional[CursorDTO] = None
    data: List[ConversationDTO]
