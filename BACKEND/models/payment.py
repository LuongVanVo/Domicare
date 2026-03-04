"""Payment Transaction Model"""
from django.db import models
from django.utils import timezone

from middlewares.current_user import get_current_user
from .booking import Booking
from .enums import PaymentStatus


class PaymentTransaction(models.Model):
    """PaymentTransaction model - maps to PAYMENT_TRANSACTIONS table"""
    id = models.BigAutoField(primary_key=True)
    order_id = models.CharField(
        max_length=255,
        unique=True,
        null=False,
        blank=False,
        db_index=True,
        help_text='VNPay order ID (vnp_TxnRef)'
    )
    # Payment amount in VND
    amount = models.BigIntegerField(
        null=False,
        help_text='Payment amount in VND'
    )
    # Order description
    order_info = models.TextField(
        blank=True,
        null=True,
        help_text='Order description (vnp_OrderInfo)'
    )
    # Payment status
    status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices(),
        default=PaymentStatus.PENDING.value,
        null=False,
        db_index=True
    )
    # VNPay transaction number (returned after payment)
    transaction_no = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        db_index=True,
        help_text='VNPay transaction number (vnp_TransactionNo)'
    )
    # Bank code used for payment
    bank_code = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text='Bank code used for payment (vnp_BankCode)'
    )
    # Payment date from VNPay (format: yyyyMMddHHmmss)
    pay_date = models.CharField(
        max_length=14,
        blank=True,
        null=True,
        help_text='Payment date from VNPay (yyyyMMddHHmmss) (vnp_PayDate)'
    )
    # VNPay response code
    response_code = models.CharField(
        max_length=10,
        blank=True,
        null=True,
        help_text='VNPay response code (vnp_ResponseCode)'
    )
    # Client IP address
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    
    # Relationship
    booking = models.ForeignKey(
        Booking,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payment_transactions',
        help_text='Related booking'
    )
    
    created_by = models.CharField(max_length=255, default='system', null=True, blank=True)
    updated_by = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(blank=True, null=True, auto_now_add=True)
    
    class Meta:
        db_table = 'payment_transactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order_id']),
            models.Index(fields=['transaction_no']),
            models.Index(fields=['status']),
            models.Index(fields=['-created_at']),
        ]
        # managed = True
    
    def __str__(self):
        return f"Payment {self.order_id} - {self.status}"
    
    def save(self, *args, **kwargs):
        # Handle audit fields (matches @PrePersist/@PreUpdate)
        if not self.pk:
            current_user = get_current_user()
            self.created_by = current_user if current_user else 'system'
        else:
            current_user = get_current_user()
            self.updated_by = current_user if current_user else 'system'

        super().save(*args, **kwargs)
