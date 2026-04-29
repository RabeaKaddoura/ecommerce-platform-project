import asyncio
from aiokafka import AIOKafkaConsumer
from services.order_service import update_order_status
import json
import os

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")

async def consume_events():
    await asyncio.sleep(5)  #Wait for Kafka to be ready
    consumer = AIOKafkaConsumer( #Consumes payment events produced by payment-service 
        "payment.succeeded",
        "payment.failed",
        bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
        group_id="order-service-group",
        auto_offset_reset="earliest"
    )
    await consumer.start()
    try:
        async for message in consumer:
            data = json.loads(message.value.decode("utf-8"))
            if message.topic == "payment.succeeded":
                print(f"[order-service] payment succeeded for order {data['order_id']}")
                await update_order_status(data["order_id"], "confirmed")
            elif message.topic == "payment.failed":
                print(f"[order-service] payment failed for order {data['order_id']}")
                await update_order_status(data["order_id"], "cancelled")
    finally:
        await consumer.stop()