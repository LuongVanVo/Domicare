import logging
from datetime import datetime, time
from typing import Optional

from dtos.requests.review_request import ReviewRequest
from exceptions.base import ValidationException
from exceptions.product_exceptions import ProductNotFoundException
from exceptions.user_exceptions import UserNotFoundException
from mappers.user_mapper import UserMapper
from models.enums import BookingStatus
from models.review import Review
from dtos.review_dto import ReviewDTO
from exceptions.review_exception import ReviewNotFoundException, NotBookedProductException, \
    AlreadyReviewProductException
from repositories.booking_repository import BookingRepository
from repositories.product_repository import ProductRepository
from repositories.review_repository import ReviewRepository
from repositories.user_repository import UserRepository

logger = logging.getLogger(__name__)
class ReviewService:
    def __init__(self):
        self.review_repo = ReviewRepository()
        self.product_repo = ProductRepository()
        self.user_repo = UserRepository()
        self.booking_repo = BookingRepository()

    def get_review_by_id(self, review_id: int) -> ReviewDTO:
        """Get review by ID"""
        logger.info(f"[ReviewService] Fetching review with ID: {review_id}")

        review = self.review_repo.find_by_id(review_id)
        if not review:
            logger.error(f"[ReviewService] Review not found with ID: {review_id}")
            raise ReviewNotFoundException(f"Review with ID {review_id} not found.")

        logger.info(f"[ReviewService] Review fetched successfully with ID: {review_id}")
        return self._to_dto(review)

    def create_review(self, request: ReviewRequest, current_user_email: str) -> ReviewDTO:
        """Create a new review"""
        logger.info(f"[ReviewService] Creating review for product ID: {request.product_id}")

        product_id = request.product_id
        # Get current user
        user = self.user_repo.find_by_email(current_user_email)
        if not user:
            logger.error(f"[ReviewService] User not found with email: {current_user_email}")
            raise UserNotFoundException(f"User with email {current_user_email} not found.")

        user_id = user.id

        # Validate product exists
        product = self.product_repo.find_by_id_and_not_deleted(product_id)
        if not product:
            logger.error(f"[ReviewService] Product not found with ID: {product_id}")
            raise ProductNotFoundException(f"Product with ID {product_id} not found.")

        # Validate user has booking for the product
        self._validate_already_booked(user_id, product_id)

        # Validate user hasn't already reviewed (or has new booking after last review)
        self._validate_already_review(user_id, product_id)

        # Create review
        review = Review(
            rating=request.rating,
            comment=request.comment,
            user=user,
            product=product,
            create_by=current_user_email
        )
        saved_review = self.review_repo.save(review)

        # Update product rating
        product.overal_rating = product.calculate_rating_star()
        self.product_repo.save(product)

        logger.info(f"[ReviewService] Review created successfully with ID: {saved_review.id}")
        return self._to_dto(saved_review)

    def get_all_reviews(
        self,
        page: int = 1,
        page_size: int = 20,
        product_id: Optional[int] = None,
        user_id: Optional[int] = None,
        sort_by: str = 'create_at',
        sort_direction: str = 'desc'
    ) -> dict:
        """Get all reviews with pagination and filtering"""
        logger.info(f"[ReviewService] Fetching all reviews with pagination and filtering - Page: {page}, Size: {page_size}, Product ID: {product_id}, User ID: {user_id}")

        reviews, total = self.review_repo.find_all_paginated(
            page=page,
            page_size=page_size,
            product_id=product_id,
            user_id=user_id,
            sort_by=sort_by,
            sort_direction=sort_direction
        )

        total_pages = (total + page_size - 1) // page_size
        review_dtos = [self._to_dto(review) for review in reviews]

        result = {
            'data': [r.model_dump(by_alias=True) for r in review_dtos],
            'meta': {
                'page': page,
                'size': page_size,
                'total': total,
                'total_pages': total_pages
            }
        }

        logger.info(f"[ReviewService] Reviews fetched successfully with total: {total}")
        return result

    def count_total_reviews(self, start_date: datetime, end_date: datetime) -> int:
        """Count total reviews between two dates"""
        logger.info(f"[ReviewService] Counting reviews from {start_date} to {end_date}")

        if not start_date or not end_date:
            raise ValidationException("Start date and end date must be provided.")

        if start_date > end_date:
            raise ValidationException("Start date must be before end date.")

        # Convert to datetime
        start_datetime = datetime.combine(start_date, time.min)
        end_datetime = datetime.combine(end_date, time.max)

        count = self.review_repo.count_total_reviews(start_datetime, end_datetime)
        logger.info(f"[ReviewService] Total reviews counted: {count}")
        return count

    """HELPER METHODS"""
    def _to_dto(self, review: Review) -> ReviewDTO:
        """Convert Review model to ReviewDTO"""
        user_dto = None
        if review.user:
            user_dto = UserMapper.to_dto(review.user)

        return ReviewDTO(
            id=review.id,
            rating=review.rating,
            comment=review.comment,
            productId=review.product_id,
            userDTO=user_dto,
            createBy=review.create_by,
            updateBy=review.update_by,
            createAt=review.create_at,
            updateAt=review.update_at,
        )

    def _validate_already_booked(self, user_id: int, product_id: int) -> None:
        """Validate that user has booked this product"""
        already_booked = self.booking_repo.exists_by_user_id_and_product_id_and_status(
            user_id=user_id,
            product_id=product_id,
            status=BookingStatus.SUCCESS
        )

        if not already_booked:
            logger.error(f"[ReviewService] User ID {user_id} has not booked product {product_id}")
            raise NotBookedProductException(f"User has not booked product with ID {product_id}.")

    def _validate_already_review(self, user_id: int, product_id: int) -> None:
        """Validate that user hasn't already reviewed, or has new booking after last review"""
        # Find last review by this user for this product
        last_review = self.review_repo.find_top_by_user_id_and_product_id_order_by_create_at_desc(
            user_id=user_id,
            product_id=product_id
        )

        if not last_review:
            return

        last_review_time = last_review.create_at

        # Check if user has new SUCCESS booking after last review
        product = self.product_repo.find_by_id(product_id)
        if not product:
            raise ProductNotFoundException(f"Product with ID {product_id} not found.")

        has_new_booking = self.booking_repo.exists_by_user_id_and_product_and_status_and_create_at_after(
            user_id=user_id,
            product=product,
            status=BookingStatus.SUCCESS,
            create_at=last_review_time
        )
        if not has_new_booking:
            logger.error(
                f"[ReviewService] User {user_id} already reviewed product {product_id} "
                f"and has no new booking after {last_review_time}"
            )
            raise AlreadyReviewProductException("You have already reviewed this product and have no new bookings since your last review.")

