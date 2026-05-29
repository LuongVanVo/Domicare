import uuid
import requests

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

    def _send_email_via_sendgrid(self, subject: str, to_email: str, html_message: str) -> bool:
        """
        Sends email via SendGrid HTTP Web API to bypass blocked SMTP ports (25, 465, 587) on cloud VPS.
        Falls back to standard Django send_mail if not using SendGrid SMTP configuration.
        """
        api_key = settings.EMAIL_HOST_PASSWORD
        from_email = settings.DEFAULT_FROM_EMAIL

        if settings.EMAIL_HOST == 'smtp.sendgrid.net' and api_key and api_key.startswith('SG.'):
            url = "https://api.sendgrid.com/v3/mail/send"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "personalizations": [
                    {
                        "to": [{"email": to_email}]
                    }
                ],
                "from": {
                    "email": from_email,
                    "name": "DOMICARE"
                },
                "subject": subject,
                "content": [
                    {
                        "type": "text/html",
                        "value": html_message
                    }
                ]
            }
            try:
                response = requests.post(url, json=payload, headers=headers, timeout=10)
                if 200 <= response.status_code < 300:
                    logger.info(f"[EmailService] Email sent successfully via SendGrid API to {to_email}")
                    return True
                else:
                    logger.error(f"[EmailService] SendGrid API failed: {response.status_code} - {response.text}")
            except Exception as e:
                logger.error(f"[EmailService] SendGrid API connection error: {str(e)}")

        # Fallback to standard Django SMTP send_mail
        send_mail(
            subject=subject,
            message='',
            from_email=from_email,
            recipient_list=[to_email],
            html_message=html_message,
            fail_silently=False,
        )
        return True

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

        self._send_email_via_sendgrid(
            subject='[DOMICARE] - Xác nhận email của bạn',
            to_email=email,
            html_message=html_message,
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

        self._send_email_via_sendgrid(
            subject='[DOMICARE] - Đặt lại mật khẩu của bạn',
            to_email=email,
            html_message=html_message,
        )

        logger.info(f"[EmailService] Reset password email sent to {email}")

    def send_password_to_user(self, email: str, name: str, password: str):
        """Send random password to guest user"""
        subject = '[DOMICARE] - MẬT KHẨU TÀI KHOẢN CỦA BẠN'
        context = {
            'name': name,
            'email': email,
            'password': password,
            'frontend_url': self.frontend_url,
            'logo_url': self.logo_url
        }
        html_message = render_to_string('emails/guest_password.html', context)
        self._send_email_via_sendgrid(
            subject=subject,
            to_email=email,
            html_message=html_message,
        )

    def send_accepted_to_user(self, email: str, product_name: str, booking_date: str, customer_name: str):
        """Send email when booking is accepted"""
        subject = '[DOMICARE] - ĐƠN HÀNG ĐÃ ĐƯỢC CHẤP NHẬN'
        context = {
            'customer_name': customer_name,
            'product_name': product_name,
            'booking_date': booking_date,
            'frontend_url': self.frontend_url,
            'logo_url': self.logo_url
        }
        html_message = render_to_string('emails/booking_accepted.html', context)
        self._send_email_via_sendgrid(
            subject=subject,
            to_email=email,
            html_message=html_message,
        )

    def send_reject_to_user(self, email: str, product_name: str, booking_date: str, customer_name: str):
        """Send email when booking is rejected"""
        subject = '[DOMICARE] - ĐƠN HÀNG ĐÃ BỊ TỪ CHỐI'
        context = {
            'customer_name': customer_name,
            'product_name': product_name,
            'booking_date': booking_date,
            'frontend_url': self.frontend_url,
            'logo_url': self.logo_url
        }
        html_message = render_to_string('emails/booking_rejected.html', context)
        self._send_email_via_sendgrid(
            subject=subject,
            to_email=email,
            html_message=html_message,
        )