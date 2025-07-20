from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import db, MAIL_CONFIG
from backend.app.routes.auth import auth_router
from backend.app.routes.product import product_router
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from starlette.requests import Request
from starlette.responses import JSONResponse
from pydantic import EmailStr, BaseModel
from typing import List
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

import atexit

from backend.app.services.tracker import run_price_tracker

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(product_router, prefix="/products", tags=["Products"])

@app.get('/')
def read_root():
    return {"message" : "backend is working"}

@app.get("/test-db")
def test_db():
    collections = db.list_collection_names()
    return {"collections": collections}

conf = ConnectionConfig(
    MAIL_USERNAME=MAIL_CONFIG["MAIL_USERNAME"],
    MAIL_PASSWORD=MAIL_CONFIG["MAIL_PASSWORD"],
    MAIL_FROM=MAIL_CONFIG["MAIL_FROM"],
    MAIL_PORT=MAIL_CONFIG["MAIL_PORT"],
    MAIL_SERVER=MAIL_CONFIG["MAIL_SERVER"],
    MAIL_STARTTLS=MAIL_CONFIG["MAIL_STARTTLS"],
    MAIL_SSL_TLS=MAIL_CONFIG["MAIL_SSL_TLS"],
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

# Email Schema
class EmailSchema(BaseModel):
    email: List[EmailStr]

@app.post("/send_mail")
async def send_mail(email: EmailSchema):
    template = """
        <html>
        <body>
            <p>Hi !!!<br>
            Thanks for using FastAPI Mail, keep using it..!!!</p>
        </body>
        </html>
    """

    message = MessageSchema(
        subject="FastAPI-Mail module",
        recipients=email.dict().get("email"),
        body=template,
        subtype="html"
    )

    fm = FastMail(conf)
    await fm.send_message(message)
    print("Email sent:", message)

    return JSONResponse(status_code=200, content={"message": "Email has been sent"})