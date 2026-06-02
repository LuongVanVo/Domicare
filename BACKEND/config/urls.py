"""URL Configuration"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from controllers import file_controller, category_controller, product_controller, user_controller

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('routes.auth_routes')),
    path('api/v1/health/', include('routes.health_routes')),
    path('api/v1/file/', include('routes.file_routes')),
    path('api/v1/category/', include('routes.category_routes')),
    path('api/v1/users/', include('routes.user_routes')),
    path('api/v1/product/', include('routes.product_routes')),
    path('api/v1/reviews/', include('routes.review_routes')),
    path('api/v1/booking/', include('routes.booking_routes')),
    path('api/v1/dashboard/', include('routes.dashboard_routes')),
    path('api/v1/payment/', include('routes.payment_routes')),
    path('api/v1/', include('routes.chat_routes')),
    
    # Legacy slash-less root paths to match frontend expectations without redirecting
    path('api/v1/category', category_controller.create_category, name='legacy_category_no_slash'),
    path('api/v1/product', product_controller.product_root_dispatcher, name='legacy_product_no_slash'),
    path('api/v1/users', user_controller.get_all_users, name='legacy_users_no_slash'),
    
    # Legacy Cloudinary paths to match frontend expectations
    path('api/v1/api/cloudinary/files', file_controller.upload_file, name='legacy_upload_file'),
    path('api/v1/api/cloudinary/files/multiple', file_controller.upload_multiple_files, name='legacy_upload_multiple_files'),
    path('api/v1/api/cloudinary/files/all', file_controller.get_all_files, name='legacy_get_all_files'),
    path('api/v1/api/cloudinary/files/<int:file_id>', file_controller.file_detail, name='legacy_file_detail'),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
