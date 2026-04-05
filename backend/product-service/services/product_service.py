from models.product_model import Product
from api.schemas import ProductCreate
from tortoise.exceptions import DoesNotExist

async def create_product(data: ProductCreate) -> Product:
    product = await Product.create(**data.model_dump())
    return product

async def get_all_products() -> list[Product]:
    return await Product.all()

async def get_product_by_id(product_id: int) -> Product | None:
    try:
        return await Product.get(id=product_id)
    except DoesNotExist:
        return None

async def update_product(product_id: int, data: ProductCreate) -> Product | None:
    product = await get_product_by_id(product_id)
    if not product:
        return None
    await product.update_from_dict(data.model_dump()).save()
    return product

async def delete_product(product_id: int) -> bool:
    product = await get_product_by_id(product_id)
    if not product:
        return False
    await product.delete()
    return True