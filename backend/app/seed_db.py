import os
import sys
import random
from datetime import datetime, timedelta, timezone
from pymongo import MongoClient
from bson import ObjectId
from faker import Faker

# This allows the script to import from your app structure
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# --- CONFIGURATION ---
MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "price_tracker_db"
COLLECTION_NAME = "products"

# User IDs you provided
USER_IDS = [
    "6870dd11f12b13fa493ab03b", "6891eb59d4bf2ecae6ad0a1f",
    "68904ead8560c81c6a7d402b", "686b5ac44f6c13ff034a0eb0",
    "687c7d6e2ee4b468c720db2d", "688b8b6264217ce2afd49d7e",
    "684416aeb078098272f5016a", "687c79b72ee4b468c720db2c",
]

# Product distribution
NUM_TRACKING = 80
NUM_SAVED = 15
NUM_PURCHASED = 5
TOTAL_PRODUCTS = NUM_TRACKING + NUM_SAVED + NUM_PURCHASED

# Sample products to make data look more realistic
SAMPLE_PRODUCTS = [
    {"name": "Sony WH-1000XM5 Wireless Headphones", "url": "https://www.amazon.in/Sony-WH-1000XM5-Wireless-Cancelling-Headphones/dp/B09Y23P1B9/"},
    {"name": "Apple iPhone 15 Pro (256 GB)", "url": "https://www.amazon.in/Apple-iPhone-15-Pro-256/dp/B0CHX36X3P/"},
    {"name": "Samsung Galaxy S24 Ultra 5G", "url": "https://www.flipkart.com/samsung-galaxy-s24-ultra-5g-titanium-gray-512-gb/p/itm249abe85b113e"},
    {"name": "Dell XPS 15 Laptop", "url": "https://www.amazon.in/Dell-XPS-9530-i7-13700H-32GB-RTX-4060-8GB/dp/B0CHY6Z2Y7/"},
    {"name": "LG C3 55-inch OLED TV", "url": "https://www.flipkart.com/lg-c3-139-cm-55-inch-ultra-hd-4k-oled-tv-2023-model/p/itm5e44a2b97c271"},
    {"name": "Logitech MX Master 3S Mouse", "url": "https://www.amazon.in/Logitech-Master-Wireless-Performance-Mouse/dp/B0B114825L/"},
    {"name": "Canon EOS R6 Mark II Camera", "url": "https://www.flipkart.com/canon-eos-r6-mark-ii-rf-24-105mm-f4-7-1-stm/p/itm74b4632a677b1"},
    {"name": "Instant Pot Duo 6-Quart", "url": "https://www.amazon.in/Instant-Pot-Duo-Multi-Use-Programmable/dp/B01NBKTPTS/"},
]

# --- SCRIPT LOGIC ---
fake = Faker('en_IN') # Use Indian locale for more relevant names/notes

def generate_price_history(start_price):
    """Generates a realistic-looking price history for the last 180 days."""
    history = []
    current_price = start_price
    min_price = start_price
    max_price = start_price
    
    for i in range(180, 0, -1):
        if random.random() < 0.7:
            continue
            
        timestamp = datetime.now(timezone.utc) - timedelta(days=i, hours=random.randint(0, 23))
        change_percent = random.uniform(-0.03, 0.03)
        current_price *= (1 + change_percent)
        current_price = max(current_price, start_price * 0.5)

        min_price = min(min_price, current_price)
        max_price = max(max_price, current_price)
        
        history.append({"price": round(current_price, 2), "timestamp": timestamp})
        
    return {
        "price_history": history,
        "current_price": round(history[-1]['price'], 2) if history else start_price,
        "historical_low_price": round(min_price, 2),
        "historical_high_price": round(max_price, 2),
    }

def seed_database():
    """Wipes the products collection and populates it with fake data."""
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        product_collection = db[COLLECTION_NAME]
        
        print("--- Starting Database Seeding ---")
        # LOG -> Step 1: Connection
        print(f"✅ [1/5] Successfully connected to MongoDB.")
        
        # 1. Purge existing data
        print(f"🗑️  [2/5] Purging collection '{COLLECTION_NAME}'...")
        result = product_collection.delete_many({})
        # LOG -> Step 2: Purge confirmation
        print(f"✔️  Purge complete. Deleted {result.deleted_count} documents.")
        
        # 2. Prepare product statuses
        # LOG -> Step 3: Data preparation
        print(f"📝 [3/5] Preparing product list: {NUM_TRACKING} tracking, {NUM_SAVED} saved, {NUM_PURCHASED} purchased.")
        statuses = (["tracking"] * NUM_TRACKING) + \
                   (["saved"] * NUM_SAVED) + \
                   (["purchased"] * NUM_PURCHASED)
        random.shuffle(statuses)
        
        # 3. Generate new product documents
        # LOG -> Step 4: Generation start
        print(f"📦 [4/5] Generating {TOTAL_PRODUCTS} new product documents...")
        products_to_insert = []
        for i in range(TOTAL_PRODUCTS):
            owner_id = USER_IDS[i % len(USER_IDS)]
            product_template = random.choice(SAMPLE_PRODUCTS)
            status = statuses[i]
            
            price_data = generate_price_history(start_price=random.uniform(8000, 45000))
            
            product_doc = {
                "owner_id": ObjectId(owner_id),
                "name": product_template["name"],
                "url": product_template["url"],
                "site_name": "Amazon" if "amazon" in product_template["url"] else "Flipkart",
                "status": status,
                "desired_price": round(price_data["historical_low_price"] * 0.95, 2),
                "notes": fake.sentence(nb_words=random.randint(4, 10)),
                "created_at": datetime.now(timezone.utc) - timedelta(days=180),
                "purchased_date": datetime.now(timezone.utc) - timedelta(days=random.randint(1, 30)) if status == "purchased" else None,
                "current_price": price_data["current_price"],
                "price_history": price_data["price_history"],
                "historical_low_price": price_data["historical_low_price"],
                "historical_high_price": price_data["historical_high_price"]
            }
            products_to_insert.append(product_doc)

            sys.stdout.write(f"\rGenerated {i + 1}/{TOTAL_PRODUCTS} products...")
            sys.stdout.flush()

        # LOG -> Step 4: Generation confirmation
        print(f"\n✔️  Generation complete.")

        # 4. Bulk insert into the database
        # LOG -> Step 5: Insertion start
        print(f"📤 [5/5] Performing bulk insert into '{COLLECTION_NAME}' collection...")
        if products_to_insert:
            product_collection.insert_many(products_to_insert)
            # LOG -> Step 5: Insertion confirmation
            print(f"✔️  Successfully inserted {len(products_to_insert)} new documents.")
        else:
            print("No documents were generated to insert.")
            
        client.close()
        # LOG -> Final confirmation
        print("🔒 MongoDB connection closed.")
        print("\n🎉 --- Database Seeding Finished Successfully --- 🎉")
        
    except Exception as e:
        # LOG -> Error log
        print(f"\n❌ An error occurred: {e}")

if __name__ == "__main__":
    seed_database()