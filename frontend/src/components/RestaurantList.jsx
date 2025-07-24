import React from 'react';
import RestaurantCard from './RestaurantCard';

function RestaurantList({ restaurants }) {
  if (!restaurants.length) {
    return <div>Aucun restaurant trouvé.</div>;
  }
  return (
    <div className="restaurant-list">
      {restaurants.map((resto) => (
        <RestaurantCard key={resto.id || resto.nom} restaurant={resto} />
      ))}
    </div>
  );
}

export default RestaurantList; 