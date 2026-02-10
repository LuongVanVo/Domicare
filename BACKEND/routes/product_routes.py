from django.urls import path
from controllers import product_controller

urlpatterns = [
    path('', product_controller.create_product, name='create_product'),
    path('update', product_controller.update_product, name='update_product'),
    path('<int:product_id>', product_controller.delete_product, name='delete_product'),
    path('upload-image', product_controller.upload_product_image, name='upload_product_image'),

    # Public endpoints
    path('public', product_controller.get_all_products, name='get_all_products'),
    path('public/<int:product_id>', product_controller.get_product_by_id, name='get_product_by_id'),

]