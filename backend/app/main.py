from fastapi import FastAPI
from backend.app.config import db
from backend.app.routes.auth import auth_router
from backend.app.routes.product import product_router
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

import atexit

from backend.app.services.tracker import run_price_tracker

app = FastAPI()

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(product_router, prefix="/products", tags=["Products"])

@app.get('/')
def read_root():
    return {"message" : "backend is working"}

@app.get("/test-db")
def test_db():
    collections = db.list_collection_names()
    return {"collections": collections}

scheduler = AsyncIOScheduler()
scheduler.add_job(
    func=run_price_tracker,
    trigger=IntervalTrigger(minutes=10),  # Change as needed
    id='price_tracker_job',
    name='Run price tracker every 10 minutes',
    replace_existing=True
)
scheduler.start()
print("📅 Scheduler started: running tracker every 10 minutes.")

# Shutdown hook
atexit.register(lambda: scheduler.shutdown())