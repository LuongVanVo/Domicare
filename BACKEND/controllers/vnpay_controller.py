import logging
from dataclasses import asdict
from urllib.parse import quote
from django.http import JsonResponse
from django.shortcuts import redirect
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from dtos.vnpay_dtos import VNPayPaymentRequest
from services.vnpay_service import VNPayService
from utils.format_response import FormatRestResponse

logger = logging.getLogger(__name__)
vnpay_service = VNPayService()

def _convert_dto_to_dict(dto):
    """Convert DTO to dictionary for JSON response"""
    if hasattr(dto, '__dataclass_fields__'):
        return asdict(dto)
    return dto

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment(request):
    """Create VNPay payment URL"""
    logger.info("[VNPayController] Creating VNPay payment")

    try:
        # Parse request to DTO
        amount = request.data.get('amount')
        order_info = request.data.get('orderInfo')
        order_id = request.data.get('orderId')

        if not all([amount, order_info, order_id]):
            return JsonResponse(
                FormatRestResponse.error("[VNPayController] Missing required fields: 'amount', 'order_info', 'order_id'"),
                status=status.HTTP_400_BAD_REQUEST
            )

        payment_request = VNPayPaymentRequest(
            amount=int(amount),
            order_info=order_info,
            order_id=order_id
        )
        payment_request.validate()

        # Create payment
        response_dto = vnpay_service.create_payment(payment_request, request)

        # response_data = _convert_dto_to_dict(response_dto)
        response_data = response_dto.to_dict()
        return JsonResponse(
            FormatRestResponse.success(
                data=response_data,
                message="VNPay payment URL created successfully"
            ),
            status=status.HTTP_200_OK
        )
    except ValueError as e:
        logger.error(f"[VNPayController] Validation error: {str(e)}")
        return JsonResponse(
            FormatRestResponse.error(message=str(e)), status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"[VNPayController] Exception: {str(e)}")
        return JsonResponse(
            FormatRestResponse.error(message="Internal server error"),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def vnpay_return(request):
    """Handle VNPay return callback - redirect to Frontend"""
    logger.info("[VNPayController] Received VNPay return callback")

    try:
        # Get all query parameters
        params = dict(request.GET)

        # Convert list values to single values
        params = {k: v[0] if isinstance(v, list) else v for k, v in params.items()}

        # Handle VNPay return
        result = vnpay_service.handle_vnpay_return(params)

        # Build redirect URL to frontend
        frontend_url = vnpay_service.get_frontend_url()
        payment_status = result.status.lower()
        order_id = result.order_id if result.order_id else ''
        amount = result.amount if result.amount else 0

        redirect_url = (
            f"{frontend_url}/payment?"
            f"status={quote(payment_status)}&"
            f"order_id={quote(order_id)}&"
            f"amount={amount * 100}"
        )

        logger.info(f"[VNPayController] Redirecting to frontend URL: {redirect_url}")
        return redirect(redirect_url)
    except Exception as e:
        logger.error(f"[VNPayController] Exception in return callback: {str(e)}")
        return JsonResponse(
            FormatRestResponse.error(message="Internal server error"),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def vnpay_ipn(request):
    """Get VNPay IPN (Instant Payment Notification) - Server-to-server callback"""
    logger.info("[VNPayController] Received VNPay IPN notification")

    try:
        # Get all query parameters
        params = dict(request.GET)

        # Convert list values to single values
        params = {k: v[0] if isinstance(v, list) else v for k, v in params.items()}

        # Handle VNPay return
        result = vnpay_service.handle_vnpay_return(params)

        # Build response for VNPay
        if result.status == "SUCCESS":
            response_data = {
                "RspCode": "00",
                "Message": "Confirm Success"
            }
        else:
            response_data = {
                "RspCode": "99",
                "Message": "Unknown error"
            }

        return JsonResponse(
            response_data,
            status=status.HTTP_200_OK
        )
    except Exception as e:
        logger.error(f"[VNPayController] Exception in IPN callback: {str(e)}")
        response_data = {
            "RspCode": "99",
            "Message": "System error"
        }
        return JsonResponse(
            FormatRestResponse.error(errors=response_data),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )