"""Product Model"""
from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.utils import timezone


class Product(models.Model):
    """Product model - maps to PRODUCTS table"""
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255)
    name_unsigned = models.CharField(max_length=366, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=15, decimal_places=2)
    discount = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    image = models.URLField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    overal_rating = models.FloatField(default=0.0)
    landing_images = ArrayField(
        models.URLField(max_length=500),
        blank=True,
        null=True,
        default=list
    )

    category = models.ForeignKey(
        'Category',
        on_delete=models.CASCADE,
        related_name='products',
        db_column='category_id'
    )

    create_by = models.CharField(max_length=255, default='system')
    update_by = models.CharField(max_length=255, blank=True, null=True)
    create_at = models.DateTimeField(default=timezone.now)
    update_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'products'
        managed = True

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Handle name_unsigned (matches @PrePersist/@PreUpdate)
        if self.name:
            import unicodedata
            nfkd = unicodedata.normalize('NFKD', self.name)
            self.name_unsigned = ''.join([c for c in nfkd if not unicodedata.combining(c)])

        # Handle audit fields and default values
        if not self.pk:
            if not self.create_at:
                self.create_at = timezone.now()
            if self.overal_rating is None:
                self.overal_rating = 0.0
        else:
            self.update_at = timezone.now()

        super().save(*args, **kwargs)

    @property
    def calculate_rating_star(self):
        """Matches calculateRatingStar() method"""
        reviews = self.reviews.all()
        if not reviews or len(reviews) == 0:
            return 0.0

        total_rating = sum(review.rating for review in reviews)
        calculated_rating = total_rating / len(reviews)
        return round(calculated_rating, 2)

    @property
    def price_after_discount(self):
        """Matches getPriceAfterDiscount() method"""
        discount_amount = float(self.price) * (float(self.discount) / 100)
        return float(self.price) - discount_amount
