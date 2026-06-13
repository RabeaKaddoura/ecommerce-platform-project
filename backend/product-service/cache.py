import redis.asyncio as redis
import os
import json
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

#Single shared async Redis client for this service
#decode_responses=True so we get str back instead of bytes
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

#Key for caching the full product list
PRODUCT_LIST_KEY = "products:list"

#Prefix for caching individual products, e.g. "products:item:5"
PRODUCT_KEY_PREFIX = "products:item:"

#How long cached entries live before auto-expiring (seconds)
CACHE_TTL = 300  #5 minutes


async def get_cache(key: str):
    """Return cached value as a Python object, or None if missing/expired."""
    value = await redis_client.get(key)
    if value is None:
        return None
    return json.loads(value)


async def set_cache(key: str, value, ttl: int = CACHE_TTL):
    """Store a JSON-serializable value with a TTL."""
    await redis_client.set(key, json.dumps(value), ex=ttl)


async def delete_cache(key: str):
    await redis_client.delete(key)


async def invalidate_product_caches(product_id: int | None = None):
    """
    Call this whenever product data changes (create/update/delete)
    so stale cached data isn't served to users.
    """
    #The list is always stale if any product changes
    await delete_cache(PRODUCT_LIST_KEY)

    #Also clear the specific product's cache if we know its ID
    if product_id is not None:
        await delete_cache(f"{PRODUCT_KEY_PREFIX}{product_id}")