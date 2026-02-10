import logging

from django.http import JsonResponse
from pydantic import ValidationError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny

from dtos.requests.add_product_image_request import AddProductImageRequest
from dtos.requests.add_product_request import AddProductRequest
from dtos.requests.update_product_request import UpdateProductRequest
from services.product_service import ProductService
from utils.format_response import FormatRestResponse

logger = logging.getLogger(__name__)
product_service = ProductService()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_product(request):
    """Create a new product"""
    try:
        # Validate request
        product_request = AddProductRequest(**request.data)
        # Create product
        product = product_service.add_product(product_request)

        return JsonResponse(
            FormatRestResponse.success(
                data=product.model_dump(),
                message="Product created successfully"),
            status=status.HTTP_201_CREATED
        )
    except ValidationError as e:
        logger.error(f"[ProductController] Validation error: {str(e)}")
        return JsonResponse(
            FormatRestResponse.error(message=str(e)), status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"[ProductController] Exception: {str(e)}")
        return JsonResponse(
            FormatRestResponse.error(message="Internal server error"),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_product(request):
    """Update an existing product"""
    try:
        # Validate request
        product_request = UpdateProductRequest(**request.data)
        # Update product
        product = product_service.update_product(product_request)

        return JsonResponse(
            FormatRestResponse.success(
                data=product.model_dump(),
                message="Product updated successfully"),
            status=status.HTTP_200_OK
            )
    except ValidationError as e:
        logger.error(f"[ProductController] Validation error: {str(e)}")
        return JsonResponse(
            FormatRestResponse.error(message=str(e)), status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"[ProductController] Exception: {str(e)}")
        return JsonResponse(
            FormatRestResponse.error(message="Internal server error"),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_product(request, product_id):
    """Soft delete a product by ID"""
    try:
        product_service.delete_product(product_id)
        return JsonResponse(
            FormatRestResponse.success(
                message="Product deleted successfully"),
            status=status.HTTP_200_OK
        )
    except Exception as e:
        logger.error(f"[ProductController] Exception: {str(e)}")
        return JsonResponse(
            FormatRestResponse.error(message="Internal server error"),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def get_product_by_id(request, product_id):
    """Get product by ID (public endpoint)"""
    try:
        product = product_service.fetch_product_by_id(product_id)
        return JsonResponse(
            FormatRestResponse.success(
                data=product.model_dump()
            ),
            status=status.HTTP_200_OK
        )
    except Exception as e:
        logger.error(f"[ProductController] Exception: {str(e)}")
        return JsonResponse(
            FormatRestResponse.error(message="Internal server error"),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def get_all_products(request):
    """Get all products with pagination, filtering, and sorting (public endpoint)"""
    try:
        # Parse query parameters
        page = int(request.query_params.get('page', 1))
        size = int(request.query_params.get('size', 20))
        category_id = int(request.query_params.get('category_id', 0))
        search_name = request.query_params.get('search_name', None)
        sort_by = request.query_params.get('sort_by', 'id')
        sort_direction = request.query_params.get('sort_direction', 'asc')

        if category_id == 0:
            category_id = None

        result = product_service.get_all_products(
            page=page,
            page_size=size,
            category_id=category_id,
            search_name=search_name,
            sort_by=sort_by,
            sort_direction=sort_direction
        )

        return JsonResponse(
            FormatRestResponse.success(
                data={
                    "meta": result["meta"],
                    "data": result["data"]
                }
            ),
            status=status.HTTP_200_OK
        )
    except Exception as e:
        logger.error(f"[ProductController] Error: {str(e)}", exc_info=True)
        return JsonResponse(
            FormatRestResponse.error(message="Internal server error"),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def upload_product_image(request):
    """Upload product image (to be implemented)"""
    try:
        image_request = AddProductImageRequest(**request.data)
        product = product_service.add_product_image(image_request)

        return JsonResponse(
            FormatRestResponse.success(
                data=product.model_dump(by_alias=True),
                message="Product image uploaded successfully"),
            status=status.HTTP_200_OK
        )
    except ValidationError as e:
        logger.error(f"[ProductController] Validation error: {str(e)}")
        return JsonResponse(
            FormatRestResponse.error(message=str(e)), status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"[ProductController] Exception: {str(e)}")
        return JsonResponse(
            FormatRestResponse.error(message="Internal server error"),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )