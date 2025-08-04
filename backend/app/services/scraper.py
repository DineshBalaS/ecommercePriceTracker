import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Language": "en-US,en;q=0.9"
}

def get_text(soup, tag, attrs=None):
    element = soup.find(tag, attrs or {})
    return element.text.strip() if element else "Not found"

def get_description(soup):
    ul = soup.find("ul", class_="a-unordered-list a-vertical a-spacing-mini")
    if not ul:
        return "Description not found"
    items = ul.find_all("span", class_="a-list-item")
    return " ".join([item.text.strip() for item in items if item.text.strip()])

def scrape_amazon_product(url):
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"[Amazon Scraper] Request failed: {e}")
        return None

    soup = BeautifulSoup(response.text, 'html.parser')

    data = {
        "Title": get_text(soup, 'h1'),
        "Price": get_text(soup, 'span', {"class": "a-price-whole"}),
        "Rating": get_text(soup, 'span', {"class": "a-size-base a-color-base", "aria-hidden": "true"}),
        "Seller": get_text(soup, 'a', {"id": "sellerProfileTriggerId"}),
        "Description": get_description(soup),
        "SiteName": "Amazon"
    }

    return data
