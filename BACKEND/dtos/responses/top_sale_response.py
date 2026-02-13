from typing import Optional

from pydantic import BaseModel, Field


class TopSaleResponse(BaseModel):
    """Top sale user response with revenue stats"""
    id: int
    name: str
    avatar: Optional[str] = None
    email: str
    total_sale_price: float = Field(..., alias="totalSalePrice")
    total_success_booking_percent: float = Field(..., alias="totalSuccessBookingPercent")

    class Config:
        populate_by_name = True