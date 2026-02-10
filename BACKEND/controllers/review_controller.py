import logging

from django.http import JsonResponse
from pydantic import ValidationError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from dtos.requests.review_request import ReviewRequest
from services.review_service import ReviewService
from utils.format_response import FormatRestResponse

logger = logging.getLogger(__name__)
review_service = ReviewService()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_review(request):
    """Create a new review"""
    try:
        # Get current user email
        current_user_email = request.user.email

        # Validate request
        review_request = ReviewRequest(**request.data)

        review = review_service.create_review(review_request, current_user_email)

        return JsonResponse(
            FormatRestResponse.success(
                data=review,
                message="Review created successfully"
            ),
            status=status.HTTP_201_CREATED,
        )
    except ValidationError as e:
        logger.error(f"[ReviewController] Validation error creating review: {str(e)}")
        return JsonResponse(
            FormatRestResponse.error(str(e)),
            status=status.HTTP_400_BAD_REQUEST,
        )
    except Exception as e:
        logger.error(f"[ReviewController] Error creating review: {str(e)}")
        return JsonResponse(
            FormatRestResponse.error("Internal server error"),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_reviews(request):
    """Get all reviews"""
    try:
        # Parse query parameters
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        product_id = request.query_params.get('product_id', None)
        user_id = request.query_params.get('user_id', None)
        sort_by = request.query_params.get('sort_by', 'create_at')
        sort_direction = request.query_params.get('sort_direction', 'desc')

        if product_id:
            product_id = int(product_id)
        if user_id:
            user_id = int(user_id)

        result = review_service.get_all_reviews(
            page=page,
            page_size=page_size,
            product_id=product_id,
            user_id=user_id,
            sort_by=sort_by,
            sort_direction=sort_direction,
        )

        return JsonResponse(
            FormatRestResponse.success(
                data=result,
                message="Reviews fetched successfully"
            ),
            status=status.HTTP_200_OK
        )
    except Exception as e:
        logger.error(f"[ReviewController] Error getting reviews: {str(e)}")
        return JsonResponse(
            FormatRestResponse.error("Internal server error"),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_review_by_id(request, review_id: int):
    """Get review by ID"""
    try:
        review = review_service.get_review_by_id(review_id)
        return JsonResponse(
            FormatRestResponse.success(
                data=review.model_dump(by_alias=True),
                message="Review fetched successfully"
            ),
            status=status.HTTP_200_OK
        )
    except Exception as e:
        logger.error(f"[ReviewController] Error getting review by ID: {str(e)}")
        return JsonResponse(
            FormatRestResponse.error("Internal server error"),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )