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

function extractDepartement(adresse) {
  if (!adresse) return 'Inconnu';
  
  // Recherche du code postal (5 chiffres)
  const match = adresse.match(/\b(\d{5})\b/);
  if (match) {
    const codePostal = match[1];
    const dept = codePostal.substring(0, 2);
    
    // Mapping des départements français
    const departements = {
      '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence',
      '05': 'Hautes-Alpes', '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes',
      '09': 'Ariège', '10': 'Aube', '11': 'Aude', '12': 'Aveyron',
      '13': 'Bouches-du-Rhône', '14': 'Calvados', '15': 'Cantal', '16': 'Charente',
      '17': 'Charente-Maritime', '18': 'Cher', '19': 'Corrèze', '21': 'Côte-d\'Or',
      '22': 'Côtes-d\'Armor', '23': 'Creuse', '24': 'Dordogne', '25': 'Doubs',
      '26': 'Drôme', '27': 'Eure', '28': 'Eure-et-Loir', '29': 'Finistère',
      '30': 'Gard', '31': 'Haute-Garonne', '32': 'Gers', '33': 'Gironde',
      '34': 'Hérault', '35': 'Ille-et-Vilaine', '36': 'Indre', '37': 'Indre-et-Loire',
      '38': 'Isère', '39': 'Jura', '40': 'Landes', '41': 'Loir-et-Cher',
      '42': 'Loire', '43': 'Haute-Loire', '44': 'Loire-Atlantique', '45': 'Loiret',
      '46': 'Lot', '47': 'Lot-et-Garonne', '48': 'Lozère', '49': 'Maine-et-Loire',
      '50': 'Manche', '51': 'Marne', '52': 'Haute-Marne', '53': 'Mayenne',
      '54': 'Meurthe-et-Moselle', '55': 'Meuse', '56': 'Morbihan', '57': 'Moselle',
      '58': 'Nièvre', '59': 'Nord', '60': 'Oise', '61': 'Orne',
      '62': 'Pas-de-Calais', '63': 'Puy-de-Dôme', '64': 'Pyrénées-Atlantiques', '65': 'Hautes-Pyrénées',
      '66': 'Pyrénées-Orientales', '67': 'Bas-Rhin', '68': 'Haut-Rhin', '69': 'Rhône',
      '70': 'Haute-Saône', '71': 'Saône-et-Loire', '72': 'Sarthe', '73': 'Savoie',
      '74': 'Haute-Savoie', '75': 'Paris', '76': 'Seine-Maritime', '77': 'Seine-et-Marne',
      '78': 'Yvelines', '79': 'Deux-Sèvres', '80': 'Somme', '81': 'Tarn',
      '82': 'Tarn-et-Garonne', '83': 'Var', '84': 'Vaucluse', '85': 'Vendée',
      '86': 'Vienne', '87': 'Haute-Vienne', '88': 'Vosges', '89': 'Yonne',
      '90': 'Territoire de Belfort', '91': 'Essonne', '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis',
      '94': 'Val-de-Marne', '95': 'Val-d\'Oise'
    };
    
    return departements[dept] ? `${dept} - ${departements[dept]}` : `${dept} - Département ${dept}`;
  }
  
  return 'Code postal non trouvé';
}

function getDepartementStats(restaurants) {
  const stats = {};
  restaurants.forEach(r => {
    const dept = extractDepartement(r.Adresse);
    stats[dept] = (stats[dept] || 0) + 1;
  });
  return stats;
}

const Analyse = ({ restaurants }) => {
  if (!restaurants || restaurants.length === 0) return <div>Aucune donnée à analyser.</div>;
  const top5 = getTop5(restaurants);
  const cuisineStats = getCuisineStats(restaurants);
  const mostPopular = getMostPopularCuisine(cuisineStats);
  const departementStats = getDepartementStats(restaurants);
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
    labels: Object.keys(departementStats),
    datasets: [
      {
        label: 'Nombre de restaurants',
        data: Object.values(departementStats),
        backgroundColor: '#36A2EB',
      },
    ],
  };

  // Trier les départements par nombre de restaurants (décroissant)
  const sortedDepartements = Object.entries(departementStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10); // Top 10 des départements

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
          <h2>📍 Analyse par Département</h2>
          <div style={{ marginBottom: '2rem' }}>
            <h3>Top 10 des départements</h3>
            <div className="departement-list">
              {sortedDepartements.map(([dept, count], index) => (
                <div key={dept} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem',
                  margin: '0.25rem 0',
                  backgroundColor: index < 3 ? '#e3f2fd' : '#f5f5f5',
                  borderRadius: '4px',
                  borderLeft: index < 3 ? '4px solid #2196f3' : '4px solid #ccc'
                }}>
                  <span style={{ fontWeight: index < 3 ? 'bold' : 'normal' }}>
                    {index + 1}. {dept}
                  </span>
                  <span style={{
                    backgroundColor: '#2196f3',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '12px',
                    fontSize: '0.9rem'
                  }}>
                    {count} restaurants
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <h3>Graphique par département</h3>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              <Bar data={barData} options={{
                indexAxis: 'y',
                plugins: { 
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `${context.parsed.x} restaurants`;
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    precision: 0,
                    stepSize: 1,
                    ticks: { stepSize: 1 }
                  },
                  y: {
                    ticks: {
                      font: { size: 10 }
                    }
                  }
                }
              }} />
            </div>
          </div>
          
          <div style={{ marginTop: '2rem', textAlign: 'center', color: '#666' }}>
            <p>📊 Total: {Object.keys(departementStats).length} départements représentés</p>
            <p>🏪 {restaurants.length} restaurants analysés</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyse; 