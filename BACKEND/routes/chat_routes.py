"""Chat API routes definition"""
from controllers import chat_controller
from django.urls import path

urlpatterns = [
    # Chat History and Conversations
    path('conversations/receivers', chat_controller.get_conversations, name='get_conversations'),
    path('conversations/receivers/<str:receiver_id>', chat_controller.get_conversation_with_receiver, name='get_conversation_with_receiver'),
    path('conversations/messages/<str:message_id>', chat_controller.delete_message, name='delete_message'),
]
