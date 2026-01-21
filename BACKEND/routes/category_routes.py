from django.urls import path
from controllers import category_controller

urlpatterns = [
    # Protected endpoints
    path('', category_controller.create_category, name='create_category'),
    path('update', category_controller.update_category, name='update_category'),
    path('<int:category_id>', category_controller.delete_category, name='delete_category'),

    # Public endpoints
    path('public', category_controller.get_all_categories, name='get_all_categories'),
    path('public/<int:category_id>', category_controller.get_category_by_id, name='get_category_by_id'),
]