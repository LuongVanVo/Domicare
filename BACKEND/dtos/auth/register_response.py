from pydantic import EmailStr, BaseModel


class RegisterResponse(BaseModel):
    id: int
    email: EmailStr
    message: str = "Registration successful. Please check your email to confirm your account."