import time
import os
import random
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError

# Importer la configuration
from config import (
    MONGO_URI, DB_NAME, COLLECTION_NAME, SEARCH_KEYWORD, ZONES_TO_SCRAPE,
    SCROLL_PAUSE_TIME, MAX_SCROLLS, USER_AGENTS, SEARCH_BOX_ID,
    SCROLLABLE_ELEMENT_SELECTOR, RESULT_ITEM_LINK_SELECTOR, DETAILED_NAME_SELECTOR,
    DETAILED_ADDRESS_SELECTOR, DETAILED_PHONE_SELECTOR, DETAILED_CATEGORY_SELECTOR,
    DETAILED_WEBSITE_SELECTOR
)

class GoogleMapsScraper:
    def __init__(self):
        self.driver = self._configure_driver()
        self.collection = self._connect_to_db()
        self.collection.create_index([("Nom", 1), ("Adresse", 1)], unique=True)

    def _configure_driver(self):
        """Configure et retourne une instance du navigateur Chrome."""
        options = webdriver.ChromeOptions()
        options.add_argument(f"user-agent={random.choice(USER_AGENTS)}")
        options.add_experimental_option('excludeSwitches', ['enable-logging'])
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        options.add_argument("--window-size=1280,1024")
        options.add_argument("--log-level=3")
        
        try:
            driver = webdriver.Chrome(options=options)
            print("WebDriver initialisé.")
            return driver
        except Exception as e:
            print(f"Erreur lors de l'initialisation de WebDriver : {e}")
            raise

    def _connect_to_db(self):
        """Se connecte à MongoDB et retourne la collection."""
        try:
            client = MongoClient(MONGO_URI)
            db = client[DB_NAME]
            collection = db[COLLECTION_NAME]
            print(f"Connecté à MongoDB. DB: '{DB_NAME}', Collection: '{COLLECTION_NAME}'")
            return collection
        except Exception as e:
            print(f"Erreur de connexion à MongoDB : {e}")
            raise

    def run(self):
        """Méthode principale pour lancer le scraping."""
        is_first_search = True
        try:
            for dep_code, zones in ZONES_TO_SCRAPE.items():
                print(f"\n{'='*40}\nCOMMENCEMENT SCRAPING POUR LE DÉPARTEMENT : {dep_code}\n{'='*40}")
                for zone in zones:
                    search_query = f"{SEARCH_KEYWORD} {zone}"
                    self._scrape_zone(search_query, dep_code, zone, is_first_search)
                    is_first_search = False
        except KeyboardInterrupt:
            print("\nScript interrompu par l'utilisateur.")
        except Exception as e:
            print(f"Erreur globale fatale : {e}")
        finally:
            self.close()

    def _scrape_zone(self, search_query, dep_code, zone, is_first_search):
        """Scrape une zone de recherche spécifique."""
        print(f"\n--- Lancement recherche : '{search_query}' ---")
        query_for_url = search_query.replace(' ', '+')
        maps_search_url = f"https://www.google.com/maps/search/{query_for_url}"
        self.driver.get(maps_search_url)

        if is_first_search:
            self._handle_consent()

        try:
            WebDriverWait(self.driver, 15).until(EC.presence_of_element_located((By.CSS_SELECTOR, SCROLLABLE_ELEMENT_SELECTOR)))
            time.sleep(2)
            
            item_urls = self._scroll_and_collect_urls(search_query)
            
            for i, url in enumerate(item_urls):
                print(f"--- Traitement URL {i+1}/{len(item_urls)} de '{search_query}' ---")
                raw_data = self._extract_data_from_detail_page(url, dep_code, zone)
                
                if raw_data:
                    cleaned_data = self._clean_data(raw_data)
                    self._save_to_db(cleaned_data)
                
                sleep_time = random.uniform(1.8, 4.0)
                print(f"    Pause de {sleep_time:.2f}s...")
                time.sleep(sleep_time)

        except Exception as e:
            print(f"Erreur durant la recherche pour '{search_query}': {e}")

    def _handle_consent(self):
        """Gère la pop-up de consentement."""
        try:
            consent_btn = WebDriverWait(self.driver, 7).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Tout refuser') or contains(., 'Reject all')]"))
            )
            consent_btn.click()
            print("Pop-up consentement gérée.")
            time.sleep(2)
        except TimeoutException:
            print("Pas de pop-up consentement trouvée ou déjà gérée.")

    def _scroll_and_collect_urls(self, current_query):
        """Scrolle la liste de résultats et collecte les URLs."""
        try:
            scrollable_div = WebDriverWait(self.driver, 15).until(EC.presence_of_element_located((By.CSS_SELECTOR, SCROLLABLE_ELEMENT_SELECTOR)))
        except TimeoutException:
            print(f"Panneau de résultats non trouvé pour '{current_query}'.")
            return []
        
        urls = set()
        for i in range(MAX_SCROLLS):
            try:
                links = self.driver.find_elements(By.CSS_SELECTOR, RESULT_ITEM_LINK_SELECTOR)
                for link in links:
                    href = link.get_attribute('href')
                    if href and '/maps/place/' in href:
                        urls.add(href)
                
                self.driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight", scrollable_div)
                time.sleep(SCROLL_PAUSE_TIME)
                if self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Vous avez atteint la fin de la liste.')]"):
                    print("Fin de la liste de résultats atteinte.")
                    break
            except Exception as e:
                print(f"Erreur pendant le scroll : {e}")
                break
        
        print(f"Collecté {len(urls)} URLs uniques pour '{current_query}'.")
        return list(urls)

    def _extract_data_from_detail_page(self, url, dep_code, zone):
        """Navigue vers une URL et extrait les données brutes."""
        try:
            self.driver.get(url)
            WebDriverWait(self.driver, 15).until(EC.presence_of_element_located((By.CSS_SELECTOR, DETAILED_ADDRESS_SELECTOR)))
        except TimeoutException:
            if "consent.google.com" in self.driver.current_url or "google.com/sorry/" in self.driver.current_url:
                print("\n!!! CAPTCHA DÉTECTÉ !!! Résolvez-le manuellement.")
                input("Appuyez sur ENTRÉE une fois résolu...")
                self.driver.get(url) # Réessayez après résolution
            else:
                print(f"Timeout en chargeant la page de détail: {url}")
            return None
        
        data = {"Département": dep_code, "Zone de recherche": zone, "URL": url}
        try: data["Nom"] = self.driver.find_element(By.CSS_SELECTOR, DETAILED_NAME_SELECTOR).text.strip()
        except NoSuchElementException: data["Nom"] = None
        try: data["Adresse"] = self.driver.find_element(By.CSS_SELECTOR, DETAILED_ADDRESS_SELECTOR).text.strip()
        except NoSuchElementException: data["Adresse"] = None
        try: data["Catégorie"] = self.driver.find_element(By.CSS_SELECTOR, DETAILED_CATEGORY_SELECTOR).text.strip()
        except NoSuchElementException: data["Catégorie"] = "N/A"
        try:
            phone_el = self.driver.find_element(By.CSS_SELECTOR, DETAILED_PHONE_SELECTOR)
            data["Téléphone"] = phone_el.get_attribute("aria-label").split(':')[-1].strip()
        except NoSuchElementException: data["Téléphone"] = "N/A"
        try: data["Site Web"] = self.driver.find_element(By.CSS_SELECTOR, DETAILED_WEBSITE_SELECTOR).get_attribute('href')
        except NoSuchElementException: data["Site Web"] = "N/A"

        if not data.get("Nom") or not data.get("Adresse"):
            return None
        
        return data
    
    def _clean_data(self, data):
        """Nettoie et transforme les données brutes."""
        if data.get("Téléphone"):
            data["Téléphone"] = data["Téléphone"].replace(' ', '').replace('.', '')
        return data

    def _save_to_db(self, data):
        """Sauvegarde un item dans la base de données."""
        try:
            self.collection.update_one(
                {"Nom": data["Nom"], "Adresse": data["Adresse"]},
                {"$set": data},
                upsert=True
            )
            print(f"  ✅ Donnée sauvegardée/mise à jour pour '{data['Nom']}'")
        except DuplicateKeyError:
            print(f"  ⚠️ Doublon détecté et ignoré pour '{data['Nom']}' (via index).")
        except Exception as e:
            print(f"  ❌ Erreur lors de la sauvegarde de '{data['Nom']}': {e}")
            
    def close(self):
        """Ferme le navigateur."""
        if self.driver:
            self.driver.quit()
            print("\nNavigateur fermé.")

if __name__ == "__main__":
    scraper = GoogleMapsScraper()
    scraper.run()