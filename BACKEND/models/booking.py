"""Booking Model"""
from enum import Enum

from django.db import models
from .enums import BookingStatus
from django.utils import timezone

class Booking(models.Model):
    """Booking model - maps to BOOKINGS table"""
    id = models.BigAutoField(primary_key=True)
    address = models.TextField()
    note = models.TextField(blank=True, null=True)
    is_periodic = models.BooleanField(default=False)
    start_time = models.DateTimeField()
    phone = models.CharField(max_length=20)
    total_price = models.DecimalField(max_digits=15, decimal_places=2)
    booking_status = models.CharField(
        max_length=20,
        choices=BookingStatus.choices(),
        default=BookingStatus.PENDING.value,
    )
    create_by = models.CharField(max_length=255, default='system')
    update_by = models.CharField(max_length=255, blank=True, null=True)
    create_at = models.DateTimeField(default=timezone.now)
    update_at = models.DateTimeField(blank=True, null=True)

    # Relationships
    products = models.ManyToManyField(
        'Product',
        through='BookingProduct',
        related_name='bookings'
    )

    user = models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
        related_name='bookings',
        db_column='user_id'
    )

    sale_user = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        related_name='sales_bookings',
        db_column='sale_user_id',
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'bookings'
        managed = True

    def __str__(self):
        return f"Booking #{self.id} - {self.booking_status}"

    def save(self, *args, **kwargs):
        # Handle audit fields (matches @PrePersist/@PreUpdate)
        if not self.pk:
            if not self.create_at:
                self.create_at = timezone.now()
        else:
            self.update_at = timezone.now()
        super().save(*args, **kwargs)


class BookingProduct(models.Model):
    """Join table booking_products"""
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, db_column='booking_id')
    product = models.ForeignKey('Product', on_delete=models.CASCADE, db_column='product_id')

    class Meta:
        db_table = 'booking_products'
        managed = True
        unique_together = ('booking', 'product')
