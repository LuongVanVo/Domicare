import logging
from typing import Optional, Dict, Any, Union

from django.core.paginator import Paginator
from django.db import transaction

from dtos.category_dto import CategoryDTO
from dtos.requests.add_category_request import AddCategoryRequest
from dtos.requests.update_category_request import UpdateCategoryRequest
from exceptions.file_exceptions import FileNotFoundException
from middlewares.current_user import get_current_user
from models.category import Category
from exceptions.category_exceptions import CategoryNotFoundException, CategoryAlreadyExistsException
from repositories.category_repository import CategoryRepository
from repositories.file_repository import FileRepository
from repositories.product_repository import ProductRepository
from utils.format_string import FormatStringAccents

logger = logging.getLogger(__name__)

class CategoryService:
    def __init__(self):
        self.category_repo = CategoryRepository()
        self.file_repo = FileRepository()
        self.product_repo = ProductRepository()

    def fetch_category_by_id(self, category_id: int) -> CategoryDTO:
        """Fetch category by ID"""
        logger.info(f"[Category] Fetching category with ID: {category_id}")

        category = self.category_repo.find_by_id_and_not_deleted(category_id)
        if not category:
            logger.error(f"[Category] Category not found with ID: {category_id}")
            raise CategoryNotFoundException(f"Category with ID {category_id} not found.")

        logger.info(f"[Category] Fetched category with ID: {category_id}")
        return self._convert_to_dto(category)

    @transaction.atomic
    def add_category(self, request: AddCategoryRequest) -> CategoryDTO:
        """Create new category"""
        logger.info(f"[Category] Adding new category with name: {request.name}")

        # Validate unique category name
        category_name = request.name.strip()
        self._validate_category_name_is_unique(category_name)

        # Create category entity
        category = Category()
        category.name = category_name
        category.description = request.description
        category.is_deleted = False
        category.name_unsigned = FormatStringAccents.remove_accents(category_name)

        # Set image if provided
        if request.image_id:
            self._set_image_for_category(category, request.image_id)

        # Set audit fields
        current_user = get_current_user()
        category.create_by = current_user or "system"

        # Save
        saved_category = self.category_repo.save(category)
        logger.info(f"[Category] Added new category with ID: {saved_category.id}")

        return self._convert_to_dto(saved_category)

    @transaction.atomic
    def update_category(self, request: UpdateCategoryRequest) -> CategoryDTO:
        """Update existing category"""
        category_id = request.category_id
        logger.info(f"[Category] Updating category with ID: {category_id}")

        # Find existing category
        existing_category = self.category_repo.find_by_id_and_not_deleted(category_id)
        if not existing_category:
            logger.error(f"[Category] Category not found with ID: {category_id}")
            raise CategoryNotFoundException(f"Category with ID {category_id} not found.")

        # Update image if provided
        if request.image_id:
            self._set_image_for_category(existing_category, request.image_id)

        # Update name if provided
        if request.name:
            self._update_category_name(existing_category, request.name.strip(), category_id)

        # Update description if provided
        if request.description is not None:
            existing_category.description = request.description.strip()

        # Set audit fields
        current_user = get_current_user()
        existing_category.update_by = str(current_user) if current_user else "system"

        # Save
        updated_category = self.category_repo.save(existing_category)
        logger.info(f"[Category] Updated category with ID: {updated_category.id}")

        return self._convert_to_dto(updated_category)

    @transaction.atomic
    def delete_category(self, category_id: int) -> None:
        """Soft delete category by ID"""
        logger.info(f"[Category] Deleting category with ID: {category_id}")

        # Find category
        category = self.category_repo.find_by_id_and_not_deleted(category_id)
        if not category:
            logger.error(f"[Category] Category not found with ID: {category_id}")
            raise CategoryNotFoundException(f"Category with ID {category_id} not found")

        # delete associated products
        self._delete_associated_products(category)

        # Soft delete category
        self.category_repo.soft_delete_by_id(category_id)
        logger.info(f"[Category] Deleted category with ID: {category_id}")

    def get_all_categories(self, page: int = 1, size: int = 20, search_name: Optional[str] = None, sort_by: str = 'id', sort_direction: str = 'asc') -> Dict[str, Any]:
        """Get all categories with pagination and filtering"""
        logger.info("[Category] Fetching all categories with pagination and filtering")

        # Validate pagination parameters
        if page < 1:
            page = 1
        if size < 1 or size > 100:
            size = 20

        # Process search name (remove accents)
        clean_search_name = None
        if search_name:
            clean_search_name = FormatStringAccents.remove_accents(search_name.lower().strip())

        # Get queryset
        queryset = self.category_repo.find_all_not_deleted(
            search_name=clean_search_name,
            page=page,
            size=size,
            sort_by=sort_by,
            sort_direction=sort_direction
        )

        # Paginate
        paginator = Paginator(queryset, size)
        page_obj = paginator.get_page(page)

        # Convert to DTOs
        categories = [self._convert_to_dto(cat, include_products=True) for cat in page_obj.object_list]

        # Result
        result = {
            "meta": {
                "page": page,
                "size": size,
                "total_pages": paginator.num_pages,
                "total_items": paginator.count
            },
            "data": categories
        }

        logger.info(f"[Category] Fetched {len(categories)} categories for page {page}")
        return result

    # PRIVATE HELPER METHODS
    def _validate_category_name_is_unique(self, category_name: str) -> None:
        """Validate that category name is unique"""
        if self.category_repo.exist_by_name(category_name):
            logger.error(f"[Category] Category with name {category_name} already exists.")
            raise CategoryAlreadyExistsException(f"Category with name {category_name} already exists.")

    def _set_image_for_category(self, category: Category, image_id: Union[int, str]) -> None:
        """Set image url for category from file repository or direct URL"""
        # Nếu là URL string (http/https), dùng trực tiếp
        if isinstance(image_id, str):
            if image_id.startswith('http://') or image_id.startswith('https://'):
                category.image = image_id
                logger.info(f"[Category] Set image URL directly: {image_id}")
            else:
                raise ValueError("Invalid image URL format")
        # Nếu là ID integer, lấy từ file repository
        else:
            file_obj = self.file_repo.find_by_id(image_id)
            if not file_obj:
                logger.error(f"[Category] Image not found with ID: {image_id}")
                raise FileNotFoundException(f"Image with ID {image_id} not found.")
            category.image = file_obj.url
            logger.info(f"[Category] Set image from file ID: {image_id}")

    def _update_category_name(self, category: Category, new_name: str, category_id: int) -> None:
        """Update category name with uniqueness validation"""
        if self.category_repo.exists_by_name_and_id_not(new_name, category_id):
            logger.error(f"[Category] Category with name {new_name} already exists.")
            raise CategoryAlreadyExistsException(f"Category with name {new_name} already exists.")

        category.name = new_name
        category.name_unsigned = FormatStringAccents.remove_accents(new_name)

    @transaction.atomic
    def _delete_associated_products(self, category: Category) -> None:
        """Soft delete all products associated with category"""
        products = self.product_repo.find_by_category_id_and_not_deleted(category.id)

        if not products:
            logger.info(f"[Category] No products found to delete for category ID: {category.id}")
            return

        product_ids = [p.id for p in products]
        self.product_repo.soft_delete_by_ids(product_ids)
        logger.info(f"[Category] Soft deleted {len(product_ids)} products for category ID: {category.id}")

    def _convert_to_dto(self, category: Category, include_products: bool = False) -> CategoryDTO:
        """Convert Category model to CategoryDTO"""
        products = None

        if include_products:
            product_list = self.product_repo.find_by_category_id_and_not_deleted(category.id)
            products = [
                {
                    'id': p.id,
                    'name': p.name,
                    'description': p.description,
                    'price': float(p.price) if hasattr(p, 'price') else None,
                    'image': p.image if hasattr(p, 'image') else None,
                }
                for p in product_list
            ]
        return CategoryDTO(
            id=category.id,
            name=category.name,
            description=category.description,
            image=category.image,
            create_by=str(category.create_by),
            update_by=str(category.update_by),
            create_at=category.create_at,
            update_at=category.update_at,
            products=products
        )