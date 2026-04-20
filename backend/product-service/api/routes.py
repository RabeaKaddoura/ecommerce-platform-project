from fastapi import APIRouter, HTTPException, Depends
from api.schemas import ProductCreate, ProductUpdate, ProductOut
from fastapi.security import OAuth2PasswordBearer
from services.product_service import (create_product, get_all_products, get_product_by_id, update_product, delete_product)
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL")

router = APIRouter(prefix="/api/products", tags=["Products"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"/api/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{AUTH_SERVICE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return response.json()


@router.post("/test", response_model=ProductOut, status_code=201) #Product creation testing endpoint.
async def create(data: ProductCreate, user: dict = Depends(get_current_user)):
    return await create_product(data)


@router.post("/", response_model=ProductOut, status_code=201)
async def create(data: ProductCreate, user: dict = Depends(get_current_user)):
    if not user["isAdmin"]:
        raise HTTPException(status_code=403, detail="Admins only")
    return await create_product(data)


@router.get("/", response_model=list[ProductOut])
async def list_products():
    return await get_all_products()


@router.get("/{product_id}", response_model=ProductOut)
async def get_one(product_id: int):
    product = await get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=ProductOut)
async def update(product_id: int, data: ProductUpdate, user: dict = Depends(get_current_user)):
    if not user["isAdmin"]:
        raise HTTPException(status_code=403, detail="Admins only")
    product = await update_product(product_id, data)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.delete("/{product_id}", status_code=204)
async def delete(product_id: int, user: dict = Depends(get_current_user)):
    if not user["isAdmin"]:
        raise HTTPException(status_code=403, detail="Admins only")
    success = await delete_product(product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")