from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from api.schemas import OrderOut, OrderStatusUpdate
from services.order_service import (
    create_order_from_cart,
    get_orders,
    get_order_by_id,
    update_order_status
)
import httpx


router = APIRouter(prefix="/api/orders", tags=["Orders"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:8002/api/auth/login")

AUTH_SERVICE_URL = "http://localhost:8002"

async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{AUTH_SERVICE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return response.json()


@router.post("/", response_model=OrderOut, status_code=201)
async def create_order(
    token: str = Depends(oauth2_scheme),
    user: dict = Depends(get_current_user)
):
    order = await create_order_from_cart(user["id"], token)
    if not order:
        raise HTTPException(status_code=400, detail="Cart is empty or unavailable")
    return await get_order_by_id(order.id, user["id"])


@router.get("/", response_model=list[OrderOut])
async def list_orders(user: dict = Depends(get_current_user)):
    return await get_orders(user["id"])


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(order_id: int, user: dict = Depends(get_current_user)):
    order = await get_order_by_id(order_id, user["id"])
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/{order_id}/status", response_model=OrderOut)
async def change_status(order_id: int, data: OrderStatusUpdate, user: dict = Depends(get_current_user)):
    valid_statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"]
    if not data.status or data.status.lower() not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
    order = await update_order_status(order_id, data.status)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order