from bson import ObjectId
from fastapi import HTTPException

def to_objectid(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")
