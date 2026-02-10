"""URL Configuration"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('routes.auth_routes')),
    path('api/v1/health/', include('routes.health_routes')),
    path('api/v1/file/', include('routes.file_routes')),
    path('api/v1/category/', include('routes.category_routes')),
    path('api/v1/users/', include('routes.user_routes')),
    path('api/v1/product/', include('routes.product_routes')),
    path('api/v1/reviews/', include('routes.review_routes')),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
