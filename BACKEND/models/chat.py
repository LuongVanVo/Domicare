"""Chat Message Model"""
from django.db import models
from .user import User

class Message(models.Model):
    """Message model representing a chat message between two users"""
    id = models.BigAutoField(primary_key=True)
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_messages',
        db_column='sender_id'
    )
    receiver = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_messages',
        db_column='receiver_id'
    )
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, db_column='created_at')
    updated_at = models.DateTimeField(auto_now=True, db_column='updated_at')

    class Meta:
        db_table = 'messages'
        ordering = ['-created_at']

    def __str__(self):
        return f"From {self.sender.email} to {self.receiver.email}: {self.message[:20]}"
