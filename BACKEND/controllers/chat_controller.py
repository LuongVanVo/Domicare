"""Chat Controller for REST API endpoints"""
import logging
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from django.utils import dateparse
from rest_framework import status as http_status

from models.user import User
from models.chat import Message
from mappers.chat_mapper import ChatMapper
from utils.rest_response import RestResponse

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversations(request: Request):
    """
    GET /api/v1/conversations/receivers
    Get list of unique users the current user has chatted with.
    """
    try:
        current_user = request.user
        # Find all messages involving the current user, ordered by newest first
        messages = Message.objects.filter(
            Q(sender=current_user) | Q(receiver=current_user)
        ).order_by('-created_at')

        # Extract unique users
        chat_partners = {}
        for msg in messages:
            partner = msg.receiver if msg.sender == current_user else msg.sender
            if partner.id not in chat_partners:
                chat_partners[partner.id] = {
                    "user": partner,
                    "last_message": msg
                }

        # Map to response format
        data = []
        for partner_id, info in chat_partners.items():
            user_dto = {
                "_id": str(info["user"].id),
                "id": info["user"].id,
                "name": info["user"].full_name,
                "email": info["user"].email,
                "avatar": info["user"].avatar,
            }
            data.append({
                "receiver": user_dto,
                "last_message": ChatMapper.to_dto(info["last_message"]).model_dump(by_alias=True)
            })

        return RestResponse.success(data=data)
    except Exception as e:
        logger.error(f"[Chat Controller] Error getting conversations: {e}")
        return RestResponse.error(
            message="Failed to load conversations",
            status=http_status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversation_with_receiver(request: Request, receiver_id: str):
    """
    GET /api/v1/conversations/receivers/<receiver_id>
    Get chat messages between current user and specified receiver with cursor pagination.
    """
    try:
        current_user = request.user
        limit = int(request.query_params.get('limit', 10))
        last_updated_at_str = request.query_params.get('last_updated_at')
        last_message_id = request.query_params.get('last_message_id')

        # Convert receiver_id to integer
        try:
            other_user_id = int(receiver_id)
        except ValueError:
            logger.warning(f"[Chat Controller] Invalid receiver_id format: '{receiver_id}'")
            return RestResponse.error(
                message="Invalid receiver ID format",
                status=http_status.HTTP_400_BAD_REQUEST
            )

        # Handle MongoDB-compatibility: If customer queries their own ID, map to Admin
        if other_user_id == current_user.id:
            admin_user = User.objects.filter(roles__name='ROLE_ADMIN').first()
            if admin_user:
                other_user_id = admin_user.id
            else:
                other_user_id = 1  # Fallback to system user/ID 1

        # Query messages between the two users
        messages_query = Message.objects.filter(
            (Q(sender=current_user) & Q(receiver_id=other_user_id)) |
            (Q(sender_id=other_user_id) & Q(receiver=current_user))
        )

        # Apply cursor filters
        if last_updated_at_str:
            last_updated_at = dateparse.parse_datetime(last_updated_at_str)
            if last_updated_at:
                if last_message_id:
                    messages_query = messages_query.filter(
                        Q(created_at__lt=last_updated_at) |
                        Q(created_at=last_updated_at, id__lt=int(last_message_id))
                    )
                else:
                    messages_query = messages_query.filter(created_at__lt=last_updated_at)

        # Order by newest first and limit to limit+1 to see if there are more
        messages_query = messages_query.order_by('-created_at', '-id')[:limit]
        fetched_messages = list(messages_query)

        # Map to DTOs and reverse to chronological order (oldest first for frontend display)
        dtos = [ChatMapper.to_dto(msg).model_dump(by_alias=True) for msg in fetched_messages]
        dtos.reverse()

        # Build next cursor if we retrieved the full limit page size
        cursor = None
        if len(fetched_messages) == limit:
            oldest_msg = fetched_messages[-1]
            cursor = {
                "last_updated_at": oldest_msg.created_at.isoformat(),
                "last_message_id": str(oldest_msg.id)
            }

        return RestResponse.success(data={
            "cursor": cursor,
            "data": dtos
        })
    except Exception as e:
        logger.error(f"[Chat Controller] Error fetching messages with receiver {receiver_id}: {e}")
        return RestResponse.error(
            message="Failed to load message history",
            status=http_status.HTTP_500_INTERNAL_SERVER_ERROR
        )
