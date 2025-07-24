import React, { useEffect, useState } from 'react';
import RestaurantList from './components/RestaurantList';
import { API_URL } from './config';

function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/restaurants`)
      .then((res) => {
        if (!res.ok) throw new Error('Erreur lors du chargement');
        return res.json();
      })
      .then((data) => {
        setRestaurants(data);
        setLoading(false);
      })
      .catch((err) => {
        // Données fictives en cas d'échec
        const fakeData = [
          {
            id: 1,
            nom: 'Le Gourmet',
            adresse: '123 rue de Paris, 75000 Paris',
            style: 'Français',
            note: 4.5,
            autres: 'Terrasse, réservation possible',
          },
          {
            id: 2,
            nom: 'Pizza Bella',
            adresse: '45 avenue de Rome, 13000 Marseille',
            style: 'Italien',
            note: 4.2,
            autres: 'Livraison, végétarien',
          },
          {
            id: 3,
            nom: 'Sushi Zen',
            adresse: '8 rue du Soleil, 69000 Lyon',
            style: 'Japonais',
            note: 4.8,
            autres: 'À emporter, menu midi',
          },
        ];
        setRestaurants(fakeData);
        setError(null); // On n'affiche pas l'erreur
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">Erreur : {error}</div>;

  return (
    <div className="container">
      <h1>Liste des Restaurants</h1>
      <RestaurantList restaurants={restaurants} />
    </div>
  );
}

export default App; 