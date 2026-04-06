from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from api.schemas import UserCreate, UserOut, LoginRequest, TokenOut
from services.auth_service import register_user, login_user, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login") #For token extraction


@router.post("/register", response_model=UserOut, status_code=201)
async def register(data: UserCreate):
    user = await register_user(data.name, data.email, data.password)
    if not user: #If user exists register_user returns None
        raise HTTPException(status_code=400, detail="Email already registered")
    return user


@router.post("/login", response_model=TokenOut)
async def login(data: LoginRequest):
    token = await login_user(data.email, data.password)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"access_token": token}


@router.get("/me", response_model=UserOut) #Used for protected routes. Verifies user via token decoding.
async def me(token: str = Depends(oauth2_scheme)):
    user = await get_current_user(token) #After token extraction, get_current_user() decodes it and returns user.
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user