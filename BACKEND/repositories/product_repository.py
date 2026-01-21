import logging
from typing import Optional, List
from models.product import Product

logger = logging.getLogger(__name__)
class ProductRepository:
    @staticmethod
    def find_by_id(product_id: int) -> Optional[Product]:
        """Find product by ID"""
        try:
            return Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return None

    @staticmethod
    def find_by_id_and_not_deleted(product_id: int) -> Optional[Product]:
        """Find product by ID where is_deleted is False"""
        try:
            return Product.objects.get(id=product_id, is_deleted=False)
        except Product.DoesNotExist:
            return None

    @staticmethod
    def find_by_category_id_and_not_deleted(category_id: int) -> List[Product]:
        """Find products by category ID where is_deleted is False"""
        return list(Product.objects.filter(
            category_id=category_id,
            is_deleted=False,
        ))

    @staticmethod
    def exists_by_name(name: str) -> bool:
        """Check if product exists with given name"""
        return Product.objects.filter(name=name, is_deleted=False).exists()

    @staticmethod
    def exists_by_name_and_category_id(name: str, category_id: int) -> bool:
        """Check if product exists with given name in a specified category"""
        return Product.objects.filter(
            name=name,
            category=category_id,
            is_deleted=False,
        ).exists()

    @staticmethod
    def save(product: Product) -> Product:
        """Save product to database"""
        product.save()
        return product

    @staticmethod
    def soft_delete_by_id(product_id: int) -> None:
        """Soft delete product by setting is_deleted = True"""
        Product.objects.filter(id=product_id).update(is_deleted=True)
        logger.info(f"[ProductRepository] Soft deleted product with id: {product_id}")

    @staticmethod
    def soft_delete_by_ids(product_ids: List[int]) -> None:
        """Soft delete multiple products by IDs"""
        count = Product.objects.filter(id__in=product_ids).update(is_deleted=True)
        logger.info(f"[ProductRepository] Soft deleted {count} products with ids: {product_ids}")

    @staticmethod
    def soft_delete_by_category_ids(category_ids: List[int]) -> None:
        """Soft delete all products in given categories"""
        count = Product.objects.filter(category_id__in=category_ids).update(is_deleted=True)
        logger.info(f"[ProductRepository] Soft deleted {count} products in categories with ids: {category_ids}")

    @staticmethod
    def search_accent_insensitive(keyword: str) -> List[Product]:
        """Search products by name or description with accent insensitive matching"""
        return list(Product.objects.filter(
            name_unsigned__icontains=keyword, is_deleted=False
        ))

    @staticmethod
    def find_all_not_deleted() -> List[Product]:
        """Find all products that are not deleted"""
        return list(Product.objects.filter(is_deleted=False))

    @staticmethod
    def count_by_category_id(category_id: int) -> int:
        """Count products in a category"""
        return Product.objects.filter(category_id=category_id, is_deleted=False).count()