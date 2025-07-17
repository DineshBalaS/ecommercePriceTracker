from pydantic import BaseModel
from datetime import datetime
from bson import ObjectId

def mongo_safe_dict(model: BaseModel) -> dict:
    """Safely convert a Pydantic model to a MongoDB-compatible dict."""
    data = model.model_dump(mode="json")

    # Ensure created_at is in ISO format if present
    if "created_at" in data and isinstance(data["created_at"], datetime):
        data["created_at"] = data["created_at"].isoformat()

    # Convert ObjectId fields (owner_id or _id)
    for key in ["_id", "owner_id"]:
        if key in data and isinstance(data[key], ObjectId):
            data[key] = str(data[key])

    return data
