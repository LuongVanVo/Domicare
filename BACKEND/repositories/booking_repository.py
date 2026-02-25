from datetime import datetime
from typing import Optional, List, Tuple

from django.db.models import Sum

from models.booking import Booking
from models.enums import BookingStatus
from models.product import Product


class BookingRepository:
    """Repository for Booking database operations"""
    @staticmethod
    def save(booking: Booking) -> Booking:
        """Save or update booking"""
        booking.save()
        return booking

    @staticmethod
    def find_by_id(booking_id: int) -> Optional[Booking]:
        """Find booking by ID"""
        try:
            return Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return None

    @staticmethod
    def find_by_id_with_user_and_products(booking_id: int) -> Optional[Booking]:
        """Find booking by ID with user and products eagerly loaded"""
        try:
            return Booking.objects.select_related('user', 'sale_user').prefetch_related('products').get(id=booking_id)
        except Booking.DoesNotExist:
            return None

    @staticmethod
    def find_by_user_id(user_id: int) -> List[Booking]:
        """Find all bookings by user ID"""
        return list(Booking.objects.filter(user_id=user_id).order_by('-create_at'))

    @staticmethod
    def find_by_create_by_and_status(create_by: str, status: BookingStatus) -> List[Booking]:
        """Find bookings by creator and status"""
        return list(Booking.objects.filter(
            create_by=create_by,
            status=status,
        ))

    @staticmethod
    def find_by_update_by_and_status(update_by: str, status: BookingStatus) -> List[Booking]:
        """Find bookings by updater and status"""
        return list(Booking.objects.filter(
            update_by=update_by,
            status=status,
        ))

    @staticmethod
    def find_by_update_by_and_status_in(update_by: str, statuses: List[BookingStatus]) -> List[Booking]:
        """Find bookings by updater and multiple statuses"""
        status_values = [s.value for s in statuses]
        return list(Booking.objects.filter(
            update_by=update_by,
            booking_status__in=status_values,
        ))

    @staticmethod
    def count_bookings_by_status(status: BookingStatus) -> int:
        """Count bookings by status"""
        return Booking.objects.filter(booking_status=status.value).count()

    @staticmethod
    def count_total_success_booking(status: BookingStatus, start_date: datetime, end_date: datetime) -> int:
        """Count total successful bookings in date range"""
        return Booking.objects.filter(
            booking_status=status.value,
            create_at__gte=start_date,
            create_at__lte=end_date,
        ).count()

    @staticmethod
    def count_total_revenue(status: BookingStatus, start_date: datetime, end_date: datetime) -> float:
        """Calculate total revenue in date range"""
        result = Booking.objects.filter(
            booking_status=status.value,
            create_at__gte=start_date,
            create_at__lte=end_date,
        ).aggregate(total=Sum('total_price'))

        return result['total'] or 0.0

    @staticmethod
    def count_bookings_by_user_id_and_created_at_after(user_id: int, created_at: datetime) -> int:
        """Count bookings by user after a specific date"""
        return Booking.objects.filter(
            user_id=user_id,
            create_at__gte=created_at,
        ).count()

    @staticmethod
    def exists_by_user_id_and_product_id_and_status(user_id: int, product_id: int, status: BookingStatus) -> bool:
        """Check if booking exists for user, product, and status"""
        return Booking.objects.filter(
            user_id=user_id,
            products__id=product_id,
            booking_status=status.value,
        ).exists()

    @staticmethod
    def exists_by_user_id_and_product_and_status_and_create_at_after(user_id: int, product: Product, status: BookingStatus, create_at: datetime) -> bool:
        """Check if booking exists after a specific"""
        return Booking.objects.filter(
            user_id=user_id,
            products=product,
            booking_status=status.value,
            create_at__gt=create_at,
        ).exists()

    @staticmethod
    def count_bookings_by_status_and_created_at_between(status: BookingStatus, start_date: datetime, end_date: datetime) -> int:
        """Count bookings by status in date range"""
        return Booking.objects.filter(
            booking_status=status.value,
            create_at__gte=start_date,
            create_at__lte=end_date,
        ).count()

    @staticmethod
    def count_total_booking_with_not_status(status: BookingStatus, start_date: datetime, end_date: datetime) -> int:
        """Count bookings NOT with specific status in date range"""
        return Booking.objects.filter(
            create_at__gte=start_date,
            create_at__lte=end_date,
        ).exclude(booking_status=status.value).count()

    @staticmethod
    def find_first_by_user_id_and_product_id_and_status_order_by_create_at_desc(user_id: int, product_id: int, status: BookingStatus) -> Optional[Booking]:
        """Find the most recent booking by user, product, and status"""
        return Booking.objects.filter(
            user_id=user_id,
            products__id=product_id,
            booking_status=status.value,
        ).order_by('-create_at').first()

    @staticmethod
    def soft_delete_by_ids(booking_ids: List[int]) -> None:
        """Soft delete multiple bookings"""
        Booking.objects.filter(id__in=booking_ids).update(
            booking_status=BookingStatus.CANCELLED.value
        )

    @staticmethod
    def find_top_revenue_sales(start_date: datetime, end_date: datetime) -> List[dict]:
        """Find top sales users by revenue in date range"""
        results = Booking.objects.filter(
            create_at__gte=start_date,
            create_at__lte=end_date,
            booking_status=BookingStatus.SUCCESS.value,
        ).values('update_by').annotate(
            total_revenue=Sum('total_price')
        ).order_by('-total_revenue')

        return [
            {
                'email': r['update_by'],
                'total_revenue': r['total_revenue'],
            }
            for r in results
        ]

    @staticmethod
    def find_all_paginated(
            page: int = 1,
            page_size: int = 20,
            user_id: Optional[int] = None,
            sale_id: Optional[int] = None,
            booking_status: Optional[str] = None,  # ← String thay vì BookingStatus
            other_booking_status: Optional[str] = None,  # ← THÊM: cho OR condition
            search_name: Optional[str] = None,  # ← THÊM: search by customer name
            sort_by: str = 'create_at',
            sort_direction: str = 'desc'
    ) -> Tuple[List[Booking], int]:
        """
        Find all bookings with pagination and complex filtering

        Filters:
        - user_id: Filter by customer user ID
        - sale_id: Filter by sale user ID
        - booking_status: Filter by status (PENDING, ACCEPTED, etc.)
        - other_booking_status: Secondary status for OR condition
        - search_name: Search by customer name (name_unsigned field)
        """
        # Base queryset with eager loading
        queryset = Booking.objects.select_related('user', 'sale_user').prefetch_related('products').all()

        # Filter by user (customer)
        if user_id and user_id > 0:
            queryset = queryset.filter(user_id=user_id)

        # Filter by sale user
        if sale_id and sale_id > 0:
            queryset = queryset.filter(sale_user_id=sale_id)

        # Filter by booking status (with OR logic if other_booking_status provided)
        if booking_status:
            if other_booking_status:
                # OR condition: status = A OR status = B
                queryset = queryset.filter(
                    Q(booking_status=booking_status.upper()) |
                    Q(booking_status=other_booking_status.upper())
                )
            else:
                # Single status filter
                queryset = queryset.filter(booking_status=booking_status.upper())

        # Search by customer name (using name_unsigned field)
        if search_name and search_name.strip():
            from utils.format_string import remove_accents
            clean_search_name = remove_accents(search_name.lower().strip())
            # Search in User's name_unsigned field
            queryset = queryset.filter(user__name_unsigned__icontains=clean_search_name)

        # Sorting
        sort_field = sort_by if sort_direction == 'asc' else f'-{sort_by}'
        queryset = queryset.order_by(sort_field)

        # Get total count BEFORE pagination
        total = queryset.count()

        # Pagination
        start = (page - 1) * page_size
        end = start + page_size
        bookings = list(queryset[start:end])

        return bookings, total