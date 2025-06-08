from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.models.product import ProductCreate, ProductInDB, ProductOut, PyObjectId
from backend.app.utils.mongo import mongo_safe_dict
from backend.app.routes.auth import get_current_user
from backend.app.models.user import UserInDB
from backend.app.config import db
from bson import ObjectId
from datetime import datetime

product_router = APIRouter()
product_collection = db["products"]


# ---------------------
# POST /products/add
# ---------------------
@product_router.post("/add", response_model=ProductOut)
def add_product(product: ProductCreate, current_user: UserInDB = Depends(get_current_user)):
    print("✅ add_product route hit by:", current_user.email)

    product_dict = mongo_safe_dict(product)
    product_dict["owner_id"] = str(current_user.id)
    product_dict["created_at"] = datetime.utcnow().isoformat()

    # Optional: print to debug
    print("📦 Cleaned product dict:", product_dict)

    inserted = product_collection.insert_one(product_dict)
    product_dict["_id"] = inserted.inserted_id
    product_dict["id"] = str(inserted.inserted_id)  # 👈 Fixes ValidationError

    return ProductOut(**product_dict)

# ---------------------
# GET /products/my
# ---------------------
@product_router.get("/my", response_model=list[ProductOut])
def get_my_products(current_user: UserInDB = Depends(get_current_user)):
    products = product_collection.find({"owner_id": str(current_user.id)})
    return [ProductOut(**ProductInDB.model_validate(p).dict()) for p in products]

# ---------------------
# PATCH /products/{id}
# ---------------------
@product_router.patch("/{id}", response_model=ProductOut)
def update_product(id: str, update_data: dict, current_user: UserInDB = Depends(get_current_user)):
    try:
        product_oid = ObjectId(id)
        owner_oid = ObjectId(current_user.id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    existing = product_collection.find_one({"_id": product_oid, "owner_id": owner_oid})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")

    product_collection.update_one({"_id": product_oid}, {"$set": update_data})
    updated = product_collection.find_one({"_id": product_oid})
    return ProductOut(**ProductInDB.model_validate(updated).dict())

# ---------------------
# DELETE /products/{id}
# ---------------------
@product_router.delete("/{id}")
def delete_product(id: str, current_user: UserInDB = Depends(get_current_user)):
    try:
        product_oid = ObjectId(id)
        owner_oid = ObjectId(current_user.id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    result = product_collection.delete_one({"_id": product_oid, "owner_id": owner_oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found or not authorized")
    return {"detail": "Product deleted successfully"}

