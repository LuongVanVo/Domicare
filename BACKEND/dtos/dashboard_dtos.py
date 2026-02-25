from dataclasses import dataclass, asdict
from datetime import datetime
from typing import Dict, Optional

def to_camel_case(snake_str: str) -> str:
    """Convert snake_case string to camelCase"""
    components = snake_str.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])

@dataclass
class LocalDateRequest:
    """Request with datetime range"""
    start_date: datetime
    end_date: datetime

    def validate(self):
        """Validate datetime range"""
        if not self.start_date or not self.end_date:
            raise ValueError("Start date and end date must not be null or empty.")
        if self.start_date > self.end_date:
            raise ValueError("Start date must be before or equal end date.")

@dataclass
class DashboardSummaryDTO:
    "Individual dashboard metric"
    value: str
    change: str

@dataclass
class BookingOverview:
    """Booking statistics overview"""
    total_bookings: int
    total_success_bookings: int
    total_failed_bookings: int
    total_accepted_bookings: int
    total_rejected_bookings: int
    total_revenue_bookings: int
    total_pending_bookings: int

    def to_camel_dict(self) -> dict:
        """Convert to camelCase dictionary"""
        data = asdict(self)
        return {to_camel_case(k): v for k, v in data.items()}

@dataclass
class OverviewResponse:
    """Complete dashboard overview"""
    dashboard_summary: Dict[str, DashboardSummaryDTO]
    booking_overview: BookingOverview

    def to_camel_dict(self) -> dict:
        """Convert to camelCase dictionary"""
        return {
            'dashboardSummary': {
                to_camel_case(k): asdict(v) for k, v in self.dashboard_summary.items()
            },
            'bookingOverview': self.booking_overview.to_camel_dict()
        }


@dataclass
class ChartResponse:
    """Revenue chart for 12 months"""
    total_revenue: Dict[str, int]
    growth_rate: float

    def to_camel_dict(self) -> dict:
        """Convert to camelCase dictionary"""
        return {
            'totalRevenue': self.total_revenue,
            'growthRate': self.growth_rate
        }


@dataclass
class TopSaleResponse:
    """Top sales staff member"""
    id: int
    name: str
    avatar: Optional[str]
    email: str
    total_sale_price: float
    total_success_booking_percent: float

    def to_camel_dict(self) -> dict:
        """Convert to camelCase dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'avatar': self.avatar,
            'email': self.email,
            'totalSalePrice': self.total_sale_price,
            'totalSuccessBookingPercent': self.total_success_booking_percent
        }