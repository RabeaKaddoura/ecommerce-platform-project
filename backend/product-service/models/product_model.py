from tortoise import Model, fields
from datetime import datetime

class Product(Model):
    id = fields.IntField(pk=True, index=True)
    name = fields.CharField(max_length=100, null=False, index=True)
    category = fields.CharField(max_length=30, index=True)
    original_price = fields.DecimalField(max_digits=12, decimal_places=2)
    new_price = fields.DecimalField(max_digits=12, decimal_places=2)
    percentage_discount = fields.IntField()
    offer_expiration = fields.DateField(default=datetime.utcnow)
    product_image = fields.CharField(max_length=200, null=False, default="productDefault.jpg")
    