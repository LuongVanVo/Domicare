"""Service for Stripe payment integration"""
import logging
from django.conf import settings
from django.db import transaction
import stripe

from models.enums import PaymentStatus, BookingStatus
from models.payment import PaymentTransaction
from models.booking import Booking

logger = logging.getLogger(__name__)

class StripeService:
    """Service for Stripe payment integration"""
    def __init__(self):
        stripe.api_key = settings.STRIPE_SECRET_KEY
        self.frontend_url = settings.FRONTEND_URL
        self.backend_url = settings.BACKEND_URL

    @transaction.atomic
    def create_checkout_session(self, amount: int, order_info: str, order_id_str: str, http_request) -> str:
        """Create a Stripe Checkout Session and return the URL"""
        try:
            # 1. Fetch related booking if possible
            booking = None
            try:
                # If order_id_str is composite (e.g., 59_deposit_178000 or 59_remaining_17800), split by '_' and try the first part
                booking_id_str = order_id_str.split('_')[0]
                booking_id = int(booking_id_str)
                booking = Booking.objects.get(id=booking_id)
            except Exception as e:
                logger.warning(f"[StripeService] Could not find Booking with ID from {order_id_str}: {e}")

            # 2. Save payment transaction to database in PENDING state
            payment_transaction = PaymentTransaction.objects.create(
                order_id=order_id_str,
                amount=amount,
                order_info=order_info,
                status=PaymentStatus.PENDING.value,
                booking=booking,
                ip_address=self._get_client_ip(http_request)
            )
            logger.info(f"[StripeService] Saved pending transaction for order_id: {order_id_str}, amount: {amount}")

            # 3. Create Stripe Checkout Session
            # Note: VND is a zero-decimal currency, so Stripe accepts the amount directly (not multiplied by 100)
            # Stripe requires a minimum charge equivalent to 50 cents USD (approx. 15,000 VND).
            charge_amount = int(amount)
            if charge_amount < 15000:
                logger.info(f"[StripeService] Amount {charge_amount} VND is below Stripe's minimum. Raising to 15,000 VND for checkout.")
                charge_amount = 15000

            success_url = f"{self.backend_url}/api/v1/payment/stripe/callback?session_id={{CHECKOUT_SESSION_ID}}&order_id={order_id_str}"
            cancel_url = f"{self.frontend_url}/payment?status=failure&orderInfo={order_id_str}&amount={amount * 100}"

            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'vnd',
                        'product_data': {
                            'name': order_info or f"Payment for Booking #{order_id_str}",
                        },
                        'unit_amount': charge_amount,
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=success_url,
                cancel_url=cancel_url,
                metadata={
                    'order_id': order_id_str,
                    'booking_id': str(booking.id) if booking else ''
                }
            )

            # 4. Save Stripe Session ID as transaction number
            payment_transaction.transaction_no = session.id
            payment_transaction.save()

            logger.info(f"[StripeService] Created Stripe Session {session.id} for order {order_id_str}")
            return session.url

        except Exception as e:
            logger.error(f"[StripeService] Error creating Stripe checkout session: {e}", exc_info=True)
            raise RuntimeError(f"Error creating Stripe checkout session: {e}")

    @transaction.atomic
    def handle_stripe_callback(self, session_id: str, order_id_str: str) -> str:
        """Verify Stripe checkout session status and update database models"""
        try:
            logger.info(f"[StripeService] Verifying session {session_id} for order {order_id_str}")
            session = stripe.checkout.Session.retrieve(session_id)

            # Find matching payment transaction
            try:
                payment_transaction = PaymentTransaction.objects.get(order_id=order_id_str)
            except PaymentTransaction.DoesNotExist:
                logger.error(f"[StripeService] Payment transaction not found for order: {order_id_str}")
                return f"{self.frontend_url}/payment?status=failure&orderInfo={order_id_str}&amount=0"

            if session.payment_status == 'paid':
                payment_transaction.status = PaymentStatus.SUCCESS.value
                payment_transaction.amount = session.amount_total  # Save the actual paid amount (VND)
                payment_transaction.response_code = 'SUCCESS'
                payment_transaction.bank_code = 'card'
                payment_transaction.pay_date = str(session.created) # unix timestamp
                payment_transaction.save()

                # Update booking status and amount_paid
                if payment_transaction.booking:
                    booking = payment_transaction.booking
                    successful_payments = PaymentTransaction.objects.filter(
                        booking=booking,
                        status=PaymentStatus.SUCCESS.value
                    )
                    total_paid = sum([p.amount for p in successful_payments])
                    booking.amount_paid = total_paid
                    
                    is_final_payment = booking.amount_paid >= booking.total_price
                    
                    if is_final_payment:
                        booking.booking_status = BookingStatus.SUCCESS.value
                    else:
                        booking.booking_status = BookingStatus.ACCEPTED.value
                        
                    booking.save()
                    logger.info(f"[StripeService] Updated Booking #{booking.id}: amount_paid={booking.amount_paid}, status={booking.booking_status}")

                    # Generate auto system chat message
                    amount_formatted = f"{payment_transaction.amount:,.0f}".replace(",", ".")
                    if is_final_payment:
                        message_text = f"[HỆ THỐNG] Khách hàng đã thanh toán nốt số tiền còn lại thành công cho Đơn đặt lịch #{booking.id}. Số tiền: {amount_formatted} VND. Đơn hàng đã hoàn thành!"
                    else:
                        message_text = f"[HỆ THỐNG] Khách hàng đã thanh toán đặt cọc thành công cho Đơn đặt lịch #{booking.id}. Số tiền cọc: {amount_formatted} VND."
                    
                    self._send_system_payment_chat_message(booking, message_text)

                logger.info(f"[StripeService] Payment succeeded for order: {order_id_str}")
                return f"{self.frontend_url}/payment?status=success&orderInfo={order_id_str}&amount={payment_transaction.amount * 100}"
            else:
                payment_transaction.status = PaymentStatus.FAILED.value
                payment_transaction.response_code = 'FAILED'
                payment_transaction.save()

                logger.warning(f"[StripeService] Payment failed/unpaid for session {session_id}")
                return f"{self.frontend_url}/payment?status=failure&orderInfo={order_id_str}&amount={payment_transaction.amount * 100}"

        except Exception as e:
            logger.error(f"[StripeService] Error handling Stripe callback: {e}", exc_info=True)
            try:
                payment_transaction = PaymentTransaction.objects.get(order_id=order_id_str)
                amt = payment_transaction.amount * 100
            except Exception:
                amt = 0
            return f"{self.frontend_url}/payment?status=failure&orderInfo={order_id_str}&amount={amt}"

    def _get_client_ip(self, request):
        """Retrieve client IP address from request metadata"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def _send_system_payment_chat_message(self, booking, message_text):
        """Send a real-time system message notifying user and staff of successful payment"""
        try:
            from models.chat import Message
            from models.user import User
            from django.db.models import Q
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync

            sender = booking.user
            # Determine receiver: assigned Sale user, or last chatted partner, or Admin
            if booking.sale_user:
                receiver = booking.sale_user
            else:
                last_message = Message.objects.filter(
                    Q(sender=sender) | Q(receiver=sender)
                ).exclude(sender=sender, receiver=sender).order_by('-created_at').first()
                if last_message:
                    receiver = last_message.receiver if last_message.sender == sender else last_message.sender
                else:
                    receiver = User.objects.filter(roles__name='ROLE_ADMIN').first() or User.objects.first()

            # Create message in database
            message = Message.objects.create(
                sender=sender,
                receiver=receiver,
                message=message_text
            )

            # Broadcast via WebSocket Channels
            channel_layer = get_channel_layer()
            if channel_layer:
                message_data = {
                    "_id": str(message.id),
                    "sender_id": str(message.sender_id),
                    "receiver_id": str(message.receiver_id),
                    "message": message.message,
                    "created_at": message.created_at.isoformat(),
                    "updated_at": message.updated_at.isoformat()
                }
                # Send to receiver group (Sale/Admin)
                async_to_sync(channel_layer.group_send)(
                    f"user_{message.receiver_id}",
                    {
                        "type": "chat_message",
                        "data": message_data
                    }
                )
                # Send to sender group (Customer)
                async_to_sync(channel_layer.group_send)(
                    f"user_{message.sender_id}",
                    {
                        "type": "chat_message",
                        "data": message_data
                    }
                )
                logger.info(f"[StripeService] Successfully sent system payment chat message for booking #{booking.id}")
        except Exception as e:
            logger.error(f"[StripeService] Failed to send system payment chat message: {e}", exc_info=True)
