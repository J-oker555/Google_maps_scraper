import React from 'react';
import RestaurantCard from './RestaurantCard';

function RestaurantList({ restaurants }) {
  if (!restaurants.length) {
    return <div>Aucun restaurant trouvé.</div>;
  }
  return (
    <div className="restaurant-list">
      {restaurants.map((resto) => (
        <RestaurantCard key={resto._id || resto.Nom} restaurant={resto} />
      ))}
    </div>
  );
}

export default RestaurantList; 