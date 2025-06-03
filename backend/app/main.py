from fastapi import FastAPI
from backend.app.config import db

app = FastAPI()

@app.get('/')
def read_root():
    return {"message" : "backend is working"}

@app.get("/test-db")
def test_db():
    collections = db.list_collection_names()
    return {"collections": collections}