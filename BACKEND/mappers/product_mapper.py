from dtos.product_dto import ProductDTO, ProductMini, CategoryMini
from models.product import Product


class ProductMapper:
    @staticmethod
    def _to_product_dto(product: Product) -> ProductDTO:
        """Helper to convert Product model to ProductDTO"""
        # Calculate price after discount
        price_after = product.price
        if product.discount:
            price_after = product.price * (100 - product.discount) / 100

        # Map category ID
        category_id = product.category.id if product.category else None

        return ProductDTO(
            id=product.id,
            name=product.name,
            description=product.description,
            price=product.price,
            image=product.image,
            ratingStar=product.calculate_rating_star,
            discount=product.discount,
            priceAfterDiscount=price_after,
            landingImages=product.landing_images,
            categoryId=category_id,
            reviewDtos=[product.reviews],
            create_by=product.create_by,
            update_by=product.update_by,
            create_at=product.create_at,
            update_at=product.update_at
        )

    @staticmethod
    def _to_product_mini(product: Product) -> ProductMini:
        """Helper to convert Product entity to ProductMini DTO"""
        # Calculate price after discount
        price_after = product.price
        if product.discount:
            price_after = product.price * (100 - product.discount) / 100

        # Map category Mini
        category_mini = None
        if product.category:
            category_mini = CategoryMini(
                id=product.category.id,
                name=product.category.name,
                image=product.category.image,
            )

        return ProductMini(
            id=product.id,
            name=product.name,
            description=product.description,
            price=product.price,
            image=product.image,
            ratingStar=product.calculate_rating_star,
            discount=product.discount,
            priceAfterDiscount=price_after,
            categoryMini=category_mini
        )