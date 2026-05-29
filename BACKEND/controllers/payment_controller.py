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
from services.stripe_service import StripeService
from utils.format_response import FormatRestResponse

logger = logging.getLogger(__name__)
vnpay_service = VNPayService()
stripe_service = StripeService()

def _convert_dto_to_dict(dto):
    """Convert DTO to dictionary for JSON response"""
    if hasattr(dto, '__dataclass_fields__'):
        return asdict(dto)
    return dto

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment(request):
    """Create Stripe Checkout Session URL (Replaces VNPay to simplify local testing)"""
    logger.info("[PaymentController] Creating Stripe payment checkout session")

    try:
        # Parse request to DTO
        amount = request.data.get('amount')
        order_info = request.data.get('orderInfo')
        order_id = request.data.get('orderId')

        if not all([amount, order_info, order_id]):
            return JsonResponse(
                FormatRestResponse.error("[PaymentController] Missing required fields: 'amount', 'order_info', 'order_id'"),
                status=status.HTTP_400_BAD_REQUEST
            )

        # Call Stripe service to create Checkout Session URL
        payment_url = stripe_service.create_checkout_session(
            amount=int(amount),
            order_info=order_info,
            order_id_str=str(order_id),
            http_request=request
        )

        return JsonResponse(
            FormatRestResponse.success(
                data={"paymentUrl": payment_url},
                message="Stripe payment URL created successfully"
            ),
            status=status.HTTP_200_OK
        )
    except ValueError as e:
        logger.error(f"[PaymentController] Validation error: {str(e)}")
        return JsonResponse(
            FormatRestResponse.error(message=str(e)), status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"[PaymentController] Exception: {str(e)}")
        return JsonResponse(
            FormatRestResponse.error(message="Internal server error"),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def stripe_callback(request):
    """Handle Stripe success/cancel redirect and update booking/transaction status"""
    logger.info("[PaymentController] Received Stripe return callback")

    try:
        session_id = request.query_params.get('session_id')
        order_id = request.query_params.get('order_id')

        if not session_id or not order_id:
            return JsonResponse(
                FormatRestResponse.error("[PaymentController] Missing 'session_id' or 'order_id' query parameters"),
                status=status.HTTP_400_BAD_REQUEST
            )

        # Process callback and get redirect URL to frontend
        redirect_url = stripe_service.handle_stripe_callback(session_id, order_id)
        
        logger.info(f"[PaymentController] Redirecting browser to frontend: {redirect_url}")
        return redirect(redirect_url)
    except Exception as e:
        logger.error(f"[PaymentController] Exception in Stripe callback: {str(e)}")
        return JsonResponse(
            FormatRestResponse.error(message="Internal server error"),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def vnpay_return(request):
    """Handle VNPay return callback - redirect to Frontend"""
    logger.info("[PaymentController] Received VNPay return callback")

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

        logger.info(f"[PaymentController] Redirecting to frontend URL: {redirect_url}")
        return redirect(redirect_url)
    except Exception as e:
        logger.error(f"[PaymentController] Exception in return callback: {str(e)}")
        return JsonResponse(
            FormatRestResponse.error(message="Internal server error"),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def vnpay_ipn(request):
    """Get VNPay IPN (Instant Payment Notification) - Server-to-server callback"""
    logger.info("[PaymentController] Received VNPay IPN notification")

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
        logger.error(f"[PaymentController] Exception in IPN callback: {str(e)}")
        response_data = {
            "RspCode": "99",
            "Message": "System error"
        }
        return JsonResponse(
            FormatRestResponse.error(errors=response_data),
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
