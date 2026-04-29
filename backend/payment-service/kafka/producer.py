from aiokafka import AIOKafkaProducer
import json
import os

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")

async def publish_event(topic: str, data: dict): #Produces payment succeded or failed events
    producer = AIOKafkaProducer(bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS)
    await producer.start()
    try:
        await producer.send_and_wait(
            topic,
            json.dumps(data).encode("utf-8")
        )
    finally:
        await producer.stop()