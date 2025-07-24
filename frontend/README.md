# Frontend - Liste des Restaurants

Ce projet est une interface React moderne et facilement intégrable à n'importe quel backend REST.

## Installation

1. Place-toi dans le dossier `frontend` :
   ```bash
   cd frontend
   ```
2. Installe les dépendances :
   ```bash
   npm install
   ```

## Lancement du projet

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:5173](http://localhost:5173).

## Configuration de l'API

Modifie l'URL de l'API dans `src/config.js` :
```js
export const API_URL = 'http://localhost:3000'; // Mets ici l'URL de ton backend
```

L'API doit exposer une route `/restaurants` qui retourne un tableau JSON de restaurants, par exemple :
```json
[
  {
    "id": 1,
    "nom": "Le Gourmet",
    "adresse": "123 rue de Paris, 75000 Paris",
    "style": "Français",
    "note": 4.5,
    "autres": "Terrasse, réservation possible"
  }
]
```

## Structure du projet
- `src/App.jsx` : Composant principal
- `src/components/RestaurantList.jsx` : Liste des restaurants
- `src/components/RestaurantCard.jsx` : Carte d'un restaurant
- `src/config.js` : Configuration de l'API
- `src/style.css` : Style global

## Intégration
- Ce front peut être branché à n'importe quel backend qui expose une API REST compatible.
- Personnalise le style ou les champs selon tes besoins.

---

*Fait avec ❤️ pour l'intégration facile !* 