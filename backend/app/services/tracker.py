import traceback
import sys
import os
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))

from backend.app.services.scraper_dispatcher import scrape_product_details

# === CONFIG ===
MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "price_tracker_db"  # 🔁 change to your actual DB name
COLLECTION_NAME = "products"

# === SETUP ===
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
product_collection = db[COLLECTION_NAME]


def update_price_for_product(product: dict):
    product_id = str(product["_id"])
    url = product["url"]
    site_name = product.get("site_name", "")
    
    print(f"\n🔍 Tracking: {product.get('name', 'Unknown')} (ID: {product_id})")
    
    if product.get("site_name") == "string":
        inferred_site = "Amazon" if "amazon" in url else "Flipkart" if "flipkart" in url else "Unknown"
        product_collection.update_one({"_id": ObjectId(product_id)}, {"$set": {"site_name": inferred_site}})

    try:
        scraped = scrape_product_details(url)
        if not scraped:
            print("❌ Scraping failed.")
            return

        # Parse numeric price from scraped dict
        price_text = scraped.get("Price", "") if isinstance(scraped, dict) else ""
        price_num = (
            float("".join(c for c in price_text if c.isdigit() or c == "."))
            if price_text else 0.0
        )

        result = product_collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": {"current_price": price_num}}
        )

        if result.modified_count == 1:
            print(f"✅ Updated price: ₹{price_num}")
        else:
            print(f"⚠️ No update made. Maybe price unchanged or product missing. Here is the current price ₹{price_num}")

    except Exception as e:
        print(f"💥 Error processing product ID {product_id}")
        print(traceback.format_exc())


def run_price_tracker():
    print("📦 Starting price tracker run...")
    products = product_collection.find({"status": "tracking"})

    count = 0
    for product in products:
        update_price_for_product(product)
        count += 1

    print(f"\n🏁 Finished tracking {count} product(s) at {datetime.now().isoformat()}")


if __name__ == "__main__":
    run_price_tracker()
