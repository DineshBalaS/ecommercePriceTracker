from pydantic import BaseModel, Field, HttpUrl, GetCoreSchemaHandler
from pydantic_core import core_schema
from typing import Optional, List
from datetime import datetime
from bson import ObjectId


# ObjectId wrapper for MongoDB/Pydantic v2
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
    
class PriceHistoryItem(BaseModel):
    price: Optional[float]  # Price is Optional to allow logging failed scrapes as `null`
    timestamp: datetime


# Common base
class ProductBase(BaseModel):
    name: str
    url: HttpUrl
    site_name: str = "N/A"
    desired_price: float
    status: str = "tracking"  # options: tracking, bought, skipped, saved
    notes: Optional[str] = None
    purchased_date: Optional[datetime] = None


# For product creation
class ProductCreate(ProductBase):
    current_price: Optional[float] = None  # optional at creation
    
class ProductUpdate(BaseModel):
    desired_price: Optional[float] = None
    notes: Optional[str] = None
    # We include 'status' to avoid breaking the existing functionality of the PATCH endpoint
    status: Optional[str] = None


# For MongoDB storage
class ProductInDB(ProductBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    current_price: Optional[float]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    owner_id: PyObjectId
    
    price_history: List[PriceHistoryItem] = Field(default_factory=list)
    historical_low_price: Optional[float] = None
    historical_high_price: Optional[float] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
        arbitrary_types_allowed = True

    @classmethod
    def model_validate(cls, data):
        if isinstance(data, dict) and isinstance(data.get("_id"), ObjectId):
            data["_id"] = str(data["_id"])
        if isinstance(data, dict) and isinstance(data.get("owner_id"), ObjectId):
            data["owner_id"] = str(data["owner_id"])
        return super().model_validate(data)


# Output to frontend
class ProductOut(ProductBase):
    id: str
    current_price: Optional[float]
    created_at: datetime
    owner_id: str
    purchased_date: Optional[datetime] = None
    
    price_history: List[PriceHistoryItem] = Field(default_factory=list)
    historical_low_price: Optional[float] = None
    historical_high_price: Optional[float] = None