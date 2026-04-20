from fastapi import FastAPI
from api.routes import router
from db.session import init_db
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Product Service")

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(router)
init_db(app)