from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.models.product import ProductCreate, ProductInDB, ProductOut, PyObjectId, ProductUpdate
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
def get_my_products(status: str,current_user: UserInDB = Depends(get_current_user)):
    query = {
        "owner_id": ObjectId(current_user.id),
        "status": status  # ✨ 3. Add the status to the query
    }
    products = product_collection.find(query)
    return [format_product(p) for p in products]

# ---------------------
# GET /products/{id}
# ---------------------
@product_router.get("/{id}", response_model=ProductOut)
def get_product_by_id(id: str, current_user: UserInDB = Depends(get_current_user)):
    try:
        obj_id = ObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID format")

    # Perform a secure query that checks for both product ID and ownership
    product_doc = product_collection.find_one(
        {"_id": obj_id, "owner_id": ObjectId(current_user.id)}
    )

    if not product_doc:
        raise HTTPException(status_code=404, detail="Product not found or not authorized")

    # Use the existing helper to format the document for the response
    return format_product(product_doc)

# ---------------------
# PATCH /products/{id}
# ---------------------
@product_router.patch("/{id}", response_model=ProductOut)
def update_product(id: str, update_data: ProductUpdate, current_user: UserInDB = Depends(get_current_user)):
    try:
        obj_id = ObjectId(id)  # or use your custom to_objectid(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID format")

    existing = product_collection.find_one({"_id": obj_id, "owner_id": ObjectId(current_user.id)})
    print("🧩 obj_id used for update:", obj_id)

    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_payload = update_data.model_dump(exclude_unset=True)
    
    if not update_payload:
        return format_product(existing)
    
    if update_data.status == "purchased":
        update_payload["purchased_date"] = datetime.utcnow()

    product_collection.update_one({"_id": obj_id}, {"$set": update_payload})
    
    if update_data.status == "tracking":
        print(f"📈 Status for {obj_id} changed to 'tracking'. Triggering price update...")
        product_to_scrape = product_collection.find_one({"_id": obj_id})
        if product_to_scrape:
            update_price_for_product(product_to_scrape)
            print(f"✅ Scrape finished for {obj_id}.")
    
    final_product_doc = product_collection.find_one({"_id": obj_id})
        
    return format_product(final_product_doc)

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

