import stripe
import os
import httpx
from dotenv import load_dotenv
from models.payment_model import Payment
from kafka.producer import publish_event
from decimal import Decimal

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
ORDER_SERVICE_URL = os.getenv("ORDER_SERVICE_URL")

payment_currency = "usd"

async def create_payment_intent(order_id: int, user_id: int, token: str) -> dict:
    existing = await Payment.filter(order_id=order_id).first() #Check if payment already exists for this order.
    if existing:
        return {"error": "Payment already exists for this order"}
    
    
    #Fetch order total from order-service
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{ORDER_SERVICE_URL}/api/orders/{order_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
    if response.status_code != 200:
        return {"error": "Order not found"}
    
    order = response.json()
    amount = order["total"]
    amount_in_cents = int(Decimal(str(amount)) * 100)  #Create payment intent with Stripe. Amount must be in cents (Stripe requirement).

    
    intent = stripe.PaymentIntent.create(
        amount=amount_in_cents,
        currency=payment_currency,
        metadata={"order_id": order_id, "user_id": user_id}
    )

    await Payment.create( #Save payment record locally.
        order_id=order_id,
        user_id=user_id,
        stripe_payment_intent_id=intent.id,
        amount=amount,
        status="pending"
    )

    return {
        "client_secret": intent.client_secret,
        "payment_intent_id": intent.id
    }
    

async def handle_webhook(payload: bytes, sig_header: str) -> str:
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except stripe.error.SignatureVerificationError:
        return "invalid_signature"

    if event["type"] == "payment_intent.succeeded": #If Stripe returns payment succeeded we update payment status in db as succeeded
        intent = event["data"]["object"]
        payment = await Payment.filter(stripe_payment_intent_id=intent["id"]).first()
        if payment:
            payment.status = "succeeded"
            await payment.save()
            await publish_event("payment.succeeded", {
                "order_id": payment.order_id,
                "user_id": payment.user_id
            })

    elif event["type"] == "payment_intent.payment_failed": #Otherwise if Stripe returns payment_failed we update payment status in db as failed
        intent = event["data"]["object"]
        payment = await Payment.filter(stripe_payment_intent_id=intent["id"]).first()
        if payment:
            payment.status = "failed"
            await payment.save()
            await publish_event("payment.failed", {
                "order_id": payment.order_id,
                "user_id": payment.user_id
            })

    return "success"


async def get_payment_by_order(order_id: int) -> Payment | None:
    return await Payment.filter(order_id=order_id).first()