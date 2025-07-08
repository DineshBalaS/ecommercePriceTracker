import re
from urllib.parse import urlparse
from typing import Optional
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../')))

# Import your own Amazon and Flipkart scraper functions
from backend.app.services.scraper import scrape_amazon_product  # Replace with actual file name
from backend.app.services.flipkart_scraper import (
    get_flipkart_page_html,
    extract_product_data
)

def get_domain(url: str) -> str:
    """Extracts domain name from URL like 'amazon.in' or 'flipkart.com'."""
    parsed = urlparse(url)
    return parsed.netloc.lower()

def scrape_product_details(url: str) -> Optional[dict]:
    """Dispatcher to call appropriate scraper based on URL domain."""
    domain = get_domain(url)

    if "amazon" in domain:
        print("🔍 Using Amazon scraper")
        return scrape_amazon_product(url)

    elif "flipkart" in domain:
        print("🔍 Using Flipkart scraper")
        html = get_flipkart_page_html(url)
        if html:
            return extract_product_data(html)
        return None

    else:
        print(f"⚠️ Unsupported domain: {domain}")
        return None

if __name__ == "__main__":
    test_url = "https://www.amazon.in/Acer-Backlit-Response-Speakers-FreeSync/dp/B0DZHY5N59/ref=sr_1_5?nsdOptOutParam=true&sr=8-5"  # or Flipkart product URL
    data = scrape_product_details(test_url)
    if data:
        for k, v in data.items():
            print(f"{k}: {v}")
    else:
        print("❌ Failed to scrape product details.")
