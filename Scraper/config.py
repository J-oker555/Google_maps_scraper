# scraper/config.py

# --- CONFIGURATION MONGODB ---

MONGO_URI = "mongodb+srv://ilyas:azertyuiop@tpscraper.3qvttr9.mongodb.net/?retryWrites=true&w=majority&appName=Tpscraper"
DB_NAME = "google_maps_data"
COLLECTION_NAME = "restaurants_idf"

# --- CIBLES DE SCRAPING ---
SEARCH_KEYWORD = "restaurant"

# Départements de l'Île-de-France
ZONES_TO_SCRAPE = {
    '75': ['Paris'], # Paris est assez grand pour être traité seul
    '77': ['Meaux', 'Chelles', 'Melun', 'Pontault-Combault'],
    '78': ['Versailles', 'Sartrouville', 'Mantes-la-Jolie', 'Saint-Germain-en-Laye'],
    '91': ['Évry-Courcouronnes', 'Corbeil-Essonnes', 'Massy', 'Savigny-sur-Orge'],
    '92': ['Boulogne-Billancourt', 'Nanterre', 'Asnières-sur-Seine', 'Colombes'],
    '93': ['Saint-Denis', 'Montreuil', 'Aulnay-sous-Bois', 'Aubervilliers'],
    '94': ['Créteil', 'Vitry-sur-Seine', 'Champigny-sur-Marne', 'Saint-Maur-des-Fossés'],
    '95': ['Argenteuil', 'Cergy', 'Sarcelles', 'Pontoise']
}

# --- CONFIGURATION SELENIUM ---
SCROLL_PAUSE_TIME = 2.5
MAX_SCROLLS = 30

USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
]

# --- SÉLECTEURS CSS ---
SEARCH_BOX_ID = "searchboxinput"
SCROLLABLE_ELEMENT_SELECTOR = "div[role='feed']"
RESULT_ITEM_LINK_SELECTOR = "a.hfpxzc"
DETAILED_NAME_SELECTOR = "h1.DUwDvf, h1.fontHeadlineLarge"
DETAILED_ADDRESS_SELECTOR = "button[data-item-id='address'] div.Io6YTe"
DETAILED_PHONE_SELECTOR = "button[data-item-id^='phone:tel:']"
DETAILED_CATEGORY_SELECTOR = "button[jsaction*='category']"
DETAILED_WEBSITE_SELECTOR = "a[data-item-id='authority']"