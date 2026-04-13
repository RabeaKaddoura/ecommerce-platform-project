from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime

class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: Decimal

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    id: int
    user_id: int
    status: str
    total: Decimal
    created_at: datetime
    items: list[OrderItemOut] = []

    class Config:
        from_attributes = True
        

class OrderStatusUpdate(BaseModel):
    status: str  #For manually updating status if needed