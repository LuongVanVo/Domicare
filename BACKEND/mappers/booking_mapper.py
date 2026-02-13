from dtos.booking_dto import BookingDTO
from dtos.responses.mini_booking_response import MiniBookingResponse, UserMini
from mappers.product_mapper import ProductMapper
from mappers.user_mapper import UserMapper
from models.booking import Booking
from models.product import Product


class BookingMapper:
    @staticmethod
    def to_dto(booking: Booking) -> BookingDTO:
        """Convert Booking entity to BookingDTO"""
        if not booking:
            return None

        # Map products
        products_dto = []
        if booking.products.exists():
            products_dto = [ProductMapper._to_product_dto(p) for p in booking.products.all()]

        # Map users
        user_dto = UserMapper.to_dto(booking.user) if booking.user else None
        sale_dto = UserMapper.to_dto(booking.sale_user) if booking.sale_user else None

        return BookingDTO(
            id=booking.id,
            address=booking.address,
            totalPrice=booking.total_price,
            note=booking.note,
            startTime=booking.start_time,
            products=products_dto,
            userDTO=user_dto,
            saleDTO=sale_dto,
            isPeriodic=booking.is_periodic,
            bookingStatus=booking.booking_status,
            phone=booking.phone,
            createBy=booking.create_by,
            updateBy=booking.update_by,
            createAt=booking.create_at,
            updateAt=booking.update_at,
        )

    @staticmethod
    def to_mini_response(booking: Booking) -> MiniBookingResponse:
        """Convert Booking entity to MiniBookingResponse"""
        if not booking:
            return None

        # Map products mini
        products_mini = []
        if booking.products.exists():
            products_mini = [ProductMapper._to_product_mini(p) for p in booking.products.all()]

        # Map user mini
        user_mini = None
        if booking.user:
            user_mini = UserMini(
                id=booking.user.id,
                name=booking.user.full_name,
                email=booking.user.email,
                avatar=booking.user.avatar,
                phone=booking.user.phone,
            )

        # Map sale user mini
        sale_mini = None
        if booking.sale_user:
            sale_mini = UserMini(
                id=booking.sale_user.id,
                name=booking.sale_user.full_name,
                email=booking.sale_user.email,
                avatar=booking.sale_user.avatar,
                phone=booking.sale_user.phone
            )

        return MiniBookingResponse(
            id=booking.id,
            address=booking.address,
            totalPrice=booking.total_price,
            note=booking.note,
            startTime=booking.start_time,
            products=products_mini,
            userDTO=user_mini,
            saleDTO=sale_mini,
            isPeriodic=booking.is_periodic,
            bookingStatus=booking.booking_status,
            phone=booking.phone,
            createBy=booking.create_by,
            updateBy=booking.update_by,
            createAt=booking.create_at,
            updateAt=booking.update_at,
        )

