from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.models.product import ProductCreate, ProductInDB, ProductOut, PyObjectId
from backend.app.utils.mongo import mongo_safe_dict
from backend.app.routes.auth import get_current_user
from backend.app.utils.objectid import to_objectid
from backend.app.models.user import UserInDB
from backend.app.config import db
from bson import ObjectId
from datetime import datetime
from backend.app.services.tracker import update_price_for_product

product_router = APIRouter()
product_collection = db["products"]

def format_product(product_doc):
    """
    Converts a MongoDB document into a dictionary that matches the ProductOut model.
    It handles the conversion of '_id' and 'owner_id' to strings.
    """
    if not product_doc:
        return None
    # Create the 'id' field from '_id'
    product_doc["id"] = str(product_doc["_id"])
    # Ensure 'owner_id' is a string
    product_doc["owner_id"] = str(product_doc["owner_id"])
    return product_doc


# ---------------------
# POST /products/add
# ---------------------
@product_router.post("/add", response_model=ProductOut)
def add_product(product: ProductCreate, current_user: UserInDB = Depends(get_current_user)):
    print("✅ add_product route hit by:", current_user.email)

    # --- NEW CODE: Reworked logic to save, then scrape ---
    try:
        # 1. Prepare the initial product document
        product_dict = product.model_dump()
        product_dict["owner_id"] = ObjectId(current_user.id)
        product_dict["created_at"] = datetime.utcnow()
        product_dict["url"] = str(product.url)
        # Set default values for fields not provided by the user
        product_dict.setdefault("status", "tracking")
        product_dict.setdefault("current_price", 0)

        # 2. Insert the product into the database
        result = product_collection.insert_one(product_dict)
        new_product_id = result.inserted_id
        
        # 3. Fetch the newly created document to pass to the scraper
        new_product_doc = product_collection.find_one({"_id": new_product_id})

        if not new_product_doc:
            raise HTTPException(status_code=500, detail="Failed to create product in DB.")

        print(f"📦 Product {new_product_id} saved. Triggering initial scrape...")

        # 4. Immediately run the scraper on the new product
        update_price_for_product(new_product_doc)
        
        print(f"✅ Scrape finished for {new_product_id}.")

        # 5. Fetch the final, updated product and return it
        final_product_doc = product_collection.find_one({"_id": new_product_id})
        return format_product(final_product_doc)

    except Exception as e:
        print(f"🔴 Error in add_product: {e}")
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {e}")

# ---------------------
# GET /products/my
# ---------------------
@product_router.get("/my", response_model=list[ProductOut])
def get_my_products(current_user: UserInDB = Depends(get_current_user)):
    products = product_collection.find({"owner_id": ObjectId(current_user.id)})
    return [format_product(p) for p in products]

# ---------------------
# PATCH /products/{id}
# ---------------------
@product_router.patch("/{id}", response_model=ProductOut)
def update_product(id: str, update_data: dict, current_user: UserInDB = Depends(get_current_user)):
    try:
        obj_id = ObjectId(id)  # or use your custom to_objectid(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID format")

    existing = product_collection.find_one({"_id": obj_id, "owner_id": ObjectId(current_user.id)})
    print("🧩 obj_id used for update:", obj_id)

    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")

    product_collection.update_one({"_id": obj_id}, {"$set": update_data})
    updated = product_collection.find_one({"_id": obj_id})
    
    return format_product(updated)

# ---------------------
# DELETE /products/{id}
# ---------------------
@product_router.delete("/{id}")
def delete_product(id: str, current_user: UserInDB = Depends(get_current_user)):
    try:
        obj_id = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID format")

    result = product_collection.delete_one({"_id": obj_id, "owner_id": ObjectId(current_user.id)})
    print("🧩 obj_id used for update:", obj_id)

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found or not authorized")
    return {"detail": "Product deleted successfully"}

