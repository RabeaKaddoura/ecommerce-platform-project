from tortoise import Model, fields

class Cart(Model):
    id = fields.IntField(pk=True, index=True)
    user_id = fields.IntField(unique=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    
    class Meta:
        table = "carts"
        

class CartItem(Model):
    id = fields.IntField(pk=True, index=True)
    cart = fields.ForeignKeyField("models.Cart", related_name="items", on_delete=fields.CASCADE)
    product_id = fields.IntField()  
    quantity = fields.IntField(default=1)
    price = fields.DecimalField(max_digits=12, decimal_places=2)  
    
    class Meta:
        table = "cart_items"
        
