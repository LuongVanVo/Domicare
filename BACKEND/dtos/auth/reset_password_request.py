from pydantic import EmailStr


class ResetPasswordRequest:
    email: EmailStr
    password: str