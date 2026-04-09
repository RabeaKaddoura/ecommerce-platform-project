from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import OAuth2PasswordBearer
from api.schemas import PaymentIntentRequest, PaymentIntentOut, PaymentOut
from services.payment_service import create_payment_intent, handle_webhook, get_payment_by_order
import httpx
import os

router = APIRouter(prefix="/api/payments", tags=["Payments"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:8000/api/auth/login")

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{AUTH_SERVICE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return response.json()


@router.post("/create-intent", response_model=PaymentIntentOut)
async def create_intent(
    data: PaymentIntentRequest,
    user: dict = Depends(get_current_user)
):
    result = await create_payment_intent(data.order_id, user["id"], data.amount)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    result = await handle_webhook(payload, sig_header)
    if result == "invalid_signature":
        raise HTTPException(status_code=400, detail="Invalid webhook signature")
    return {"status": "ok"}


@router.get("/{order_id}")
async def get_payment(order_id: int, user: dict = Depends(get_current_user)):
    payment = await get_payment_by_order(order_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment