import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Explicitly load from the parent directory if .env is in backend/
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path=env_path)

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")

BACKEND_DIR = os.path.dirname(os.path.dirname(__file__))
LOG_FILE = os.path.join(BACKEND_DIR, 'tracker.log')
LOCK_FILE = os.path.join(BACKEND_DIR, 'tracker.lock')

if not MONGO_URI or not DB_NAME:
    raise ValueError("MONGO_URI or DB_NAME not found in environment variables.")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

MAIL_CONFIG = {
    "MAIL_USERNAME": os.getenv("MAIL_USERNAME"),
    "MAIL_PASSWORD": os.getenv("MAIL_PASSWORD"),
    "MAIL_FROM": os.getenv("MAIL_FROM"),
    "MAIL_PORT": int(os.getenv("MAIL_PORT", 587)),
    "MAIL_SERVER": os.getenv("MAIL_SERVER"),
    "MAIL_STARTTLS": os.getenv("MAIL_STARTTLS", "True").lower() == "true",
    "MAIL_SSL_TLS": os.getenv("MAIL_SSL_TLS", "False").lower() == "true"
}
