"""Chat Mapper for Model-DTO conversions"""
from dtos.chat_dto import ConversationDTO
from models.chat import Message

class ChatMapper:
    """Mapper to convert Message database entity to DTO and vice-versa"""
    @staticmethod
    def to_dto(message: Message) -> ConversationDTO:
        """Convert Message database entity to ConversationDTO"""
        return ConversationDTO(
            _id=str(message.id),
            sender_id=str(message.sender_id),
            receiver_id=str(message.receiver_id),
            message=message.message,
            created_at=message.created_at,
            updated_at=message.updated_at
        )
