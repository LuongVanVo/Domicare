from django.urls import path
from controllers import booking_controller

urlpatterns = [
    path('', booking_controller.create_booking, name='create_booking'),
    path('<int:booking_id>', booking_controller.get_booking_by_id, name='get_booking_by_id'),
    path('delete/<int:booking_id>', booking_controller.delete_booking, name='delete_booking'),
    path('update', booking_controller.update_booking, name='update_booking'),
    path('update/status', booking_controller.update_booking_status, name='update_booking_status'),
    path('all', booking_controller.get_all_bookings, name='get_all_bookings'),
]