# order-service/kafka/producer.py
from aiokafka import AIOKafkaProducer
import json

async def publish_event(topic: str, data: dict):
    producer = AIOKafkaProducer(bootstrap_servers="localhost:9092")
    await producer.start()
    try:
        await producer.send_and_wait(
            topic,
            json.dumps(data).encode("utf-8")
        )
    finally:
        await producer.stop()