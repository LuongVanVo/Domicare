from controllers import auth_controller
from django.urls import path

urlpatterns = [
    # auth authentication
    path('login', auth_controller.login, name='login'),
    path('register', auth_controller.register, name='register'),
    path('refresh-token', auth_controller.refresh_token, name='refresh_token'),
    path('reset-password', auth_controller.reset_password, name='reset_password'),
    path('logout', auth_controller.logout, name='logout'),

    # email verification
    path('verify-email', auth_controller.verify_email, name='verify_email'),
    path('forgot-password', auth_controller.forgot_password, name='forgot_password'),
    path('email/verify', auth_controller.send_verification_email, name='send_verification_email'),
    path('email/reset-password', auth_controller.send_reset_password_email, name='send_reset_password_email'),
]