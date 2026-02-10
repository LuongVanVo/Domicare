from datetime import datetime
from typing import Optional, Tuple, List

from models.review import Review
class ReviewRepository:
    """Repository for Review database operations"""
    @staticmethod
    def save(review: Review) -> Review:
        """Save or update a review"""
        review.save()
        return review

    @staticmethod
    def find_by_id(review_id: int) -> Optional[Review]:
        """Find review by ID"""
        try:
            return Review.objects.select_related('user', 'product').get(id=review_id)
        except Review.DoesNotExist:
            return None

    @staticmethod
    def exists_by_product_id_and_user_id(product_id: int, user_id: int) -> bool:
        """Check if a review exists for product and user"""
        return Review.objects.filter(
            product_id=product_id,
            user_id=user_id
        ).exists()

    @staticmethod
    def find_top_by_user_id_and_product_id_order_by_create_at_desc(user_id: int, product_id: int) -> Optional[Review]:
        """Find the most recent review by user for a product"""
        try:
            return Review.objects.filter(
                user_id=user_id,
                product_id=product_id
            ).order_by('-create_at').first()
        except Review.DoesNotExist:
            return None

    @staticmethod
    def count_total_reviews(start_date: datetime, end_date: datetime) -> int:
        """Count total reviews between two dates"""
        return Review.objects.filter(
            create_at__gte=start_date,
            create_at__lte=end_date
        ).count()

    @staticmethod
    def find_all_paginated(
        page: int = 1,
        page_size: int = 20,
        product_id: Optional[int] = None,
        user_id: Optional[int] = None,
        sort_by: str = 'create_at',
        sort_direction: str = 'desc'
    ) -> Tuple[List[Review], int]:
        """Find all reviews with pagination and filtering"""
        queryset = Review.objects.select_related('user', 'product').all()

        # Filter by product
        if product_id:
            queryset = queryset.filter(product_id=product_id)

        # Filter by user
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        # Sorting
        sort_field = sort_by if sort_direction == 'asc' else f'-{sort_by}'
        queryset = queryset.order_by(sort_field)

        # Get total count
        total = queryset.count()

        # Pagination
        start = (page - 1) * page_size
        end = start + page_size
        reviews = list(queryset[start:end])

        return reviews, total

    @staticmethod
    def find_by_product_id(product_id: int) -> List[Review]:
        """Find all reviews for a product"""
        return list(Review.objects.select_related('user').filter(product_id=product_id).order_by('-create_at'))