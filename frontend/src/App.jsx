import React, { useState, useEffect } from 'react';
import RestaurantList from './components/RestaurantList';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Analyse from './components/Analyse';

// Configuration de l'API
const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour récupérer les restaurants depuis l'API
  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/restaurants`);
      const data = await response.json();
      
      if (data.success) {
        setRestaurants(data.data);
        setError(null);
      } else {
        setError('Erreur lors de la récupération des données');
      }
    } catch (err) {
      setError('Impossible de se connecter à l\'API: ' + err.message);
      console.error('Erreur API:', err);
    } finally {
      setLoading(false);
    }
  };

  // Récupération des données au chargement du composant
  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Fonction pour grouper les restaurants par catégorie (5 par catégorie)
  const renderRestaurantsByCategory = () => {
    // Grouper les restaurants par catégorie
    const restaurantsByCategory = restaurants.reduce((acc, restaurant) => {
      const category = restaurant.Catégorie || 'Autre';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(restaurant);
      return acc;
    }, {});

    // Trier les catégories par nombre de restaurants (décroissant)
    const sortedCategories = Object.keys(restaurantsByCategory).sort(
      (a, b) => restaurantsByCategory[b].length - restaurantsByCategory[a].length
    );

    return sortedCategories.map(category => {
      const categoryRestaurants = restaurantsByCategory[category].slice(0, 5); // Limiter à 5
      const totalInCategory = restaurantsByCategory[category].length;
      
      return (
        <div key={category} style={{marginBottom: '3rem'}}>
          <h2 style={{
            color: '#333',
            borderBottom: '2px solid #007bff',
            paddingBottom: '0.5rem',
            marginBottom: '1rem'
          }}>
            🍽️ {category}
            <span style={{
              fontSize: '0.8rem',
              color: '#666',
              fontWeight: 'normal',
              marginLeft: '1rem'
            }}>
              ({categoryRestaurants.length} affichés sur {totalInCategory})
            </span>
          </h2>
          <RestaurantList restaurants={categoryRestaurants} />
          {totalInCategory > 5 && (
            <div style={{
              textAlign: 'center',
              marginTop: '1rem',
              color: '#007bff',
              fontStyle: 'italic'
            }}>
              ... et {totalInCategory - 5} autres restaurants dans cette catégorie
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <Router>
      <div className="container">
        <nav style={{ marginBottom: '2rem' }}>
          <Link to="/">Accueil</Link> | <Link to="/analyse">Analyse</Link>
        </nav>
        <Routes>
          <Route path="/" element={<>
            <h1>Aperçu des Restaurants par Catégorie</h1>
            {loading && <div style={{textAlign: 'center', padding: '2rem'}}>Chargement des restaurants...</div>}
            {error && <div style={{color: 'red', textAlign: 'center', padding: '1rem'}}>❌ {error}</div>}
            {!loading && !error && (
              <>
                <div style={{marginBottom: '2rem', color: '#666', textAlign: 'center'}}>
                  📊 {restaurants.length} restaurants trouvés au total
                </div>
                {renderRestaurantsByCategory()}
              </>
            )}
          </>} />
          <Route path="/analyse" element={<Analyse restaurants={restaurants} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
