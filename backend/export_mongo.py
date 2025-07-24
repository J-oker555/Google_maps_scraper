from pymongo import MongoClient
import json

# Configuration pour accéder aux données des restaurants IDF
MONGO_URI = "mongodb+srv://marwan:azertyuiop@tpscraper.3qvttr9.mongodb.net/?retryWrites=true&w=majority&appName=Tpscraper"
DATABASE = "google_maps_data"  # Base de données existante
COLLECTION = "restaurants_idf"  # Collection des restaurants IDF

client = MongoClient(MONGO_URI)
db = client[DATABASE]
collection = db[COLLECTION]

# Récupère tous les documents
data = list(collection.find({}))

# Convertit les ObjectId en string pour le JSON
for doc in data:
    doc['_id'] = str(doc['_id'])

# Sauvegarde en JSON
with open("restaurants_idf_export.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Exporté {len(data)} documents dans restaurants_idf_export.json")