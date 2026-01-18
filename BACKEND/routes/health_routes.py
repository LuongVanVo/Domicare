from django.urls import path

from controllers.health_controller import health_check

urlpatterns = [
    path('', health_check, name='health_check'),
]