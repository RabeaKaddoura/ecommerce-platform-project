from models.product_model import Product
from api.schemas import ProductCreate
from tortoise.exceptions import DoesNotExist
import boto3
import uuid
import os
import shutil
from pathlib import Path
from fastapi import UploadFile

USE_S3 = os.getenv("USE_S3", "false").lower() == "true"
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
AWS_REGION = os.getenv("AWS_REGION")

#Only initialize S3 client if USE_S3 is enabled — avoids credential errors in local dev
s3 = boto3.client("s3", region_name=AWS_REGION) if USE_S3 else None

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


async def upload_image(image: UploadFile) -> str:
    #Generate unique filename to avoid collisions
    filename = f"{uuid.uuid4()}-{image.filename}"
    if USE_S3:
        #Production: upload to S3, served via CloudFront
        s3.upload_fileobj(
            image.file,
            S3_BUCKET_NAME,
            f"images/{filename}",
            ExtraArgs={"ContentType": image.content_type}
        )
    else:
        #Local dev: save to static/images folder, served by FastAPI static mount
        Path("static/images").mkdir(parents=True, exist_ok=True)
        with open(f"static/images/{filename}", "wb") as f:
            shutil.copyfileobj(image.file, f)
    return filename