from django.urls import path

from controllers import user_controller

urlpatterns = [
    path('me', user_controller.get_me, name='get_me'),
]