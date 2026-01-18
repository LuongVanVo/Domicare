from pydantic import EmailStr, BaseModel


class RefreshTokenResponse(BaseModel):
    access_token: str
    email: EmailStr