from rest_framework.decorators import api_view, permission_classes
from middlewares.current_user import get_current_user
from utils.format_response import FormatRestResponse
from rest_framework import status as http_status
from dtos.user_dto import UserDTO
from django.http import JsonResponse
from rest_framework.permissions import AllowAny
import logging

logger = logging.getLogger(__name__)

@api_view(["GET"])
@permission_classes([AllowAny])
def get_me(request):
    """Get current authenticated user info"""
    try:
        current_user = get_current_user()
        
        if not current_user or not current_user.is_authenticated:
            return JsonResponse(FormatRestResponse.error(
                message="User not authenticated."
            ), status=http_status.HTTP_401_UNAUTHORIZED)
        
        user_dto = UserDTO(
            id=current_user.id,
            name=current_user.full_name,
            email=current_user.email,
            phone=current_user.phone,
            address=current_user.address,
            avatar=current_user.avatar,
            gender=current_user.gender,
            date_of_birth=current_user.date_of_birth,
            is_email_confirmed=current_user.is_email_confirmed,
            is_active=current_user.is_active,
            create_at=current_user.create_at,
            update_at=current_user.update_at,
            roles=list(current_user.roles.all()) if hasattr(current_user, 'roles') else [],  
        )
        
        return JsonResponse(FormatRestResponse.success(
            data=user_dto.model_dump()
        ), status=http_status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"[UserController] Error in get_me: {str(e)}")
        return JsonResponse(FormatRestResponse.error(
            message="An error occurred while fetching user info."
        ), status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)