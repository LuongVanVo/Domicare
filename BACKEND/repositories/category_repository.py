from typing import Optional

from django.db.models import QuerySet, Q

from models.category import Category

class CategoryRepository:
    @staticmethod
    def find_by_id(category_id: int) -> Optional[Category]:
        # Find category by ID
        try:
            return Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            return None

    @staticmethod
    def find_by_id_and_not_deleted(category_id: int) -> Optional[Category]:
        """Find category by id where is_deleted is False"""
        try:
            return Category.objects.get(id=category_id, is_deleted=False)
        except Category.DoesNotExist:
            return None

    @staticmethod
    def find_by_name(name: str) -> Optional[Category]:
        """Find category by exact name"""
        try:
            return Category.objects.get(name=name)
        except Category.DoesNotExist:
            return None

    @staticmethod
    def exist_by_name(name: str) -> bool:
        """Check if category exists with given name"""
        return Category.objects.filter(name=name, is_deleted=False).exists()

    @staticmethod
    def exists_by_name_and_id_not(name: str, category_id: int) -> bool:
        """Check if category exists with given name excluding specified id"""
        return Category.objects.filter(
            name=name,
            is_deleted=False,
        ).exclude(id=category_id).exists()

    @staticmethod
    def save(category: Category) -> Category:
        """Save category to database"""
        category.save()
        return category

    @staticmethod
    def soft_delete_by_id(category_id: int) -> Category:
        """Soft delete category by setting is_deleted = True"""
        Category.objects.filter(id=category_id).update(is_deleted=True)

    @staticmethod
    def find_all_not_deleted(search_name: Optional[str] = None, page: int = 1, size: int = 20, sort_by: str = 'id', sort_direction: str = 'asc') -> QuerySet:
        """Find all categories with pagination and filtering"""
        queryset = Category.objects.filter(is_deleted=False)

        # search by name
        if search_name:
            queryset = queryset.filter(
                Q(name_unsigned__icontains=search_name) |
                Q(name__icontains=search_name)
            )

        # Sorting
        order_by = sort_by if sort_direction == 'asc' else f'-{sort_by}'
        queryset = queryset.order_by(order_by)

        return queryset