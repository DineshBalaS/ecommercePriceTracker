import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Explicitly load from the parent directory if .env is in backend/
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path=env_path)

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

if not MONGO_URI or not DB_NAME:
    raise ValueError("MONGO_URI or DB_NAME not found in environment variables.")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
