from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from api.schemas import CartItemAdd, CartOut
from services.cart_service import get_cart, add_item, remove_item, clear_cart
import httpx
from dotenv import load_dotenv
import os


load_dotenv()

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL")

router = APIRouter(prefix="/api/cart", tags=["Cart"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{AUTH_SERVICE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return response.json()  #{"id": 1, "email": "..."}


@router.get("/", response_model=CartOut)
async def get_my_cart(user: dict = Depends(get_current_user)):
    cart = await get_cart(user["id"])
    if not cart:
        raise HTTPException(status_code=404, detail="Cart is empty")
    return cart


@router.post("/items", status_code=201)
async def add_to_cart(data: CartItemAdd, user: dict = Depends(get_current_user)):
    item = await add_item(user["id"], data)
    return item


@router.delete("/items/{item_id}", status_code=204)
async def remove_from_cart(item_id: int, user: dict = Depends(get_current_user)):
    success = await remove_item(user["id"], item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    

@router.delete("/", status_code=204)
async def clear_my_cart(user: dict = Depends(get_current_user)):
   success = await clear_cart(user["id"])
   if not success:
        raise HTTPException(status_code=404, detail="Cart not found")
    