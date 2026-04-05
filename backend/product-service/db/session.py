from tortoise.contrib.fastapi import register_tortoise


def init_db(app):
    register_tortoise(
        app,
        db_url="sqlite://database.sqlite3",
        modules={"models": ["models.product_model"]},
        generate_schemas=True, #creates db tables
        add_exception_handlers=True,
    )