import sys
import os
from bson import ObjectId
from datetime import datetime, timezone
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))
from backend.app.config import db, LOCK_FILE
from backend.app.utils.logger import logger
from backend.app.services.scraper_dispatcher import scrape_product_details

# # === CONFIG ===
# MONGO_URI = "mongodb://localhost:27017"
# DB_NAME = "price_tracker_db"  # 🔁 change to your actual DB name
COLLECTION_NAME = "products"

# === SETUP ===
# client = MongoClient(MONGO_URI)
# db = client[DB_NAME]
product_collection = db[COLLECTION_NAME]


def update_price_for_product(product: dict):
    product_id = str(product["_id"])
    url = product["url"]
    site_name = product.get("site_name", "")
    
    logger.info(f"🔍 Tracking '{product.get('name', 'Unknown')}' (ID: {product_id})")
    
    if product.get("site_name") == "string":
        inferred_site = "Amazon" if "amazon" in url else "Flipkart" if "flipkart" in url else "Unknown"
        product_collection.update_one({"_id": ObjectId(product_id)}, {"$set": {"site_name": inferred_site}})

    try:
        # NEW -> Major logic overhaul for AC-2
        scraped = scrape_product_details(url)
        
        price_num = None # Default to None for failed scrapes
        if scraped and isinstance(scraped, dict):
            price_text = scraped.get("Price", "")
            if price_text:
                # This parsing logic remains the same
                price_num = float("".join(c for c in price_text if c.isdigit() or c == "."))

        # NEW -> Always create a history entry. Use UTC for consistency.
        timestamp = datetime.now(timezone.utc)
        history_entry = {"price": price_num, "timestamp": timestamp}
        
        # NEW -> Construct a single, efficient update query
        update_query = {
            "$push": {"price_history": history_entry}
        }
        set_operations = {}

        # NEW -> Only perform $set operations if the scrape was successful
        if price_num is not None:
            set_operations["current_price"] = price_num
            
            current_low = product.get("historical_low_price")
            if current_low is None or price_num < current_low:
                set_operations["historical_low_price"] = price_num
                logger.info(f"🎉 New historical low for {product_id}: ₹{price_num}")

            current_high = product.get("historical_high_price")
            if current_high is None or price_num > current_high:
                set_operations["historical_high_price"] = price_num
                logger.info(f"📈 New historical high for {product_id}: ₹{price_num}")

            scraped_site_name = scraped.get("SiteName")
            if scraped_site_name:
                set_operations["site_name"] = scraped_site_name
        
        # NEW -> Add the $set operations to the main query if there are any
        if set_operations:
            update_query["$set"] = set_operations

        result = product_collection.update_one(
            {"_id": ObjectId(product_id)},
            update_query
        )

        # NEW -> Improved logging based on outcome
        if price_num is not None:
            if result.modified_count > 0:
                logger.info(f"✅ Successfully updated price for {product_id} to: ₹{price_num}")
            else:
                logger.info(f"ℹ️ Price for {product_id} is unchanged: ₹{price_num}")
        else:
            logger.warning(f"❌ Scraping failed for {product_id}. Logged null price to history.")
            
    except Exception as e:
        logger.exception(f"💥 An unexpected error occurred while processing product ID {product_id}")


def run_price_tracker():
    if os.path.exists(LOCK_FILE):
        logger.warning("🔒 Lock file exists. Another tracking process is likely running. Aborting.")
        return
    
    try:
        # Create the lock file to signal a run has started
        with open(LOCK_FILE, 'w') as f:
            f.write(str(os.getpid()))
        logger.info("==============================================")
        logger.info("📦 Starting new price tracker run...")
        products = product_collection.find({"status": "tracking"})

        count = 0
        for product in products:
            update_price_for_product(product)
            count += 1

        logger.info(f"🏁 Finished tracking {count} product(s).")
        logger.info("==============================================\n")
    
    finally:
        # This block will run whether the script succeeds or fails
        if os.path.exists(LOCK_FILE):
            os.remove(LOCK_FILE)
            logger.info("🔑 Lock file removed. Run complete.")


if __name__ == "__main__":
    run_price_tracker()
