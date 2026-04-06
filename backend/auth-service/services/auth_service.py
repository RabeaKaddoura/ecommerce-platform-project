from models.user_model import User
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# password utils
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# jwt utils
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        return None


# db operations
async def register_user(name: str, email: str, password: str) -> User | None:
    existing = await User.filter(email=email).first()
    if existing:
        return None
    user = await User.create(
        name=name,
        email=email,
        hashed_password=hash_password(password)
    )
    return user


async def login_user(email: str, password: str) -> str | None:
    user = await User.filter(email=email).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return create_access_token({"sub": str(user.id), "email": user.email})


async def get_current_user(token: str) -> User | None:
    payload = decode_access_token(token)
    if not payload:
        return None
    user = await User.filter(id=int(payload["sub"])).first()
    return user