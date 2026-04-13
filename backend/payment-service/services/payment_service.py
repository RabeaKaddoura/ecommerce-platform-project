import stripe
import os
from dotenv import load_dotenv
from models.payment_model import Payment
from decimal import Decimal

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

payment_currency = "usd"

async def create_payment_intent(order_id: int, user_id: int, amount: Decimal) -> dict:
    existing = await Payment.filter(order_id=order_id).first() #Check if payment already exists for this order.
    if existing:
        return {"error": "Payment already exists for this order"}

    amount_in_cents = int(amount * 100)  #Create payment intent with Stripe. Amount must be in cents (Stripe requirement).
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

    elif event["type"] == "payment_intent.payment_failed": #Otherwise if Stripe returns payment_failed we update payment status in db as failed
        intent = event["data"]["object"]
        payment = await Payment.filter(stripe_payment_intent_id=intent["id"]).first()
        if payment:
            payment.status = "failed"
            await payment.save()

    return "success"


async def get_payment_by_order(order_id: int) -> Payment | None:
    return await Payment.filter(order_id=order_id).first()