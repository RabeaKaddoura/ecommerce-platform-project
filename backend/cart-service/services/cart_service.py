from models.cart_model import Cart, CartItem
from api.schemas import CartItemAdd
from tortoise.exceptions import DoesNotExist


async def get_or_create_cart(user_id: int) -> Cart:
    cart, _ = await Cart.get_or_create(user_id=user_id)
    return cart


async def get_cart(user_id: int) -> Cart | None:
    cart = await Cart.filter(user_id=user_id).prefetch_related("items").first()
    return cart #If cart doesn't exist then None will be returned.


async def add_item(user_id: int, data: CartItemAdd) -> CartItem:
    cart = await get_or_create_cart(user_id) 
    existing = await CartItem.filter(cart=cart, product_id=data.product_id).first() #If product already in cart, update quantity.
    if existing:
        existing.quantity += data.quantity
        await existing.save()
        return existing
    item = await CartItem.create( #If item isn't in cart, it will be created with a default quantity of 1 (per CartItem model).
        cart=cart,
        product_id=data.product_id,
        quantity=data.quantity,
        price=data.price
    )
    return item


async def remove_item(user_id: int, item_id: int) -> bool:
    cart = await Cart.filter(user_id=user_id).first()
    if not cart:
        return False
    item = await CartItem.filter(id=item_id, cart=cart).first()
    if not item:
        return False
    await item.delete()
    return True


async def clear_cart(user_id: int) -> bool:
    cart = await Cart.filter(user_id=user_id).first()
    if not cart:
        return False
    await CartItem.filter(cart=cart).delete()
    return True