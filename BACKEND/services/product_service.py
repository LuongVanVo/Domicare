from typing import Optional, List

from dtos.requests.add_product_image_request import AddProductImageRequest
from dtos.requests.update_product_request import UpdateProductRequest
from models.product import Product

import logging
from dtos.product_dto import ProductDTO, ProductResponse, CategoryMini, ProductMini
from dtos.requests.add_product_request import AddProductRequest
from exceptions.category_exceptions import CategoryNotFoundException
from exceptions.product_exceptions import ProductNameExistsException, UrlAlreadyExistsException, \
    ProductNotFoundException
from repositories.category_repository import CategoryRepository
from repositories.file_repository import FileRepository
from repositories.product_repository import ProductRepository
from utils.format_string import FormatStringAccents

logger = logging.getLogger(__name__)
class ProductService:
    """Service for Product business logic"""
    def __init__(self):
        self.product_repo = ProductRepository()
        self.category_repo = CategoryRepository()
        self.file_repo = FileRepository()

    def add_product(self, request: AddProductRequest) -> ProductDTO:
        """Create a new product"""
        logger.info(f"[ProductService] Adding new product with name: {request.name}")

        category_id = request.category_id

        # Validate category exists
        category = self.category_repo.find_by_id_and_not_deleted(category_id)
        if not category:
            logger.error(f"[ProductService] Category {category_id} not found")
            raise CategoryNotFoundException('Category not found')

        # Check if product with same name exists in the category
        if self.product_repo.exists_by_name_and_category_id(request.name, category_id):
            logger.error(f"[ProductService] Product with same name already exists in category {category_id}")
            raise ProductNameExistsException("Product with the same name already exists in this category")

        # Validate main image exists
        main_image = self.file_repo.find_by_url(request.main_image_id)
        if not main_image:
            logger.error(f"[ProductService] Main image not found with ID: {request.main_image_id}")
            raise FileNotFoundError("Main image not found")

        # Validate landing images if provided
        landing_image_urls = []
        if request.landing_images:
            for image_id in request.landing_images:
                image = self.file_repo.find_by_url(image_id)
                if not image:
                    logger.error(f"[ProductService] Landing image not found with ID: {image_id}")
                    raise FileNotFoundError(f"Landing image not found with ID: {image_id}")
                landing_image_urls.append(image.url)

        # create product
        product = Product(
            name=request.name,
            name_unsigned=FormatStringAccents.remove_accents(request.name),
            description=request.description,
            price=request.price,
            discount=request.discount or 0.0,
            image=main_image.url,
            landing_images=landing_image_urls if landing_image_urls else None,
            category=category,
            is_deleted=False,
            overal_rating=0.0,
        )

        saved_product = self.product_repo.save(product)
        logger.info(f"[ProductService] Saved product with ID: {saved_product.id}")

        return self._to_dto(saved_product)

    def update_product(self, request: UpdateProductRequest) -> ProductDTO:
        """Update an existing product"""
        logger.info(f"[ProductService] Updating product with ID: {request.old_product_id}")

        product_id = request.old_product_id
        old_category_id = request.old_category_id
        new_category_id = request.category_id if request.category_id else request.old_category_id

        # Validate old category exists
        old_category = self.category_repo.find_by_id_and_not_deleted(old_category_id)
        if not old_category:
            logger.error(f"[ProductService] Category {old_category_id} not found")
            raise CategoryNotFoundException('Category not found')

        # Check if product is in old category
        product_in_category = self.category_repo.find_by_id_and_not_deleted(old_category_id)
        if not product_in_category:
            logger.error(f"[ProductService] Product with ID {product_id} not found in category {old_category_id}")
            raise ProductNameExistsException("Product not found in the specified category")

        # Validate new category exists
        new_category = self.category_repo.find_by_id_and_not_deleted(new_category_id)
        if not new_category:
            logger.error(f"[ProductService] Category {new_category_id} not found")
            raise CategoryNotFoundException('Category not found')

        # Find product
        product = self.product_repo.find_by_id_and_not_deleted(product_id)
        if not product:
            logger.error(f"[ProductService] Product with ID {product_id} not found")
            raise ProductNotFoundException("Product not found")

        # Update category if changed
        if new_category_id != old_category_id:
            product.category = new_category
            logger.info(f"[ProductService] Updated product category to {new_category_id}")

        # Update fields
        if request.name:
            product.name = request.name
            product.name_unsigned = FormatStringAccents.remove_accents(request.name)
        if request.description:
            product.description = request.description
        if request.price is not None and request.price > 0:
            product.price = request.price
        if request.discount is not None:
            product.discount = request.discount

        # Update main image
        if request.main_image_id:
            main_image = self.file_repo.find_by_url(request.main_image_id)
            if not main_image:
                logger.error(f"[ProductService] Main image not found with ID: {request.main_image_id}")
                raise FileNotFoundError("Main image not found")
            product.image = main_image.url

        # Update landing images
        if request.landing_images:
            found_files = self.file_repo.find_by_urls(request.landing_images)

            if len(found_files) != len(request.landing_images):
                logger.error(f"[ProductService] One or more landing images notfoune. Expected {len(request.landing_images)}, found {len(found_files)}")
                raise FileNotFoundError("Some landing images not found")

            landing_image_urls = [f.url for f in found_files]
            product.landing_images = landing_image_urls

        updated_product = self.product_repo.save(product)
        logger.info(f"[ProductService] Updated product with ID: {updated_product.id}")

        return self._to_dto(updated_product)

    def delete_product(self, product_id: int) -> None:
        """Soft delete a product by ID"""
        logger.info(f"[ProductService] Deleting product with ID: {product_id}")

        # Find product
        product = self.product_repo.find_by_id_and_not_deleted(product_id)
        if not product:
            logger.error(f"[ProductService] Product with ID {product_id} not found")
            raise ProductNameExistsException("Product not found")

        self.product_repo.soft_delete_by_id(product_id)
        logger.info(f"[ProductService] Soft deleted product with ID: {product_id}")

    def fetch_product_by_id(self, product_id: int) -> ProductDTO:
        """Fetch product by ID"""
        logger.info(f"[ProductService] Fetching product with ID: {product_id}")

        product = self.product_repo.find_by_id_and_not_deleted(product_id)
        if not product:
            logger.error(f"[ProductService] Product with ID {product_id} not found")
            raise ProductNameExistsException("Product not found")

        return self._to_dto(product)

    def get_all_products(
        self,
        page: int = 1,
        page_size: int = 20,
        category_id: Optional[int] = None,
        search_name: Optional[str] = None,
        sort_by: str = 'id',
        sort_direction: str = 'asc'
    ) -> dict:
        """Get all products with pagination, filtering, and sorting"""
        logger.info(f"ProductService] Fetching all products with pagination and filtering")

        products, total = self.product_repo.find_all_not_deleted_paginated(
            page=page,
            page_size=page_size,
            category_id=category_id,
            search_name=search_name,
            sort_by=sort_by,
            sort_direction=sort_direction
        )

        total_pages = (total + page_size - 1) // page_size
        product_response = [self._to_response(p) for p in products]

        result = {
            'data': [p.model_dump(by_alias=True) for p in product_response],
            'meta': {
                'page': page,
                'size': page_size,
                'total': total,
                'total_pages': total_pages
            }
        }

        logger.info(f"[ProductService] Fetched {len(products)} products")
        return result

    def add_product_image(self, request: AddProductImageRequest) -> ProductDTO:
        """Add an image to product (main or landing)"""
        logger.info(f"[ProductService] Adding image to product with ID: {request.product_id}")

        product_id = request.product_id
        image_id = request.image_id
        is_main_image = request.is_main_image

        # Find product
        product = self.product_repo.find_by_id(product_id)
        if not product:
            logger.error(f"[ProductService] Product with ID {product_id} not found")
            raise ProductNameExistsException("Product not found")


        # Find image
        image = self.file_repo.find_by_url(image_id)

        if not image:
            logger.error(f"[ProductService] Image not found with ID: {image_id}")
            raise FileNotFoundError("Image not found")
        logger.info(f"[ProductService] Found image with URL: {image.url}")
        # Add image
        if is_main_image:
            product.image = image.url
        else:
            if product.landing_images is None:
                product.landing_images = []
            if image.url not in product.landing_images:
                product.landing_images.append(image.url)
            else:
                logger.warning(f"[ProductService] Image with URL: {image.url} already exists in landing images")
                raise UrlAlreadyExistsException("Image already exists in the product's landing images")

        self.product_repo.save(product)
        logger.info(f"[ProductService] Image added successfully to product with ID: {product_id}")

        return self._to_dto(product)

    def find_all_by_id_in(self, product_ids: List[int]) -> List[Product]:
        """Find all products by IDs"""
        logger.info(f"[ProductService] Fetching products with IDs: {product_ids}")

        products = self.product_repo.find_all_by_id_in(product_ids)
        if not products:
            logger.error(f"[ProductService] Product with IDs {product_ids} not found")
            raise ProductNotFoundException("No products found with the provided IDs")

        logger.info(f"[ProductService] Products fetched successfully with count: {len(products)}")
        return products

    """HELPER METHODS"""
    def _to_dto(self, product: Product) -> ProductDTO:
        """Convert Product model to ProductDTO"""
        return ProductDTO(
            id=product.id,
            name=product.name,
            description=product.description,
            price=product.price,
            image=product.image,
            ratingStar=product.overal_rating,
            discount=product.discount,
            priceAfterDiscount=product.price_after_discount,
            landingImages=product.landing_images,
            categoryId=product.category_id,
            reviewDtos=None,
            create_by=product.create_by,
            update_by=product.update_by,
            create_at=product.create_at,
            update_at=product.update_at
        )

    def _to_response(self, product: Product) -> ProductResponse:
        """Conver Product model to ProductResponse with category info"""
        category_mini = None
        if product.category:
            category_mini = CategoryMini(
                id=product.category.id,
                name=product.category.name,
                image=product.category.image
            )

        return ProductResponse(
            id=product.id,
            name=product.name,
            description=product.description,
            price=product.price,
            image=product.image,
            ratingStar=product.overal_rating,
            discount=product.discount,
            priceAfterDiscount=product.price_after_discount,
            landingImages=product.landing_images,
            categoryMini=category_mini,
            reviewDTOs=None,
            create_by=product.create_by,
            update_by=product.update_by,
            create_at=product.create_at,
            update_at=product.update_at
        )

    def _to_mini(self, product: Product) -> ProductMini:
        """Convert Product model to ProductMini"""
        category_mini = None
        if product.category:
            category_mini = CategoryMini(
                id=product.category.id,
                name=product.category.name,
                image=product.category.image
            )

        return ProductMini(
            id=product.id,
            name=product.name,
            description=product.description,
            price=product.price,
            image=product.image,
            ratingStar=product.overal_rating,
            discount=product.discount,
            priceAfterDiscount=product.price_after_discount,
            categoryMini=category_mini
        )