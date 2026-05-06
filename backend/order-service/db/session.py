from tortoise.contrib.fastapi import register_tortoise
from dotenv import load_dotenv
import os
load_dotenv()

def init_db(app):
    db_url = f"postgres://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    register_tortoise(
        app,
        db_url=db_url,
        modules={"models": ["models.order_model"]},
        generate_schemas=True,
        add_exception_handlers=True,
    )