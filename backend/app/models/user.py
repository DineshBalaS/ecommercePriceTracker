from pydantic import BaseModel, EmailStr, Field, GetCoreSchemaHandler
from pydantic_core import core_schema
from datetime import datetime
from typing import List, Optional
from bson import ObjectId

# Utility to work with MongoDB ObjectId in Pydantic
class PyObjectId(ObjectId):

    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type, _handler: GetCoreSchemaHandler):
        return core_schema.no_info_after_validator_function(
            cls.validate, core_schema.str_schema()
        )

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(ObjectId(v))

# -------------------
# Pydantic Models
# -------------------

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)  # Plaintext password (to be hashed before storing)
    username: str = Field(..., min_length=3, max_length=30, pattern="^[a-zA-Z0-9_]+$")

class UserInDB(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    product_history: List[str] = []
    currently_tracking: List[str] = []

    class Config:
        populate_by_name = True  # Important for alias "_id" to work
        json_encoders = {ObjectId: str}
        arbitrary_types_allowed = True  # ✅ NEW: Required for PyObjectId

    @classmethod
    def model_validate(cls, data):
        # MongoDB returns ObjectId, convert it to str if needed
        if isinstance(data, dict) and isinstance(data.get("_id"), ObjectId):
            data["_id"] = str(data["_id"])
        return super().model_validate(data)


class UserOut(UserBase):
    id: str
    created_at: datetime
