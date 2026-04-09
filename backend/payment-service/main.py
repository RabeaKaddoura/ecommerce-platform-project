from fastapi import FastAPI
from api.routes import router
from db.session import init_db

app = FastAPI(title="Payment Service")

app.include_router(router)
init_db(app)