"""Django Signals for Booking Notifications"""
import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from models.booking import Booking

logger = logging.getLogger(__name__)

def serialize_booking(booking):
    """Serialize booking data needed for frontend websocket notification"""
    try:
        products_list = []
        # Fetch related products
        for product in booking.products.all():
            products_list.append({
                "id": product.id,
                "name": product.name,
            })
        return {
            "id": booking.id,
            "bookingStatus": booking.booking_status,
            "totalPrice": float(booking.total_price),
            "products": products_list
        }
    except Exception as e:
        logger.error(f"[WS Signals] Error serializing booking #{booking.id}: {e}")
        return {
            "id": booking.id,
            "bookingStatus": booking.booking_status,
            "totalPrice": float(booking.total_price),
            "products": []
        }

@receiver(post_save, sender=Booking)
def broadcast_booking_change(sender, instance, created, **kwargs):
    """
    Broadcast booking events (new booking or status update)
    to the staff notification channel and the owner customer channel.
    """
    try:
        channel_layer = get_channel_layer()
        if not channel_layer:
            logger.warning("[WS Signals] Channel layer is not configured. Booking notification skipped.")
            return

        action = "new" if created else "update"
        booking_data = serialize_booking(instance)

        # 1. Send to admin/sales notifications group
        async_to_sync(channel_layer.group_send)(
            "admin_notifications",
            {
                "type": "booking_notification",
                "action": action,
                "data": booking_data
            }
        )

        # 2. Send to specific user notification group
        async_to_sync(channel_layer.group_send)(
            f"user_{instance.user_id}",
            {
                "type": "booking_notification",
                "action": action,
                "data": booking_data
            }
        )
        logger.info(f"[WS Signals] Broadcasted booking #{instance.id} '{action}' event to groups.")
    except Exception as e:
        logger.error(f"[WS Signals] Failed to broadcast booking signal for booking #{instance.id}: {e}")
