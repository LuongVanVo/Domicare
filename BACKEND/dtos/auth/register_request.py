from pydantic import Field, EmailStr, BaseModel


class RegisterRequest(BaseModel):
    email: EmailStr = Field(..., description="Email not empty")
    password: str = Field(..., description="Password not empty")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "password123"
        }
    }