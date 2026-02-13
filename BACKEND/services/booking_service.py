import logging
import secrets
import string
from datetime import timedelta, datetime
from django.utils import timezone
from typing import Optional, List
from django.db import transaction, connection
from dtos.booking_dto import BookingDTO
from dtos.requests.booking_request import BookingRequest
from dtos.requests.update_booking_request import UpdateBookingRequest
from dtos.requests.update_booking_status_request import UpdateBookingStatusRequest
from dtos.responses.mini_booking_response import MiniBookingResponse
from dtos.responses.top_sale_response import TopSaleResponse
from dtos.user_dto import UserDTO
from exceptions.base import UnauthorizedException, NotFoundException, ForbiddenException
from exceptions.booking_exception import TooMuchBookingException, AlreadyPendingBookingException, InvalidDateException, \
    BookingNotFoundException, BookingStatusException, AlreadySaleHandleException
from exceptions.user_exceptions import EmailAlreadyExistsException
from mappers.booking_mapper import BookingMapper
from middlewares.current_user import get_current_user
from models.booking import Booking
from models.enums import BookingStatus
from models.product import Product
from models.user import User
from repositories.booking_repository import BookingRepository
from repositories.product_repository import ProductRepository
from repositories.user_repository import UserRepository
from services.email_service import EmailService
from services.user_service import UserService

