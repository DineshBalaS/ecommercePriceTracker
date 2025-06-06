from fastapi import FastAPI
from backend.app.config import db
from backend.app.routes.auth import auth_router

app = FastAPI()

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])

@app.get('/')
def read_root():
    return {"message" : "backend is working"}

@app.get("/test-db")
def test_db():
    collections = db.list_collection_names()
    return {"collections": collections}