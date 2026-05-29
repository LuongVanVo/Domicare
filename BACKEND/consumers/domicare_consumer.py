"""WebSocket Consumer for Domicare Real-time Features (Chat & Notifications)"""
import logging
import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser

from models.user import User
from models.chat import Message

logger = logging.getLogger(__name__)

@database_sync_to_async
def is_admin_or_sale(user):
    """Check if the authenticated user has admin or sales roles"""
    try:
        if not user or user.is_anonymous:
            return False
        roles = list(user.roles.values_list('name', flat=True))
        return any(role in ['ROLE_ADMIN', 'ROLE_SALE'] for role in roles)
    except Exception as e:
        logger.error(f"[WS Consumer] Error checking roles for user {user.email}: {e}")
        return False

@database_sync_to_async
def save_chat_message(sender, receiver_id_str, message_text):
    """Asynchronously save a new chat message to the database"""
    try:
        from django.db.models import Q
        receiver_id = int(receiver_id_str)
        
        # If customer sends message to themselves (default UI behavior), map to Sale agent or Admin
        if receiver_id == sender.id:
            # First, check if there is an existing message exchange with another user
            last_message = Message.objects.filter(
                Q(sender=sender) | Q(receiver=sender)
            ).exclude(sender=sender, receiver=sender).order_by('-created_at').first()

            if last_message:
                receiver = last_message.receiver if last_message.sender == sender else last_message.sender
            else:
                from models.booking import Booking
                latest_booking = Booking.objects.filter(user=sender, sale_user__isnull=False).order_by('-create_at').first()
                if latest_booking:
                    receiver = latest_booking.sale_user
                else:
                    receiver = User.objects.filter(roles__name='ROLE_ADMIN').first() or User.objects.first()
        else:
            receiver = User.objects.get(id=receiver_id)

        message = Message.objects.create(
            sender=sender,
            receiver=receiver,
            message=message_text
        )
        return {
            "_id": str(message.id),
            "sender_id": str(message.sender_id),
            "receiver_id": str(message.receiver_id),
            "message": message.message,
            "created_at": message.created_at.isoformat(),
            "updated_at": message.updated_at.isoformat()
        }
    except User.DoesNotExist:
        logger.error(f"[WS Consumer] Receiver user {receiver_id_str} does not exist.")
        return None
    except ValueError:
        logger.error(f"[WS Consumer] Invalid receiver_id format: {receiver_id_str}")
        return None
    except Exception as e:
        logger.error(f"[WS Consumer] Error saving chat message from {sender.email}: {e}")
        return None

class DomicareConsumer(AsyncJsonWebsocketConsumer):
    """
    Consumer handling real-time features.
    Multiplexes both:
    1. real-time Chat messages
    2. real-time Booking notification invalidations
    """
    async def connect(self):
        self.user = self.scope.get('user', AnonymousUser())

        if not self.user or self.user.is_anonymous:
            logger.warning("[WS Connect] Connection rejected: Unauthenticated client.")
            await self.close()
            return

        self.user_group = f"user_{self.user.id}"
        self.is_staff = await is_admin_or_sale(self.user)

        # Connect user to personal group
        await self.channel_layer.group_add(
            self.user_group,
            self.channel_name
        )

        # If user is admin or sale, join the admin notification channel
        if self.is_staff:
            await self.channel_layer.group_add(
                "admin_notifications",
                self.channel_name
            )
            logger.info(f"[WS Connect] User {self.user.email} (STAFF) connected to groups: {self.user_group}, admin_notifications")
        else:
            logger.info(f"[WS Connect] User {self.user.email} connected to group: {self.user_group}")

        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'user_group'):
            await self.channel_layer.group_discard(
                self.user_group,
                self.channel_name
            )

        if hasattr(self, 'is_staff') and self.is_staff:
            await self.channel_layer.group_discard(
                "admin_notifications",
                self.channel_name
            )

        logger.info(f"[WS Disconnect] Connection closed for user: {getattr(self.user, 'email', 'Anonymous')}")

    async def receive_json(self, content):
        """Receive message from client over WebSocket"""
        action = content.get('action')

        if action == 'send_chat':
            receiver_id = content.get('receiver_id')
            message_text = content.get('message')

            if not receiver_id or not message_text:
                await self.send_json({
                    "type": "error",
                    "message": "Missing receiver_id or message body"
                })
                return

            # Save to database
            message_data = await save_chat_message(self.user, receiver_id, message_text)

            if message_data:
                # Send to receiver's group
                await self.channel_layer.group_send(
                    f"user_{message_data['receiver_id']}",
                    {
                        "type": "chat_message",
                        "data": message_data
                    }
                )
                # Send back to sender's group to sync UI across tabs
                await self.channel_layer.group_send(
                    f"user_{self.user.id}",
                    {
                        "type": "chat_message",
                        "data": message_data
                    }
                )
            else:
                await self.send_json({
                    "type": "error",
                    "message": "Failed to deliver message"
                })
        else:
            await self.send_json({
                "type": "error",
                "message": f"Unknown action: {action}"
            })

    async def chat_message(self, event):
        """Handler for events sent via channel layer with type='chat_message'"""
        await self.send_json({
            "type": "chat_message",
            "data": event["data"]
        })

    async def chat_message_delete(self, event):
        """Handler for message deletion events"""
        await self.send_json({
            "type": "chat_message_delete",
            "data": event["data"]
        })

    async def booking_notification(self, event):
        """Handler for booking status notifications"""
        await self.send_json({
            "type": "booking_notification",
            "action": event["action"],
            "data": event["data"]
        })