logger = logging.getLogger(__name__)
DEFAULT_AVATAR = "http://res.cloudinary.com/dnswn0tfq/image/upload/v1768915182/n7fg4oy5mgegoadnqpdr.png"
class BookingService:
    """Booking Service - Business logic for booking management"""
    def __init__(self):
        self.booking_repo = BookingRepository()
        self.user_repo = UserRepository()
        self.product_repo = ProductRepository()
        self.email_service = EmailService()
        self.user_service = UserService()

    @transaction.atomic
    def add_booking(self, request: BookingRequest, current_user_email: Optional[str] = None) -> MiniBookingResponse:
        """Create a new booking"""
        logger.info("[BookingService] Creating new booking")

        user = None
        guest_email = request.guest_email

        # Case 1: Guest user (no authentication)
        if guest_email and guest_email.strip():
            logger.info(f"[BookingService] Guest booking with email: {guest_email}")
            if not request.name or not request.name.strip():
                raise ValueError("Name is required for guest booking")
            user = self._handle_guest_user(guest_email, request)

        # Case 2: Authenticated user
        else:
            if not current_user_email:
                raise UnauthorizedException('Not found authenticated user.')

            logger.info(f"[BookingService] Authenticated booking for user: {current_user_email}")
            user = self.user_repo.find_by_email(current_user_email)
            if not user:
                raise NotFoundException(f"User with email {current_user_email} not found.")

            logger.info(f"[BookingService] User Found: id={user.id}, email={user.email}")

        # Validations
        self._validate_too_much_booking_per_hour(user.id)
        self._validate_already_booked_and_pending(user.id, request.product_ids[0], request)
        self._validate_start_time(request.start_time)

        # Create booking
        booking = Booking()
        booking.address = request.address.strip()
        booking.note = request.note.strip() if request.note else None
        booking.phone = request.phone.strip()
        booking.is_periodic = request.is_periodic
        booking.start_time = request.start_time
        booking.user = user
        booking.create_by = user.email
        booking.booking_status = BookingStatus.PENDING.value

        # Get products
        if not request.product_ids:
            raise ValueError("Product IDs cannot be null or empty")

        products = self.product_repo.find_all_by_id_in(request.product_ids)
        if not products:
            raise NotFoundException("Products not found")

        # Calculate total price
        total_price = self._calculate_total_price(products)
        booking.total_price = total_price

        # Save booking
        saved_booking = self.booking_repo.save(booking)

        # Add products to booking(many-to-many)
        if products:
            with connection.cursor() as cursor:
                for product in products:
                    cursor.execute(
                        "INSERT INTO booking_products (booking_id, product_id) VALUES (%s, %s)",
                        [saved_booking.id, product.id]
                    )

        logger.info(f"[BookingService] Booking created successfully with ID: {saved_booking.id}")
        logger.info(f"[BookingService] User with email: {user.email} has been associated with booking ID: {saved_booking.id}")

        # Prepare response
        response = BookingMapper.to_mini_response(saved_booking)

        logger.info(f"[BookingService] New booking sent for booking ID: {saved_booking.id}")
        return response

    def fetch_booking_by_id(self, booking_id: int) -> MiniBookingResponse:
        """Get booking by ID"""
        if not booking_id:
            raise ValueError("Booking ID cannot be null or empty")

        logger.debug(f"[BookingService] Fetching booking with ID: {booking_id}")

        booking = self.booking_repo.find_by_id_with_user_and_products(booking_id)
        if not booking:
            raise BookingNotFoundException(f"Booking not found with ID: {booking_id}")

        return BookingMapper.to_mini_response(booking)

    @transaction.atomic
    def delete_booking(self, booking_id: int) -> MiniBookingResponse:
        """Soft delete booking (set status to CANCELLED), but cannot delete if status is ACCEPTED or CANCELED"""
        if not booking_id:
            raise ValueError("Booking ID cannot be null or empty")

        logger.info(f"[BookingService] Attempting to delete booking with ID: {booking_id}")

        current_user = get_current_user()
        if not current_user:
            raise UnauthorizedException('Not found authenticated user.')

        booking = self.booking_repo.find_by_id(booking_id)
        if not booking:
            raise BookingNotFoundException(f"Booking not found with ID: {booking_id}")

        # Check ownership, only owner or admin, sale can delete
        is_admin_sale_user = any(role.name in ['ROLE_ADMIN', 'ROLE_SALE'] for role in current_user.roles.all())
        is_owner = booking.user.id == current_user.id

        if not is_admin_sale_user and not is_owner:
            logger.error(
                f"[BookingService] User {current_user.id} tried to delete booking {booking_id} owned by user {booking.user.id}")
            raise ForbiddenException("You do not have permission to delete this booking")

        # Validate status
        if booking.booking_status in [BookingStatus.ACCEPTED.value, BookingStatus.CANCELLED.value]:
            logger.warning(f"[BookingService] Cannot delete booking with ID: {booking_id} due to status: {booking.booking_status}")
            raise BookingStatusException(f"Cannot delete booking with status: {booking.booking_status}")

        # Set status to CANCELLED
        booking.booking_status = BookingStatus.CANCELLED.value
        saved_booking = self.booking_repo.save(booking)

        logger.info(f"[BookingService] Booking with ID: {booking_id} has been cancelled successfully")

        response = BookingMapper.to_mini_response(saved_booking)
        logger.info(f"[BookingService] Booking deletion successfully processed for booking ID: {booking_id}")
        return response

    @transaction.atomic
    def update_booking(self, request: UpdateBookingRequest) -> MiniBookingResponse:
        """
            Update booking information
            Rules:
                - Can only update if status is PENDING or ACCEPTED
                - Also updates user info (name)
                - Recalculates total price if products are changed
        """
        current_user = get_current_user()
        if not current_user:
            raise UnauthorizedException('Not found authenticated user.')

        if not request or not request.booking_id:
            raise ValueError("Update request or booking ID cannot be null")

        booking_id = request.booking_id
        logger.info(f"[BookingService] Updating booking with ID: {booking_id}")

        booking = self.booking_repo.find_by_id(booking_id)
        if not booking:
            raise BookingNotFoundException(f"Booking not found with ID: {booking_id}")

        # Validate status
        if booking.booking_status not in [BookingStatus.PENDING.value, BookingStatus.ACCEPTED.value]:
            logger.warning(f"[BookingService] Cannot update booking with ID: {booking_id} due to status: {booking.booking_status}")
            raise BookingStatusException(f"Cannot update booking with status: {booking.booking_status}")

        # Check ownership, only owner or admin, sale can delete
        is_admin_sale_user = any(role.name in ['ROLE_ADMIN', 'ROLE_SALE'] for role in current_user.roles.all())
        is_owner = booking.user.id == current_user.id

        if not is_admin_sale_user and not is_owner:
            logger.error(
                f"[BookingService] User {current_user.id} tried to update booking {booking_id} owned by user {booking.user.id}")
            raise ForbiddenException("You do not have permission to delete this booking")

        self._validate_start_time(request.start_time)

        # Update product if changed
        if request.product_id:
            products = self.product_repo.find_all_by_id_in([request.product_id])
            if not products:
                raise NotFoundException(f"Product not found with ID: {request.product_id}")

            with connection.cursor() as cursor:
                cursor.execute("DELETE FROM booking_products WHERE booking_id = %s", [booking.id])

                for product in products:
                    cursor.execute(
                        "INSERT INTO booking_products (booking_id, product_id) VALUES (%s, %s)",
                        [booking.id, product.id]
                    )

            # Recalculate total price
            total_price = self._calculate_total_price(products)
            booking.total_price = total_price

        # Update other fields
        if request.address:
            booking.address = request.address.strip()
        if request.note:
            booking.note = request.note.strip()
        if request.phone:
            booking.phone = request.phone.strip()
        if request.start_time:
            booking.start_time = request.start_time
        if request.is_periodic is not None:
            booking.is_periodic = request.is_periodic

        # Update user name
        if request.name:
            user = booking.user
            if not user:
                raise NotFoundException(f"User not found for booking ID: {booking_id}")

            user.name = request.name.strip()
            self.user_repo.save(user)

        # Save booking
        updated_booking = self.booking_repo.save(booking)
        logger.info(f"[BookingService] Booking updated successfully with ID: {booking_id}")

        # Update status if provided
        if request.status:
            status_request = UpdateBookingStatusRequest(
                bookingId=booking_id,
                status=request.status
            )
            return self.update_booking_status(status_request)

        # Return updated booking if no status change
        return BookingMapper.to_mini_response(updated_booking)

    def get_all_bookings_by_user_id(self, user_id: int) -> List[BookingDTO]:
        """Get all booking for a specific user"""
        if not user_id:
            raise ValueError("User ID cannot be null or empty")

        logger.debug(f"[BookingService] Fetching all bookings for user ID: {user_id}")

        if not self.user_repo.exists_by_id(user_id):
            raise NotFoundException(f"User not found with ID: {user_id}")

        bookings = self.booking_repo.find_by_user_id(user_id)
        if not bookings:
            logger.debug(f"[BookingService] No bookings found for user ID: {user_id}")
            return []

        return [BookingMapper.to_dto(booking) for booking in bookings]

    @transaction.atomic
    @transaction.atomic
    def update_booking_status(
            self,
            request: UpdateBookingStatusRequest,
            current_user_email: str
    ) -> MiniBookingResponse:
        """
        Update booking status with role-based authorization

        Authorization Rules:
        - PENDING → ACCEPTED: Only SALE
        - PENDING → REJECTED: Only SALE
        - PENDING → CANCELLED: USER (owner) or SALE
        - ACCEPTED → SUCCESS: Only SALE (same user who accepted)
        - ACCEPTED → FAILED: Only SALE (same user who accepted)
        """

        if not request or not request.booking_id or not request.status:
            raise ValueError("Update request, booking ID, or status cannot be null")

        booking_id = request.booking_id
        status_str = request.status

        logger.info(f"[Booking] Updating booking status for ID: {booking_id} to {status_str}")

        # Get current user
        if not current_user_email:
            raise UnauthorizedException('User not found')

        current_user = self.user_repo.find_by_email(current_user_email)
        if not current_user:
            raise NotFoundException(f"User not found with email: {current_user_email}")

        # Get user roles
        user_roles = [role.name for role in current_user.roles.all()]
        is_sale = 'ROLE_SALE' in user_roles
        is_admin = 'ROLE_ADMIN' in user_roles

        logger.info(f"[Booking] Current user: {current_user_email}, Roles: {user_roles}")

        # Initialize statistics if needed
        if current_user.sale_total_bookings is None:
            current_user.sale_total_bookings = 0
        if current_user.user_total_success_bookings is None:
            current_user.user_total_success_bookings = 0
        if current_user.user_total_failed_bookings is None:
            current_user.user_total_failed_bookings = 0
        if current_user.sale_success_percent is None:
            current_user.sale_success_percent = 0.0

        # Validate and parse new status
        try:
            new_status = BookingStatus(status_str.upper())
        except ValueError:
            raise ValueError(f"Invalid booking status: {status_str}")

        # Get booking with related data
        booking = self.booking_repo.find_by_id_with_user_and_products(booking_id)
        if not booking:
            raise NotFoundException(f"Booking not found with ID: {booking_id}")

        customer = booking.user
        if not customer:
            raise NotFoundException(f"Customer not found for booking ID: {booking_id}")

        # Initialize customer statistics
        if customer.user_total_success_bookings is None:
            customer.user_total_success_bookings = 0
        if customer.user_total_failed_bookings is None:
            customer.user_total_failed_bookings = 0

        current_status = BookingStatus(booking.booking_status)
        logger.info(f"[Booking] Current status: {current_status}, New status: {new_status}")


        if current_status == BookingStatus.PENDING:

            if new_status == BookingStatus.ACCEPTED:
                # Only SALE_USER can accept bookings
                if not is_sale:
                    logger.warning(
                        f"[Booking] User {current_user_email} (roles: {user_roles}) tried to accept booking {booking_id}")
                    raise ForbiddenException("Only SALE users can accept bookings")

                booking.booking_status = BookingStatus.ACCEPTED.value

                # Send acceptance email
                if booking.products.exists():
                    product_name = booking.products.first().name
                    self.email_service.send_accepted_to_user(
                        customer.email,
                        product_name,
                        str(booking.create_at),
                        customer.full_name
                    )

                # Assign sale user
                booking.sale_user = current_user
                current_user.sale_total_bookings += 1
                logger.info(f"[Booking] Booking {booking_id} accepted by SALE user {current_user_email}")

            elif new_status == BookingStatus.REJECTED:
                # Only SALE can reject bookings
                if not is_sale:
                    logger.warning(
                        f"[Booking] User {current_user_email} (roles: {user_roles}) tried to reject booking {booking_id}")
                    raise ForbiddenException("Only SALE users can reject bookings")

                booking.booking_status = BookingStatus.REJECTED.value

                # Send rejection email
                if booking.products.exists():
                    product_name = booking.products.first().name
                    self.email_service.send_reject_to_user(
                        customer.email,
                        product_name,
                        str(booking.create_at),
                        customer.full_name
                    )

                booking.sale_user = current_user
                logger.info(f"[Booking] Booking {booking_id} rejected by SALE user {current_user_email}")

            elif new_status == BookingStatus.CANCELLED:
                # USER (owner) or SALE can cancel
                if not is_sale and booking.user.id != current_user.id:
                    logger.warning(
                        f"[Booking] User {current_user_email} tried to cancel booking {booking_id} owned by {customer.email}")
                    raise ForbiddenException("You can only cancel your own bookings")

                booking.booking_status = BookingStatus.CANCELLED.value
                logger.info(f"[Booking] Booking {booking_id} cancelled by {current_user_email}")

            elif new_status == BookingStatus.PENDING:
                logger.info(f"[Booking] Booking {booking_id} is already in PENDING status")

            else:
                raise BookingStatusException(f"Cannot update booking to status: {new_status}")

        elif current_status == BookingStatus.ACCEPTED:
            # Only SALE can complete accepted bookings
            if not is_sale:
                logger.warning(
                    f"[Booking] User {current_user_email} (roles: {user_roles}) tried to complete booking {booking_id}")
                raise ForbiddenException("Only SALE users can complete bookings")

            # Must be the same SALE user who accepted
            if booking.sale_user and booking.sale_user.id != current_user.id:
                logger.warning(
                    f"[Booking] SALE user {current_user_email} tried to complete booking {booking_id} handled by {booking.sale_user.email}")
                raise ForbiddenException("This booking has already been handled by another sale user")

            if new_status == BookingStatus.FAILED:
                booking.booking_status = BookingStatus.FAILED.value
                customer.user_total_failed_bookings += 1
                self._calculate_success_percentage(current_user)
                logger.info(f"[Booking] Booking {booking_id} marked as FAILED by SALE user {current_user_email}")

            elif new_status == BookingStatus.SUCCESS:
                booking.booking_status = BookingStatus.SUCCESS.value
                current_user.user_total_success_bookings += 1
                customer.user_total_success_bookings += 1
                self._calculate_success_percentage(current_user)
                logger.info(f"[Booking] Booking {booking_id} marked as SUCCESS by SALE user {current_user_email}")

            elif new_status == BookingStatus.ACCEPTED:
                logger.info(f"[Booking] Booking {booking_id} is already in ACCEPTED status")

            else:
                raise BookingStatusException(f"Cannot update booking to status: {new_status}")

        else:
            # Terminal states (REJECTED, SUCCESS, FAILED, CANCELLED)
            raise BookingStatusException(f"Cannot update booking from status: {current_status}")

        # Save changes
        booking.update_by = current_user_email
        updated_booking = self.booking_repo.save(booking)
        self.user_repo.save(current_user)
        self.user_repo.save(customer)

        logger.info(f"[Booking] Booking {booking_id} status updated successfully to {new_status}")

        # Prepare response
        response = BookingMapper.to_mini_response(updated_booking)

        return response

    # STATISTICS & ANALYTICS
    def get_all_booking(
        self,
        page: int = 1,
        page_size: int = 20,
        user_id: Optional[int] = None,
        sale_id: Optional[int] = None,
        booking_status: Optional[str] = None,
        other_booking_status: Optional[str] = None,
        search_name: Optional[str] = None,
        sort_by: str = 'create_at',
        sort_direction: str = 'desc'
    ) -> dict:
        logger.info(f"[BookingService] Fetching all bookings with pagination, filtering and sorting")

        bookings, total = self.booking_repo.find_all_paginated(
            page=page,
            page_size=page_size,
            user_id=user_id,
            sale_id=sale_id,
            booking_status=booking_status,
            other_booking_status=other_booking_status,
            search_name=search_name,
            sort_by=sort_by,
            sort_direction=sort_direction
        )

        booking_dtos = [BookingMapper.to_mini_response(booking) for booking in bookings]

        # Build paginated response
        total_pages = (total + page_size - 1) // page_size

        return {
            'meta': {
                'page': page,
                'pageSize': page_size,
                'total': total,
                'totalPages': total_pages
            },
            'data': [dto.model_dump(by_alias=True) for dto in booking_dtos]
        }

    def get_total_revenue(self, start_date: datetime, end_date: datetime) -> int:
        """Get total revenue in date range"""
        if not start_date or not end_date:
            raise ValueError('Start date and end date cannot be null.')
        if start_date > end_date:
            raise ValueError('Start date cannot be after end date.')

        logger.debug(f"[BookingService] Calculating total revenue from {start_date} to {end_date}")

        total_revenue = self.booking_repo.count_total_revenue(
            status=BookingStatus.SUCCESS,
            start_date=start_date,
            end_date=end_date
        )

        total_revenue = total_revenue if total_revenue else 0

        logger.debug(f"[BookingService] Total revenue calculated: {total_revenue}")
        return int(total_revenue)

    def get_total_success_booking(self, start_date: datetime, end_date: datetime) -> int:
        """Get total successful bookings in date range"""
        if not start_date or not end_date:
            raise ValueError('Start date and end date cannot be null.')
        if start_date > end_date:
            raise ValueError('Start date cannot be after end date.')

        logger.debug(f"[BookingService] Calculating total successful bookings from {start_date} to {end_date}")

        total_bookings = self.booking_repo.count_bookings_by_status_and_created_at_between(
            status=BookingStatus.SUCCESS,
            start_date=start_date,
            end_date=end_date
        )

        return total_bookings if total_bookings else 0

    def count_total_booking_by_status(self, status: BookingStatus, start_date: datetime, end_date: datetime
    ) -> int:
        """Count bookings by status in date range"""
        if not start_date or not end_date:
            raise InvalidDateException("Start date and end date cannot be null")
        if start_date > end_date:
            raise InvalidDateException("Start date must be before or equal to end date")

        logger.debug(f"[BookingService] Counting total bookings with status {status} from {start_date} to {end_date}")

        total_bookings = self.booking_repo.count_bookings_by_status_and_created_at_between(
            status,
            start_date,
            end_date
        )

        return total_bookings if total_bookings else 0

    def count_total_booking(self, start_date: datetime, end_date: datetime) -> int:
        """Count total bookings (excluding CANCELLED) in date range """
        if not start_date or not end_date:
            raise InvalidDateException("Start date and end date cannot be null")
        if start_date > end_date:
            raise InvalidDateException("Start date must be before or equal to end date")

        logger.debug(f"[BookingService] Counting total bookings from {start_date} to {end_date}")

        total_bookings = self.booking_repo.count_total_booking_with_not_status(
            BookingStatus.CANCELLED,
            start_date,
            end_date
        )

        return total_bookings if total_bookings else 0

    def get_five_top_sale(self, start_date: datetime, end_date: datetime) -> List[TopSaleResponse]:
        """Get top 5 sale users by revenue"""
        if not start_date or not end_date:
            raise ValueError('Start date and end date cannot be null.')
        if start_date > end_date:
            raise ValueError('Start date cannot be after end date.')

        logger.debug(f"[BookingService] Fetching top revenue generating sale from {start_date} to {end_date}")

        top_sales_data = self.booking_repo.find_top_revenue_sales(start_date, end_date)
        if not top_sales_data:
            logger.debug(f"[BookingService] No sales data found from {start_date} to {end_date}")
            return []

        top_sales = []

        for data in top_sales_data:
            email = data['email']
            total_revenue = data['total_revenue']

            user = self.user_repo.find_by_email(email)
            if not user:
                logger.warning(f"[BookingService] User not found with email: {email}")
                continue

            response = TopSaleResponse(
                id=user.id,
                name=user.full_name or "Unknown User",
                email=email,
                avatar=user.avatar,
                totalSalePrice=total_revenue,
                totalSuccessBookingPercent=user.sale_success_percent or 0.0
            )

            logger.info(
                f"[BookingService] Top sale: {response.name} - ID: {response.id}, Total: {total_revenue}, Success: {response.total_success_booking_percent}%")

            top_sales.append(response)

        return top_sales[:5]


    # PRIVATE HELPER METHODS
    def _handle_guest_user(self, guest_email: str, request: BookingRequest) -> User:
        """
            Handle guest user booking
            - If email exists and active -> error
            - If email exists and inactive -> use existing user
            - If email not exists -> create new user with random password
        """
        existing_user = self.user_repo.find_by_email(guest_email)

        if existing_user:
            if existing_user.is_active:
                raise EmailAlreadyExistsException('Email already registered.')
            else:
                return existing_user
        else:
            # Create new guest user
            random_password = self._generate_random_password()
            user_dto = UserDTO(
                email=guest_email,
                name=request.name,
                phone=request.phone,
                address=request.address,
                password=random_password,
                avatar=DEFAULT_AVATAR,
                isActive=False,
                isEmailConfirmed=True
            )

            new_user_dto = self.user_service.save_user(user_dto)
            user = self.user_repo.find_by_email(new_user_dto.email)

            # Send password to guest email
            self.email_service.send_password_to_user(
                guest_email,
                new_user_dto.name or "Guest",
                random_password,
            )

            return user

    def _validate_too_much_booking_per_hour(self, user_id: int) -> None:
        """Validate user hasn't created more than 5 bookings in the last hour"""
        one_hour_ago = timezone.now() - timedelta(hours=1)

        booking_count = self.booking_repo.count_bookings_by_user_id_and_created_at_after(user_id, one_hour_ago)

        if booking_count >= 5:
            logger.warning(f"[BookingService] User with ID: {user_id} has too many bookings in the last hour: {booking_count}")
            raise TooMuchBookingException("You have placed more than 5 orders in the last 1 hour. Please try again later")

    def _validate_already_booked_and_pending(self, user_id: int, product_id: int, request: BookingRequest) -> None:
        """Validate user doesn't have a pending booking for the same product with same address/date"""
        existing_booking = self.booking_repo.find_first_by_user_id_and_product_id_and_status_order_by_create_at_desc(
            user_id=user_id,
            product_id=product_id,
            status=BookingStatus.PENDING
        )

        if existing_booking:
            booking_address = existing_booking.address
            booking_date = existing_booking.start_time
            request_address = request.address
            request_date = request.start_time
            
            if booking_address == request_address or booking_date == request_date:
                logger.warning(f"[BookingService] User with ID: {user_id} already has a pending booking for product ID: {product_id}")
                raise AlreadyPendingBookingException('You already have a pending order for this product')

    def _validate_start_time(self, start_time: datetime) -> None:
        """Validate start time is in the future"""
        if not start_time:
            return

        now = timezone.now()

        if start_time < now:
            raise InvalidDateException('Start time cannot be in the past.')

    def _calculate_total_price(self, products: List[Product]) -> float:
        """Calculate total price with discount"""
        total_price = 0.0

        for product in products:
            if product.price is None:
                raise ValueError(f"Product price cannot be null (Product ID: {product.id})")

            discount_percent = product.discount if product.discount else 0
            price_after_discount = product.price * (100 - discount_percent) / 100
            total_price += price_after_discount
        return total_price

    def _calculate_success_percentage(self, sale_user: User) -> None:
        """Calculate sale user's booking success percentage"""
        if not sale_user.sale_total_bookings or sale_user.sale_total_bookings == 0:
            sale_user.sale_success_percent = 0.0
            return

        if sale_user.user_total_success_bookings is None:
            sale_user.user_total_success_bookings = 0.0

        success_percentage = (sale_user.user_total_success_bookings / sale_user.sale_total_bookings) * 100
        sale_user.sale_success_percent = success_percentage

    def _generate_random_password(self, length: int = 12) -> str:
        """Generate a random password"""
        alphabet = string.ascii_letters + string.digits
        return ''.join(secrets.choice(alphabet) for _ in range(length))