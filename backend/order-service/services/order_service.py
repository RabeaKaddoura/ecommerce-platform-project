from models.order_model import Order, OrderItem
import httpx
from kafka.producer import publish_event
from decimal import Decimal
import os
from dotenv import load_dotenv

load_dotenv()

CART_SERVICE_URL = os.getenv("CART_SERVICE_URL")


async def create_order_from_cart(user_id: int, token: str) -> Order | None:
    #Fetch the user's cart from cart-service
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{CART_SERVICE_URL}/api/cart/",
            headers={"Authorization": f"Bearer {token}"}
        )
    if response.status_code != 200:
        return None

    cart = response.json()
    if not cart["items"]:
        return None

    total = sum( #Calculate order sum
        Decimal(str(item["price"])) * item["quantity"]
        for item in cart["items"]
    )

    #Create the order
    order = await Order.create(user_id=user_id, total=total)

    #Create order items from fetched cart items
    for item in cart["items"]:
        await OrderItem.create(
            order=order,
            product_id=item["product_id"],
            quantity=item["quantity"],
            price=item["price"]
        )

    #Clear the cart
    await publish_event("order.created", {
        "order_id": order.id,
        "user_id": user_id,
        "token": token  #cart-service needs this to identify whose cart to clear
    })

    return order


async def get_orders(user_id: int) -> list[Order]:
    return await Order.filter(user_id=user_id).prefetch_related("items")


async def get_order_by_id(order_id: int, user_id: int) -> Order | None:
    return await Order.filter(id=order_id, user_id=user_id).prefetch_related("items").first()


async def update_order_status(order_id: int, status: str) -> Order | None:
    order = await Order.filter(id=order_id).first()
    if not order:
        return None
    order.status = status
    await order.save()
    await order.fetch_related("items")
    return order