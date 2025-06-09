import asyncio
import random
import time
from typing import Optional
from playwright.async_api import async_playwright
from playwright_stealth import stealth_async

HEADERS_LIST = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15"
]

async def scrape_price(url: str, site_name: str, retries: int = 3) -> Optional[float]:
    for attempt in range(1, retries + 1):
        try:
            async with async_playwright() as p:
                # Launch browser in headful mode so you can watch what happens
                browser = await p.chromium.launch(headless=False)
                
                # Create a fresh context with randomized user-agent and locale
                context = await browser.new_context(
                    user_agent=random.choice(HEADERS_LIST),
                    locale="en-US",
                    viewport={"width": 1280, "height": 800}
                )
                page = await context.new_page()
                
                # Apply stealth techniques to evade bot detection
                await stealth_async(page)
                
                print(f"➡️ Attempt {attempt}: Navigating to {url}")
                await page.goto(url, timeout=30000)  # 30 seconds timeout
                await page.wait_for_load_state('domcontentloaded')
                
                # Depending on site, wait and select the price element
                if site_name.lower() == "flipkart":
                    try:
                        await page.wait_for_selector("._30jeq3", timeout=15000)
                        element = await page.query_selector("._30jeq3")
                    except Exception:
                        print("⚠️ Price selector not found after wait on Flipkart.")
                        content = await page.content()
                        print(f"Page content snippet:\n{content[:1000]}")
                        await page.screenshot(path="debug_flipkart.png")
                        await browser.close()
                        return None
                
                elif site_name.lower() == "croma":
                    element = await page.query_selector("span.amount")
                elif site_name.lower() == "reliance":
                    element = await page.query_selector(".TextWeb__Text-sc-1cyx778-0.PriceText")
                else:
                    print("⚠️ Unsupported site.")
                    await browser.close()
                    return None
                
                if element:
                    price_text = await element.inner_text()
                    print(f"💰 Raw price text: {price_text}")
                    await browser.close()
                    return extract_numeric_price(price_text)
                else:
                    print("⚠️ Price element not found on page.")
                    await page.screenshot(path="debug_no_price.png")
                    await browser.close()
                    return None

        except Exception as e:
            print(f"❌ Attempt {attempt} failed: {e}")
            # Backoff before retrying
            wait_time = 5 * attempt
            print(f"⏳ Waiting {wait_time} seconds before retry...")
            time.sleep(wait_time)

    print("❌ All retries failed.")
    return None


def extract_numeric_price(text: str) -> float:
    # Keep digits and dots only, then convert to float
    filtered = "".join(c for c in text if c.isdigit() or c == ".")
    try:
        return float(filtered)
    except ValueError:
        print(f"⚠️ Could not convert extracted text to float: {filtered}")
        return 0.0


# Run test if executed directly
if __name__ == "__main__":
    test_url = "https://www.flipkart.com/nothing-phone-3a/p/itm8150b2c810f5b?pid=MOBH8G3P6UXPEFSZ"
    site = "flipkart"

    price = asyncio.run(scrape_price(test_url, site))
    if price:
        print(f"✅ Scraped price: ₹{price}")
    else:
        print("❌ Failed to scrape price.")
