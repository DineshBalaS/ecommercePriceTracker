from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError
from bs4 import BeautifulSoup

def get_flipkart_page_html(url: str) -> str | None:
    """Fetch page HTML using Playwright."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(user_agent=(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
        ))
        page = context.new_page()

        try:
            page.goto(url, timeout=60000)
            page.wait_for_selector("body", timeout=10000)
            return page.content()
        except PlaywrightTimeoutError:
            print("[Error] Timeout while loading the page.")
        except Exception as e:
            print(f"[Error] Failed to load page: {e}")
        finally:
            browser.close()

    return None

def extract_product_data(html: str) -> dict:
    """Extract product data from Flipkart page HTML."""
    soup = BeautifulSoup(html, 'html.parser')

    def safe_find(tag, attrs):
        element = soup.find(tag, attrs)
        return element.text.strip() if element else "Not found"

    title = safe_find("span", {"class": "VU-ZEz"})
    price = safe_find("div", {"class": "Nx9bqj CxhGGd"})
    rating = safe_find("div", {"class": "XQDdHH"})

    # Seller name is nested more deeply
    seller_div = soup.find("div", id="sellerName")
    seller_name = (
        seller_div.find("span").find("span").text.strip()
        if seller_div and seller_div.find("span") and seller_div.find("span").find("span")
        else "Not found"
    )

    desc = safe_find("div", {"class": "AoD2-N"})

    return {
        "Title": title,
        "Price": price,
        "Rating": rating,
        "Seller": seller_name,
        "Description": desc,
        "SiteName": "Flipkart"
    }


