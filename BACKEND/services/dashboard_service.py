from collections import OrderedDict
from typing import List

from django.utils import timezone
from dateutil.relativedelta import relativedelta
from dtos.dashboard_dtos import DashboardSummaryDTO, OverviewResponse, BookingOverview, ChartResponse, TopSaleResponse
from exceptions.booking_exception import InvalidDateException
from models.enums import BookingStatus
from services.booking_service import BookingService
from services.review_service import ReviewService
from services.user_service import UserService
from datetime import datetime, timedelta


class DashboardService:
    """Service for dashboard statistics and analytics"""
    def __init__(self):
        self.booking_service = BookingService()
        self.user_service = UserService()
        self.review_service = ReviewService()

    def get_dashboard_summary(self, start_date: datetime, end_date: datetime) -> OverviewResponse:
        """Get dashboard summary with metrics and their changes"""
        self._validate_date_range(start_date, end_date)

        # Calculate previous period (1 month before)
        prev_start = start_date - relativedelta(months=1)
        prev_end = end_date - relativedelta(months=1)

        summary = {}

        # Bookings metric
        current_bookings = self.booking_service.get_total_success_booking(start_date, end_date)
        prev_bookings = self.booking_service.get_total_success_booking(prev_start, prev_end)
        summary['bookings'] = DashboardSummaryDTO(
            value=str(current_bookings),
            change=str(self._calculate_change(current_bookings, prev_bookings))
        )

        # Total revenue metric
        current_revenue = self.booking_service.get_total_revenue(start_date, end_date)
        prev_revenue = self.booking_service.get_total_revenue(prev_start, prev_end)
        summary['totalRevenue'] = DashboardSummaryDTO(
            value=str(current_revenue),
            change=str(self._calculate_change(current_revenue, prev_revenue))
        )

        # Total users metric
        current_users = self.user_service.count_new_user_between(start_date, end_date)
        prev_users = self.user_service.count_new_user_between(prev_start, prev_end)
        summary['totalUsers'] = DashboardSummaryDTO(
            value=str(current_users),
            change=str(self._calculate_change(current_users, prev_users))
        )

        # Review metric
        current_reviews = self.review_service.count_total_reviews(start_date, end_date)
        prev_reviews = self.review_service.count_total_reviews(prev_start, prev_end)
        summary['reviews'] = DashboardSummaryDTO(
            value=str(current_reviews),
            change=str(self._calculate_change(current_reviews, prev_reviews))
        )

        # Get booking overview
        booking_overview = self.get_booking_overview(start_date, end_date)

        return OverviewResponse(
            dashboard_summary=summary,
            booking_overview=booking_overview,
        )

    def get_booking_overview(self, start_date: datetime, end_date: datetime) -> BookingOverview:
        """Get detailed booking statistics"""
        self._validate_date_range(start_date, end_date)

        return BookingOverview(
            total_bookings=self.booking_service.count_total_booking(start_date, end_date),
            total_accepted_bookings=self.booking_service.count_total_booking_by_status(BookingStatus.ACCEPTED, start_date, end_date),
            total_rejected_bookings=self.booking_service.count_total_booking_by_status(BookingStatus.REJECTED, start_date, end_date),
            total_failed_bookings=self.booking_service.count_total_booking_by_status(BookingStatus.FAILED, start_date, end_date),
            total_success_bookings=self.booking_service.count_total_booking_by_status(BookingStatus.SUCCESS, start_date, end_date),
            total_pending_bookings=self.booking_service.count_total_booking_by_status(BookingStatus.PENDING, start_date, end_date),
            total_revenue_bookings=self.booking_service.get_total_revenue(start_date, end_date),
        )

    def get_total_revenue_12_months(self) -> ChartResponse:
        """Get revenue data for the last 12 months with growth rate"""
        revenue_map = OrderedDict()

        # Initialize all 12 months with 0 revenue
        for i in range(1, 13):
            revenue_map[f'Th {i:02d}'] = 0.0

        current_date = timezone.now()

        # Calculate revenue for last 12 months
        for i in range(11, -1, -1):
            month_date = current_date - relativedelta(months=i)

            # Get first day of month at 00:00:00
            month_start = month_date.replace(
                day=1, hour=0, minute=0, second=0, microsecond=0
            )

            # Get last day of month at 23:59:59
            if month_date.month == 12:
                month_end = month_date.replace(day=31, hour=23, minute=59, second=59, microsecond=999999)
            else:
                next_month = month_date.replace(day=28) + timedelta(days=4)
                last_day = (next_month - timedelta(days=next_month.day)).day
                month_end = month_date.replace(
                    day=last_day, hour=23, minute=59, second=59, microsecond=999999
                )

            total_revenue = self.booking_service.get_total_revenue(month_start, month_end)
            month_key = f'Th {month_start.month:02d}'
            revenue_map[month_key] = total_revenue if total_revenue else 0

        # Calculate growth rate (current month vs previous month)
        current_month_key = f'Th {current_date.month:02d}'
        prev_month = current_date - relativedelta(months=1)
        previous_month_key = f'Th {prev_month.month:02d}'

        current_month_revenue = revenue_map.get(current_month_key, 0)
        previous_month_revenue = revenue_map.get(previous_month_key, 0)

        growth_rate = 0.0
        if previous_month_revenue > 0:
            growth_rate = (
                (current_month_revenue - previous_month_revenue) / previous_month_revenue * 100
            )
            growth_rate = round(growth_rate, 2)

        return ChartResponse(
            total_revenue=revenue_map,
            growth_rate=growth_rate,
        )

    def get_top_sale(self, start_date: datetime, end_date: datetime) -> List[TopSaleResponse]:
        """Get top 5 sales with by revenue and success rate"""
        self._validate_date_range(start_date, end_date)

        top_sales_data = self.booking_service.get_five_top_sale(start_date, end_date)

        # Convert to DTOs
        return [
            TopSaleResponse(
                id=sale.id,
                name=sale.name,
                avatar=sale.avatar,
                email=sale.email,
                total_sale_price=getattr(sale, 'totalSalePrice', getattr(sale, 'totalSalePrice', 0.0)),
                total_success_booking_percent=getattr(sale, 'totalSuccessBookingPercent',
                                                      getattr(sale, 'total_success_booking_percent', 0.0))
            )
            for sale in top_sales_data
        ]

    # HELPER METHODS
    def _calculate_change(self, current: int, previous: int) -> float:
        """Calculate percentage change between current and previous values"""
        if previous is None or previous == 0:
            return 100.0 if current > 0 else 0.0

        change = ((current - previous) * 100.0) / previous
        return round(change, 2)
    def _validate_date_range(self, start_date: datetime, end_date: datetime):
        """Validate date range"""
        if not start_date or not end_date:
            raise InvalidDateException("Start date and end date must not be null or empty.")
        if start_date > end_date:
            raise InvalidDateException("Start date must be before or equal to end date.")