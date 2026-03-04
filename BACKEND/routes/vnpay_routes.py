from controllers import vnpay_controller
from django.urls import path

urlpatterns = [
    path('create-payment', vnpay_controller.create_payment, name='create_payment'),
    path('return-payment', vnpay_controller.vnpay_return, name='return_payment'),
    path('vnpay-ipn', vnpay_controller.vnpay_ipn, name='vnpay_ipn'),
]