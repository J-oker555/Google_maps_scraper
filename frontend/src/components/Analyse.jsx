import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function getTop5(restaurants) {
  // Suppose que la note n'existe plus, donc on ne trie plus par note
  // On peut trier par Nom ou autre critère si besoin
  return [...restaurants]
    // .sort((a, b) => b.note - a.note) // désactivé car plus de note
    .slice(0, 5);
}

function getCuisineStats(restaurants) {
  const stats = {};
  restaurants.forEach(r => {
    const cuisine = r.Catégorie || 'Inconnu';
    stats[cuisine] = (stats[cuisine] || 0) + 1;
  });
  return stats;
}

function getMostPopularCuisine(stats) {
  let max = 0, cuisine = '';
  for (const [key, value] of Object.entries(stats)) {
    if (value > max) {
      max = value;
      cuisine = key;
    }
  }
  return cuisine;
}

function extractArrondissement(adresse) {
  const match = adresse && adresse.match(/(75|69|13)(\d{3})/);
  if (match) {
    const code = match[2];
    if (match[1] === '75') return code + 'e Paris';
    if (match[1] === '69') return code + 'e Lyon';
    if (match[1] === '13') return code + 'e Marseille';
  }
  return 'Autre';
}

function getArrondissementStats(restaurants) {
  const stats = {};
  restaurants.forEach(r => {
    const arr = extractArrondissement(r.Adresse);
    stats[arr] = (stats[arr] || 0) + 1;
  });
  return stats;
}

const Analyse = ({ restaurants }) => {
  if (!restaurants || restaurants.length === 0) return <div>Aucune donnée à analyser.</div>;
  const top5 = getTop5(restaurants);
  const cuisineStats = getCuisineStats(restaurants);
  const mostPopular = getMostPopularCuisine(cuisineStats);
  const arrondissementStats = getArrondissementStats(restaurants);
  const pieData = {
    labels: Object.keys(cuisineStats),
    datasets: [
      {
        data: Object.values(cuisineStats),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#B2FF66', '#FF66B2', '#66B2FF'
        ],
      },
    ],
  };
  const barData = {
    labels: Object.keys(arrondissementStats),
    datasets: [
      {
        label: 'Nombre de restaurants',
        data: Object.values(arrondissementStats),
        backgroundColor: '#36A2EB',
      },
    ],
  };

  return (
    <div className="analyse-container">
      <h1>Analyse des Restaurants</h1>
      <div className="analyse-section">
        <div className="analyse-card">
          <h2>Top 5 des restaurants</h2>
          <ol className="top5-list">
            {top5.map(r => (
              <li key={r._id}>
                <strong>{r.Nom}</strong> ({r.Catégorie})<br/>
                <span style={{color:'#888', fontSize:'0.97em'}}>{r.Adresse}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="analyse-card">
          <h2>Répartition par type de cuisine</h2>
          <div className="pie-chart-wrapper">
            <Pie data={pieData} />
          </div>
        </div>
        <div className="analyse-card">
          <h2>Cuisine la plus populaire</h2>
          <span className="most-popular-cuisine">{mostPopular}</span>
        </div>
        <div className="analyse-card">
          <h2>Nombre de restaurants par arrondissement</h2>
          <div style={{ maxWidth: 500, margin: '0 auto' }}>
            <Bar data={barData} options={{
              indexAxis: 'y',
              plugins: { legend: { display: false } },
              scales: {
                x: {
                  beginAtZero: true,
                  precision: 0,
                  stepSize: 1,
                  ticks: { stepSize: 1 }
                }
              }
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyse; 