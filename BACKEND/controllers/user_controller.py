from rest_framework.decorators import api_view, permission_classes

from dtos.requests.add_user_by_admin_request import AddUserByAdminRequest
from dtos.requests.update_role_for_user_request import UpdateRoleForUserRequest
from dtos.requests.update_user_request import UpdateUserRequest
from exceptions.base import ValidationException
from middlewares.current_user import get_current_user
from services.user_service import UserService
from utils.format_response import FormatRestResponse
from rest_framework import status as http_status
from dtos.user_dto import UserDTO
from django.http import JsonResponse
from rest_framework.permissions import AllowAny, IsAuthenticated
import logging

logger = logging.getLogger(__name__)
user_service = UserService()
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
            dateOfBirth=current_user.date_of_birth,
            isEmailConfirmed=current_user.is_email_confirmed,
            isActive=current_user.is_active,
            createAt=current_user.create_at,
            updateAt=current_user.update_at,
            createBy=current_user.create_by,
            updateBy=current_user.update_by,
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

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all_users(request):
    """Get all users with pagination, filtering and sorting"""
    try:
        # Parse query parameters
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('pageSize', 20))
        search_name = request.GET.get('searchName')
        search_role_name = request.GET.get('searchRoleName')
        sort_by = request.GET.get('sortBy', 'id')
        sort_direction = request.GET.get('sortDirection', 'asc')

        # Validate pagination
        if page < 1:
            page = 1
        if page_size < 1 or page_size > 100:
            page_size = 20

        # Get users
        result = user_service.get_all_users(
            page=page,
            page_size=page_size,
            search_name=search_name,
            search_role_name=search_role_name,
            sort_by=sort_by,
            sort_direction=sort_direction
        )

        return JsonResponse(
            FormatRestResponse.success(
                data=result,
                message="Users fetched successfully."
            ),
            status=http_status.HTTP_200_OK
        )
    except Exception as e:
        logger.error(f"[UserController] Error in get_all_users: {str(e)}")
        return JsonResponse(FormatRestResponse.error(
            message="An error occurred while fetching users."
        ), status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_by_id(request, user_id):
    """Get user by ID"""
    try:
        user_dto = user_service.get_user_by_id(user_id)

        return JsonResponse(
            FormatRestResponse.success(
                data=user_dto.to_dict(),
                message="User fetched successfully."
            ),
            status=http_status.HTTP_200_OK
        )
    except Exception as e:
        logger.error(f"[UserController] Error in get_user_by_id: {str(e)}")
        return JsonResponse(FormatRestResponse.error(
            message="An error occurred while fetching user."
        ), status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_user_by_id(request, user_id):
    """Delete user by ID"""
    try:
        user_service.delete_user_by_id(user_id)

        return JsonResponse(
            FormatRestResponse.success(
                message="User deleted successfully."
            ),
            status=http_status.HTTP_200_OK
        )
    except Exception as e:
        logger.error(f"[UserController] Error in delete_user_by_id: {str(e)}")
        return JsonResponse(FormatRestResponse.error(
            message="An error occurred while deleting user."
        ), status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_user_information(request):
    """Update user information"""
    try:
        update_request = UpdateUserRequest(**request.data)

        updated_user = user_service.update_user_information(update_request)
        return JsonResponse(
            FormatRestResponse.success(
                data=updated_user.model_dump(),
                message="User information updated successfully."
            ),
            status=http_status.HTTP_200_OK
        )
    except ValidationException as e:
        logger.error(f"[UserController] Validation error in update_user_information: {str(e)}")
        return JsonResponse(
            FormatRestResponse.error(
                message=str(e)
            ),
            status=http_status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"[UserController] Error in update_user_information: {str(e)}")
        return JsonResponse(FormatRestResponse.error(
            message="An error occurred while updating user information."
        ), status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_user_roles(request):
    """Update user roles (admin only)"""
    try:
        role_request = UpdateRoleForUserRequest(**request.data)
        updated_user = user_service.update_role_for_user(role_request)
        return JsonResponse(
            FormatRestResponse.success(
                data=updated_user.model_dump(),
                message="User roles updated successfully."
            ),
            status=http_status.HTTP_200_OK
        )
    except ValidationException as e:
        logger.error(f"[UserController] Validation error in update_user_roles: {str(e)}")
        return JsonResponse(
            FormatRestResponse.error(
                message=str(e)
            ),
            status=http_status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"[UserController] Error in update_user_roles: {str(e)}")
        return JsonResponse(FormatRestResponse.error(
            message="An error occurred while updating user roles."
        ), status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_user_by_admin(request):
    """Create new user by admin"""
    try:
        add_user_request = AddUserByAdminRequest(**request.data)
        created_user = user_service.add_user_by_admin(add_user_request)

        return JsonResponse(
            FormatRestResponse.success(
                data=created_user.model_dump(),
                message="User created successfully."
            ),
            status=http_status.HTTP_201_CREATED
        )
    except ValidationException as e:
        logger.error(f"[UserController] Validation error in create_user_by_admin: {str(e)}")
        return JsonResponse(
            FormatRestResponse.error(
                message=str(e)
            ),
            status=http_status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"[UserController] Error in create_user_by_admin: {str(e)}")
        return JsonResponse(FormatRestResponse.error(
            message="An error occurred while creating user."
        ), status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)