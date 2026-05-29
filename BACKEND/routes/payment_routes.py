from controllers import payment_controller
from django.urls import path

urlpatterns = [
    path('create-payment', payment_controller.create_payment, name='create_payment'),
    path('return-payment', payment_controller.vnpay_return, name='return_payment'),
    path('vnpay-ipn', payment_controller.vnpay_ipn, name='vnpay_ipn'),
    path('stripe/callback', payment_controller.stripe_callback, name='stripe_callback'),
]
