from tortoise import Model, fields


class Payment(Model):
    id = fields.IntField(pk=True, index=True)
    order_id = fields.IntField(unique=True, index=True)
    user_id = fields.IntField(index=True)
    stripe_payment_intent_id = fields.CharField(max_length=255, unique=True)
    amount = fields.DecimalField(max_digits=12, decimal_places=2)
    status = fields.CharField(max_length=20, default="pending")
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "payments"
    