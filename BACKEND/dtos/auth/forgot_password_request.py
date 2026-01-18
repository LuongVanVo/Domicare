from pydantic import EmailStr


class ForgotPasswordRequest:
    email: EmailStr