from django.urls import path
from controllers import review_controller

urlpatterns = [
    path('', review_controller.create_review, name="create_review"),
    path('all', review_controller.get_all_reviews, name="get_all_reviews"),
    path('<int:review_id>', review_controller.get_review_by_id, name="get_review_by_id"),
]