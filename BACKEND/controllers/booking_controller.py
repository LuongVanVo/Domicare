import logging

from django.http import JsonResponse
from rest_framework import status as http_status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny

from dtos.requests.booking_request import BookingRequest
from dtos.requests.update_booking_request import UpdateBookingRequest
from dtos.requests.update_booking_status_request import UpdateBookingStatusRequest
from exceptions.base import ValidationException
from middlewares.current_user import get_current_user
from services.booking_service import BookingService
from utils.format_response import FormatRestResponse

logger = logging.getLogger(__name__)
booking_service = BookingService()

@api_view(['POST'])
@permission_classes([AllowAny])
def create_booking(request):
    """Create a new booking"""
    try:
        booking_request = BookingRequest(**request.data)

        current_user_email = None
        if request.user and request.user.is_authenticated:
            current_user_email = request.user.email

        # Create booking
        result = booking_service.add_booking(booking_request, current_user_email)

        return JsonResponse(
            FormatRestResponse.success(
                data=result.model_dump(by_alias=True),
                message='Booking created successfully',
            ),
            status=http_status.HTTP_201_CREATED,
        )
    except ValidationException as e:
        logger.error(f"[BookingController] Validation error while creating booking: {e}")
        return JsonResponse(
            FormatRestResponse.error(f"[BookingController] Validation error: {str(e)}"),
            status=http_status.HTTP_400_BAD_REQUEST,
        )
    except Exception as e:
        logger.error(f"[BookingController] Unexpected error while creating booking: {e}")
        return JsonResponse(
            FormatRestResponse.error("[BookingController] An unexpected error occurred"),
            status=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_booking_by_id(request, booking_id):
    """Get booking by ID"""
    try:
        result = booking_service.fetch_booking_by_id(booking_id)

        return JsonResponse(
            FormatRestResponse.success(
                data=result.model_dump(by_alias=True),
                message='Booking fetched successfully',
            ),
            status=http_status.HTTP_200_OK,
        )
    except Exception as e:
        logger.error(f"[BookingController] Unexpected error while fetching booking: {e}")
        return JsonResponse(
            FormatRestResponse.error("[BookingController] An unexpected error occurred"),
            status=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_booking(request, booking_id):
    """Delete booking by ID"""
    try:
        booking_service.delete_booking(booking_id)

        return JsonResponse(
            FormatRestResponse.success(
                message='Booking deleted successfully',
            ),
            status=http_status.HTTP_200_OK,
        )
    except Exception as e:
        logger.error(f"[BookingController] Unexpected error while deleting booking: {e}")
        return JsonResponse(
            FormatRestResponse.error("[BookingController] An unexpected error occurred"),
            status=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_booking(request):
    """Update booking information"""
    try:
        update_request = UpdateBookingRequest(**request.data)
        result = booking_service.update_booking(update_request)

        return JsonResponse(
            FormatRestResponse.success(
                data=result.model_dump(by_alias=True),
                message='Booking updated successfully',
            ),
            status=http_status.HTTP_200_OK,
        )
    except ValidationException as e:
        logger.error(f"[BookingController] Validation error while updating booking: {e}")
        return JsonResponse(
            FormatRestResponse.error(f"[BookingController] Validation error: {str(e)}"),
            status=http_status.HTTP_400_BAD_REQUEST,
        )
    except Exception as e:
        logger.error(f"[BookingController] Unexpected error while updating booking: {e}")
        return JsonResponse(
            FormatRestResponse.error("[BookingController] An unexpected error occurred"),
            status=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_booking_status(request):
    """Update booking status"""
    try:
        status_request = UpdateBookingStatusRequest(**request.data)

        current_user = get_current_user()
        current_user_email = current_user.email if current_user else None

        result = booking_service.update_booking_status(status_request, current_user_email)

        return JsonResponse(
            FormatRestResponse.success(
                data=result.model_dump(by_alias=True),
                message='Booking status updated successfully',
            ),
            status=http_status.HTTP_200_OK,
        )
    except ValidationException as e:
        logger.error(f"[BookingController] Validation error while updating booking status: {e}")
        return JsonResponse(
            FormatRestResponse.error(f"[BookingController] Validation error: {str(e)}"),
            status=http_status.HTTP_400_BAD_REQUEST,
        )
    except Exception as e:
        logger.error(f"[BookingController] Unexpected error while updating booking status: {e}")
        return JsonResponse(
            FormatRestResponse.error("[BookingController] An unexpected error occurred"),
            status=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_bookings(request):
    """Get all bookings with pagination and filters"""
    try:
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('pageSize', 20))
        user_id = request.GET.get('userId')
        sale_id = request.GET.get('saleId')
        booking_status = request.GET.get('bookingStatus')
        other_booking_status = request.GET.get('otherBookingStatus')
        search_name = request.GET.get('searchName')
        sort_by = request.GET.get('sortBy', 'create_at')
        sort_direction = request.GET.get('sortDirection', 'desc')

        if page < 1:
            page = 1
        if page_size < 1 or page_size > 100:
            page_size = 20

        user_id = int(user_id) if user_id and user_id != '0' else None
        sale_id = int(sale_id) if sale_id and sale_id != '0' else None

        result = booking_service.get_all_booking(
            page=page,
            page_size=page_size,
            user_id=user_id,
            sale_id=sale_id,
            booking_status=booking_status,
            other_booking_status=other_booking_status,
            search_name=search_name,
            sort_by=sort_by,
            sort_direction=sort_direction
        )

        return JsonResponse(
            FormatRestResponse.success(
                data={
                    'meta': result['meta'],
                    'data': result['data'],
                },
                message='Bookings fetched successfully',
            ),
            status=http_status.HTTP_200_OK,
        )
    except Exception as e:
        logger.error(f"[BookingController] Unexpected error while fetching bookings: {e}")
        return JsonResponse(
            FormatRestResponse.error("[BookingController] An unexpected error occurred"),
            status=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
        )