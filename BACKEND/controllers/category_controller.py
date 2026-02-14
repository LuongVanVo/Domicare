import json
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from jsonschema.exceptions import ValidationError
from rest_framework.decorators import permission_classes, api_view
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status as http_status

from dtos.requests.add_category_request import AddCategoryRequest
from dtos.requests.update_category_request import UpdateCategoryRequest
from exceptions.category_exceptions import CategoryAlreadyExistsException, CategoryNotFoundException
from services.category_service import CategoryService
from utils.format_response import FormatRestResponse

logger = logging.getLogger(__name__)

category_service = CategoryService()

@csrf_exempt
@permission_classes([IsAuthenticated])
@api_view(['POST'])
def create_category(request):
    """Create a new category"""
    try:
        data = json.loads(request.body)
        request_dto = AddCategoryRequest(**data)

        # Create category
        category = category_service.add_category(request_dto)

        return JsonResponse(
            FormatRestResponse.success(data=category.model_dump()), status=http_status.HTTP_201_CREATED
        )
    except ValidationError as e:
        return JsonResponse(FormatRestResponse.error(
            message="Invalid input data",
        ), status=http_status.HTTP_400_BAD_REQUEST)
    except CategoryAlreadyExistsException as e:
        return JsonResponse(FormatRestResponse.error(message=str(e)
        ), status=http_status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"[CategoryController] Error creating category: {str(e)}")
        return JsonResponse(
            FormatRestResponse.error(message="Internal server error"
            ), status=http_status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@csrf_exempt
@permission_classes([IsAuthenticated])
@api_view(['PATCH'])
def update_category(request):
    try:
        data = json.loads(request.body)
        request_dto = UpdateCategoryRequest(**data)

        # Update category
        category = category_service.update_category(request_dto)

        return JsonResponse(FormatRestResponse.success(
            data=category.model_dump(), message="Successfully updated category"
        ), status=http_status.HTTP_200_OK)
    except ValidationError as e:
        return JsonResponse(FormatRestResponse.error(
            message="Invalid input data",
        ), status=http_status.HTTP_400_BAD_REQUEST)
    except CategoryNotFoundException as e:
        return JsonResponse(FormatRestResponse.error(message=str(e)), status=http_status.HTTP_404_NOT_FOUND)
    except CategoryAlreadyExistsException as e:
        return JsonResponse(FormatRestResponse.error(message=str(e)), status=http_status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"[CategoryController] Error updating category: {str(e)}")
        return JsonResponse(FormatRestResponse.error(message="Internal server error"), status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@permission_classes([IsAuthenticated])
@api_view(['DELETE'])
def delete_category(request, category_id: int):
    """Delete a category by ID"""
    try:
        # Delete category
        category_service.delete_category(category_id)
        return JsonResponse(FormatRestResponse.success(
            message="Category deleted successfully"),
            status=http_status.HTTP_200_OK
        )
    except CategoryNotFoundException as e:
        return JsonResponse(FormatRestResponse.error(
            message=str(e)),
            status=http_status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"[CategoryController] Error deleting category: {str(e)}")
        return JsonResponse(FormatRestResponse.error(
            message="Internal server error"),
            status=http_status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_category_by_id(request, category_id: int):
    """Get category by ID """
    try:
        # Get category
        category = category_service.fetch_category_by_id(category_id)

        return JsonResponse(FormatRestResponse.success(
            data=category.dict()
        ), status=http_status.HTTP_200_OK)

    except CategoryNotFoundException as e:
        return JsonResponse(FormatRestResponse.error(
            message=str(e)
        ), status=http_status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"[CategoryController] Error getting category: {str(e)}")
        return JsonResponse(FormatRestResponse.error(
            message="Internal server error"
        ), status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_categories(request):
    """Get all categories with pagination and filtering"""
    try:
        # Parse query parameters
        page = int(request.GET.get('page', 1))
        size = int(request.GET.get('size', 20))
        search_name = request.GET.get('search_name', None)
        sort_by = request.GET.get('sort_by', 'id')
        sort_direction = request.GET.get('sort_direction', 'asc')

        # Get categories
        result = category_service.get_all_categories(page, size, search_name, sort_by, sort_direction)

        serialize_data = {
            "meta": result["meta"],
            "data": [cat.model_dump() for cat in result["data"]]
        }

        return JsonResponse(FormatRestResponse.success(
            data=serialize_data,
        ), status=http_status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"[CategoryController] Error getting categories: {str(e)}")
        return JsonResponse(FormatRestResponse.error(
            message="Internal server error"
        ), status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)