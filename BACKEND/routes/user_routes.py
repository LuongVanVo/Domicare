from django.urls import path

from controllers import user_controller

urlpatterns = [
    path('me', user_controller.get_me, name='get_me'),
    path('', user_controller.get_all_users, name='get_all_users'),
    path('<int:user_id>', user_controller.get_user_by_id, name='get_user_by_id'),
    path('update', user_controller.update_user_information, name='update_user_information'),
    path('<int:user_id>/delete', user_controller.delete_user_by_id, name='delete_user_by_id'),
    path('update/roles', user_controller.update_user_roles, name='update_user_roles'),
    path('admin', user_controller.create_user_by_admin, name='create_user_by_admin'),
]