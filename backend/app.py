from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os

app = Flask(__name__)
CORS(app)  # Permet les requêtes cross-origin depuis le frontend

# Configuration MongoDB
MONGO_URI = "mongodb+srv://marwan:azertyuiop@tpscraper.3qvttr9.mongodb.net/?retryWrites=true&w=majority&appName=Tpscraper"
DATABASE = "google_maps_data"
COLLECTION = "restaurants_idf"

# Connexion MongoDB
client = MongoClient(MONGO_URI)
db = client[DATABASE]
collection = db[COLLECTION]

@app.route('/api/restaurants', methods=['GET'])
def get_restaurants():
    """Récupère tous les restaurants de la collection"""
    try:
        # Récupère tous les documents
        restaurants = list(collection.find({}))
        
        # Convertit les ObjectId en string pour le JSON
        for restaurant in restaurants:
            restaurant['_id'] = str(restaurant['_id'])
        
        return jsonify({
            'success': True,
            'data': restaurants,
            'count': len(restaurants)
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/restaurants/stats', methods=['GET'])
def get_restaurant_stats():
    """Récupère des statistiques sur les restaurants"""
    try:
        total_count = collection.count_documents({})
        
        # Statistiques par département
        dept_stats = list(collection.aggregate([
            {"$group": {"_id": "$Département", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]))
        
        # Statistiques par catégorie
        category_stats = list(collection.aggregate([
            {"$group": {"_id": "$Catégorie", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]))
        
        # Statistiques par zone de recherche
        zone_stats = list(collection.aggregate([
            {"$group": {"_id": "$Zone_de_recherche", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]))
        
        return jsonify({
            'success': True,
            'stats': {
                'total_restaurants': total_count,
                'by_department': dept_stats,
                'by_category': category_stats,
                'by_zone': zone_stats
            }
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/restaurants/search', methods=['GET'])
def search_restaurants():
    """Recherche des restaurants par nom, catégorie ou département"""
    from flask import request
    
    try:
        query = request.args.get('q', '')
        department = request.args.get('dept', '')
        category = request.args.get('category', '')
        
        # Construction du filtre de recherche
        search_filter = {}
        
        if query:
            search_filter['$or'] = [
                {'Nom': {'$regex': query, '$options': 'i'}},
                {'Adresse': {'$regex': query, '$options': 'i'}}
            ]
        
        if department:
            search_filter['Département'] = department
            
        if category:
            search_filter['Catégorie'] = {'$regex': category, '$options': 'i'}
        
        # Recherche avec filtre
        restaurants = list(collection.find(search_filter).limit(100))
        
        # Convertit les ObjectId en string
        for restaurant in restaurants:
            restaurant['_id'] = str(restaurant['_id'])
        
        return jsonify({
            'success': True,
            'data': restaurants,
            'count': len(restaurants)
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Vérification de l'état de l'API et de la connexion MongoDB"""
    try:
        # Test de connexion MongoDB
        client.admin.command('ping')
        db_status = "Connected"
        restaurant_count = collection.count_documents({})
    except Exception as e:
        db_status = f"Error: {str(e)}"
        restaurant_count = 0
    
    return jsonify({
        'api_status': 'OK',
        'database_status': db_status,
        'restaurant_count': restaurant_count
    })

if __name__ == '__main__':
    print("🚀 Démarrage du serveur API...")
    print(f"📊 Base de données: {DATABASE}")
    print(f"📋 Collection: {COLLECTION}")
    print("🌐 API disponible sur: http://localhost:5000")
    print("\n📍 Endpoints disponibles:")
    print("  GET /api/restaurants - Tous les restaurants")
    print("  GET /api/restaurants/stats - Statistiques")
    print("  GET /api/restaurants/search - Recherche")
    print("  GET /api/health - État de l'API")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
