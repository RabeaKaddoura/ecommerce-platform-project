from tortoise.contrib.fastapi import register_tortoise
from dotenv import load_dotenv
import os

load_dotenv()

def init_db(app):
    register_tortoise(
        app,
        db_url=os.getenv("DATABASE_URL"),
        modules={"models": ["models.payment_model"]},
        generate_schemas=True,
        add_exception_handlers=True,
    )