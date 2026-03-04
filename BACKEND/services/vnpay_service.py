import logging
from datetime import datetime, timedelta
from ipaddress import ip_address
import urllib
import pytz
from django.conf import settings
from django.db import transaction

from dtos.vnpay_dtos import VNPayPaymentRequest, VNPayPaymentResponse, VNPayReturnResponse
from models.enums import PaymentStatus
from models.payment import PaymentTransaction
from utils.vnpay_util import VNPayUtil

logger = logging.getLogger(__name__)
class VNPayService:
    """Service for VNPay payment integration"""
    # VNPay API constants
    VN_VERSION = '2.1.0'
    VNP_COMMAND = 'pay'
    VNP_ORDER_TYPE = 'other'
    VNP_CURR_CODE = 'VND'
    VNP_LOCALE = 'vn'

    def __init__(self):
        self.tmn_code = settings.VNPAY_TMN_CODE
        self.vnp_hash_secret = settings.VNPAY_SECURE_HASH.strip()
        self.vnp_url = settings.VNPAY_URL
        self.return_url = settings.VNPAY_RETURN_URL
        self.frontend_url = settings.FRONTEND_URL

    @transaction.atomic
    def create_payment(self, request_dto: VNPayPaymentRequest, http_request) -> VNPayPaymentResponse:
        """Create VNPay payment URL"""
        try:
            # Get client IP address
            vnp_id_address = VNPayUtil.get_ip_address(http_request)
            logger.info(f"[VNPayService] VNPay IP Address: {vnp_id_address}")

            # Create date using Vietnam timezone (UTC+7)
            vn_tz = pytz.timezone('Asia/Ho_Chi_Minh')
            now = datetime.now(vn_tz)
            vnp_create_date = VNPayUtil.format_date(now)
            logger.info(f"[VNPayService] VNPay Create Date: {vnp_create_date}")

            # Add 15 minutes for expire date
            expire_time = now + timedelta(minutes=15)
            vnp_expire_date = VNPayUtil.format_date(expire_time)

            # Save payment transaction to database with PENDING status
            payment_transaction = PaymentTransaction.objects.create(
                order_id=request_dto.order_id,
                amount=request_dto.amount,
                order_info=request_dto.order_info,
                status=PaymentStatus.PENDING.value,
                ip_address=vnp_id_address,
            )
            logger.info(f"[VNPayService] Saved payment transaction with orderID: {payment_transaction.order_id} and amount: {payment_transaction.amount}")

            # Build payment parameters
            vnp_params = {
                'vnp_Version': '2.1.0',
                'vnp_Command': 'pay',
                'vnp_TmnCode': self.tmn_code,
                'vnp_Amount': str(request_dto.amount * 100),
                'vnp_CurrCode': 'VND',
                'vnp_TxnRef': request_dto.order_id,
                'vnp_OrderInfo': request_dto.order_info,
                'vnp_OrderType': 'other',
                'vnp_Locale': 'vn',
                'vnp_ReturnUrl': self.return_url,
                'vnp_IpAddr': vnp_id_address,
                'vnp_CreateDate': vnp_create_date,
                'vnp_ExpireDate': vnp_expire_date,
            }

            # Sắp xếp params
            sorted_params = sorted(vnp_params.items())

            # Tạo hash data (CÓ encode giá trị)
            hash_data = '&'.join([f"{k}={urllib.parse.quote_plus(str(v))}" for k, v in sorted_params])
            logger.info(f"[VNPayService] Hash Data: {hash_data}")

            # Tạo secure hash
            vnp_secure_hash = VNPayUtil.hmac_sha512(self.vnp_hash_secret, hash_data)
            logger.info(f"[VNPayService] Secure Hash: {vnp_secure_hash}")

            # Tạo query string (giống hash data)
            query_string = hash_data

            # Build final URL
            payment_url = f"{self.vnp_url}?{query_string}&vnp_SecureHash={vnp_secure_hash}"
            logger.info(f"[VNPayService] Payment URL: {payment_url}")

            return VNPayPaymentResponse(
                payment_url=payment_url,
            )
        except Exception as e:
            logger.error(f"[VNPayService] Error creating VNPay payment: {str(e)}")
            raise RuntimeError(f"Error creating VNPay payment: {str(e)}")

    @transaction.atomic
    def handle_vnpay_return(self, params: dict) -> VNPayReturnResponse:
        """Handle VNPay return callback"""
        logger.info(f"[VNPayService] Received params: {params}")

        try:
            # Extract secure hash
            vnp_secure_hash = params.pop('vnp_SecureHash', None)
            params.pop('vnp_SecureHashType', None)

            if not vnp_secure_hash:
                logger.error("[VNPayService] Missing vnp_SecureHash")
                return VNPayReturnResponse(status="ERROR", message="Missing secure hash")

            # Build hash data (PHẢI GIỐNG LÚC CREATE PAYMENT)
            sorted_params = sorted(params.items())
            hash_data = '&'.join([f"{k}={urllib.parse.quote_plus(str(v))}" for k, v in sorted_params])
            logger.info(f"[VNPayService] Hash Data: {hash_data}")

            # Calculate hash
            calculated_hash = VNPayUtil.hmac_sha512(self.vnp_hash_secret, hash_data)
            logger.info(f"[VNPayService] Calculated: {calculated_hash}")
            logger.info(f"[VNPayService] Received: {vnp_secure_hash}")

            # Verify signature
            if calculated_hash.lower() != vnp_secure_hash.lower():
                logger.error("[VNPayService] Invalid signature")
                return VNPayReturnResponse(status="ERROR", message="Invalid signature")

            # Extract payment info
            response_code = params.get('vnp_ResponseCode')
            order_id = params.get('vnp_TxnRef')
            amount = params.get('vnp_Amount')
            transaction_no = params.get('vnp_TransactionNo')
            bank_code = params.get('vnp_BankCode')
            pay_date = params.get('vnp_PayDate')

            # Update database
            try:
                payment_transaction = PaymentTransaction.objects.get(order_id=order_id)  # ✅ SỬA: object → objects
                payment_transaction.response_code = response_code
                payment_transaction.transaction_no = transaction_no
                payment_transaction.bank_code = bank_code
                payment_transaction.pay_date = pay_date

                if response_code == '00':
                    payment_transaction.status = PaymentStatus.SUCCESS.value  # ✅ SỬA: Thêm .value
                else:
                    payment_transaction.status = PaymentStatus.FAILED.value  # ✅ SỬA: Thêm .value

                payment_transaction.save()
                logger.info(f"[VNPayService] Updated payment: {order_id}, status: {payment_transaction.status}")

            except PaymentTransaction.DoesNotExist:
                logger.warning(f"[VNPayService] Payment not found: {order_id}")

            # Return response
            if response_code == '00':
                return VNPayReturnResponse(
                    status="SUCCESS",
                    message="Payment successful",
                    order_id=order_id,
                    amount=int(amount) // 100 if amount else 0,
                    transaction_no=transaction_no,
                    bank_code=bank_code,
                    pay_date=pay_date,
                )
            else:
                return VNPayReturnResponse(
                    status="FAILED",
                    message=f"Payment failed: {response_code}",
                    order_id=order_id,
                )

        except Exception as e:
            logger.error(f"[VNPayService] Exception: {str(e)}", exc_info=True)
            return VNPayReturnResponse(status="ERROR", message="System error")

    def get_frontend_url(self) -> str:
        """Get Frontend URL for redirecting after payment"""
        return self.frontend_url