from aiokafka import AIOKafkaConsumer
from services.cart_service import clear_cart
import json

async def consume_events():
    consumer = AIOKafkaConsumer(
        "order.created",
        bootstrap_servers="localhost:9092",
        group_id="cart-service-group",  #So that only one instance of cart-service processes each message
        auto_offset_reset="earliest"    #If consumer restarts, start from earliest unprocessed message
    )
    await consumer.start()
    try:
        async for message in consumer:
            data = json.loads(message.value.decode("utf-8"))
            print(f"[cart-service] received order.created event: {data}")
            await clear_cart(data["user_id"])
            print(f"[cart-service] cart cleared for user {data['user_id']}")
    finally:
        await consumer.stop()