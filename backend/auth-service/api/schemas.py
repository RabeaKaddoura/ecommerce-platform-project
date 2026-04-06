from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    

class UserOut(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True  # lets Pydantic read Tortoise ORM objects
        

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"