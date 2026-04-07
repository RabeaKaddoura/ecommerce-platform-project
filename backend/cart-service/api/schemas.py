from pydantic import BaseModel
from decimal import Decimal

class CartItemAdd(BaseModel):
    product_id: int
    quantity: int
    price: Decimal  
    

class CartItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: Decimal

    class Config:
        from_attributes = True
        

class CartOut(BaseModel):
    id: int
    user_id: int
    items: list[CartItemOut] = []

    class Config:
        from_attributes = True