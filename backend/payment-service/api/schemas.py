from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime

class PaymentIntentRequest(BaseModel):
    order_id: int
 

class PaymentIntentOut(BaseModel):
    client_secret: str  #Frontend uses this to complete payment with Stripe
    payment_intent_id: str

class PaymentOut(BaseModel):
    id: int
    order_id: int
    user_id: int
    stripe_payment_intent_id: str
    amount: Decimal
    status: str
    created_at: datetime

    class Config:
        from_attributes = True