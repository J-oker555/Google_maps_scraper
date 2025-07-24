import React from 'react';

function IconLocation() {
  return (
    <svg fill="none" viewBox="0 0 24 24" width="16" height="16"><path d="M12 21s-6-5.686-6-10A6 6 0 0 1 18 11c0 4.314-6 10-6 10Z" stroke="currentColor" strokeWidth="1.5"/></svg>
  );
}
function IconFood() {
  return (
    <svg fill="none" viewBox="0 0 24 24" width="16" height="16"><path d="M4 10a8 8 0 1 1 16 0c0 4.418-4 8-8 8s-8-3.582-8-8Z" stroke="currentColor" strokeWidth="1.5"/></svg>
  );
}
function IconStar() {
  return (
    <svg fill="#ffb300" viewBox="0 0 24 24" width="16" height="16"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
  );
}

function RestaurantCard({ restaurant }) {
  return (
    <div className="restaurant-card">
      <div className="img-placeholder">
        🍽️
      </div>
      <div className="restaurant-card-content">
        <h2>{restaurant.Nom}</h2>
        <div className="restaurant-info">
          <IconLocation />
          <span>{restaurant.Adresse}</span>
        </div>
        <div className="restaurant-info">
          <IconFood />
          <span>{restaurant.Catégorie}</span>
        </div>
        <div className="restaurant-info">
          <b>Département :</b>&nbsp;<span>{restaurant.Département}</span>
        </div>
        {restaurant.Téléphone && (
          <div className="restaurant-info">
            <b>Tél :</b>&nbsp;<span>{restaurant.Téléphone}</span>
          </div>
        )}
        {restaurant.Site_Web && (
          <div className="restaurant-info">
            <a href={restaurant.Site_Web} target="_blank" rel="noopener noreferrer">Site web</a>
          </div>
        )}
        {restaurant.URL && (
          <div className="restaurant-info">
            <a href={restaurant.URL} target="_blank" rel="noopener noreferrer">Voir sur Google Maps</a>
          </div>
        )}
        {restaurant.Zone_de_recherche && (
          <div className="autres">Zone : {restaurant.Zone_de_recherche}</div>
        )}
      </div>
    </div>
  );
}

export default RestaurantCard; 