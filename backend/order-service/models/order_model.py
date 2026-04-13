from tortoise import Model, fields

class Order(Model):
    id = fields.IntField(pk=True, index=True)
    user_id = fields.IntField(index=True)
    status = fields.CharField(max_length=20, default="pending")
    total = fields.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "orders"
        

class OrderItem(Model):
    id = fields.IntField(pk=True, index=True)
    order = fields.ForeignKeyField("models.Order", related_name="items", on_delete=fields.CASCADE)
    product_id = fields.IntField()
    quantity = fields.IntField()
    price = fields.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        table = "order_items"