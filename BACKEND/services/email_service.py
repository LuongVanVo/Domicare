import uuid

from django.conf import settings
import logging

from django.core.mail import send_mail
from django.template.loader import render_to_string

from exceptions.user_exceptions import UserNotFoundException
from repositories.user_repository import UserRepository

logger = logging.getLogger(__name__)
class EmailService:
    def __init__(self):
        self.user_repo = UserRepository()
        self.frontend_url = settings.FRONTEND_URL
        self.backend_url = settings.BACKEND_URL
        self.logo_url = settings.LOGO_URL

    def create_verification_token(self, email: str) -> str:
        user = self.user_repo.find_by_email(email)
        if not user:
            raise UserNotFoundException(f"User with email {email} not found")

        token = str(uuid.uuid4())
        user.email_confirmation_token = token
        self.user_repo.save(user)

        logger.info(f"[EmailService] Created email verification token for {email}")
        return token

    def send_verification_email(self, email: str):
        token = self.create_verification_token(email)

        context = {
            'verification_token': token,
            'frontend_url': self.frontend_url,
            'backend_url': self.backend_url,
            'logo_url': self.logo_url,
            'verify_url': f"{self.backend_url}/verify-email?token={token}"
        }

        html_message = render_to_string('emails/verification.html', context)

        send_mail(
            subject='[DOMICARE] - Xác nhận email của bạn',
            message='',
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False,
        )

        logger.info(f"[EmailService] Email sent to {email}")

    def send_reset_password_email(self, email: str):
        token = self.create_verification_token(email)
        print(f"Reset token: {token}")

        context = {
            'email': email,
            'verification_token': token,
            'frontend_url': self.frontend_url,
            'backend_url': self.backend_url,
            'logo_url': self.logo_url,
            'reset_url': f"{self.backend_url}/api/v1/auth/forgot-password?token={token}"
        }

        html_message = render_to_string('emails/reset_password.html', context)

        send_mail(
            subject='[DOMICARE] - Đặt lại mật khẩu của bạn',
            message='',
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False,
        )

        logger.info(f"[EmailService] Reset password email sent to {email}")