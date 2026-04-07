from fastapi import APIRouter, HTTPException
from api.schemas import ProductCreate, ProductUpdate, ProductOut
from services.product_service import (create_product, get_all_products, get_product_by_id, update_product, delete_product)

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.post("/", response_model=ProductOut, status_code=201)
async def create(data: ProductCreate):
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
async def update(product_id: int, data: ProductUpdate):
    product = await update_product(product_id, data)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.delete("/{product_id}", status_code=204)
async def delete(product_id: int):
    success = await delete_product(product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")