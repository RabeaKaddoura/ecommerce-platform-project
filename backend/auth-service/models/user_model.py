from tortoise import Model, fields


class User(Model):
    id = fields.IntField(pk=True, index=True)
    name = fields.CharField(max_length=100, null=False, index=True)
    email = fields.CharField(max_length=255, null=False, index=True)
    hashed_password = fields.CharField(max_length=255, null=False)
    created_at = fields.DatetimeField(auto_now_add=True)
    
    class Meta: 
        table = "users"
    