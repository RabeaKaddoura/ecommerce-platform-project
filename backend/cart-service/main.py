from fastapi import FastAPI
from api.routes import router
from db.session import init_db
from kafka.consumer import consume_events
import asyncio


app = FastAPI(title="Cart Service")

app.include_router(router)
init_db(app)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(consume_events())  #Runs consumer synchronously without blocking the app