from pydantic import BaseModel
from datetime import date
from decimal import Decimal

class ProductCreate(BaseModel):
    name: str
    category: str
    original_price: Decimal
    new_price: Decimal
    percentage_discount: int
    offer_expiration: date
    product_image: str = "productDefault.jpg"

class ProductUpdate(ProductCreate):
    pass  

class ProductOut(BaseModel):
    id: int
    name: str
    category: str
    original_price: Decimal
    new_price: Decimal
    percentage_discount: int
    offer_expiration: date
    product_image: str

    class Config:
        from_attributes = True  # lets Pydantic read Tortoise ORM objects