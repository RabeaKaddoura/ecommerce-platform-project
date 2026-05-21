from fastapi import FastAPI
from api.routes import router
from db.session import init_db
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(title="Product Service")

#Only serve static files locally. In production images are served from S3 via CloudFront.
if os.getenv("USE_S3", "false").lower() != "true":
    app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(router)
init_db(app)