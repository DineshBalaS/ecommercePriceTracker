from backend.app.services.scraper import scrape_price

url = "https://www.flipkart.com/nothing-phone-3a/p/itm8150b2c810f5b?pid=MOBH8G3P6UXPEFSZ"
print(scrape_price(url, "flipkart"))
