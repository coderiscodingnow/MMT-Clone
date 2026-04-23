const airportCoordinates = {
  'DEL': { lat: 28.5562, lon: 77.1000 },
  'BOM': { lat: 19.0896, lon: 72.8656 },
  'BLR': { lat: 13.1986, lon: 77.7066 },
  'MAA': { lat: 12.9941, lon: 80.1709 },
  'HYD': { lat: 17.2403, lon: 78.4294 },
  'CCU': { lat: 22.6520, lon: 88.4467 }
};

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; 
}

function getFlightDistance(fromCode, toCode) {
  const fromCoords = airportCoordinates[fromCode];
  const toCoords = airportCoordinates[toCode];
  
  if (fromCoords && toCoords) {
    return calculateDistance(fromCoords.lat, fromCoords.lon, toCoords.lat, toCoords.lon);
  }
  return 1000; 
}

function generateSimulatedPrice(fromCode, toCode) {
  const distance = getFlightDistance(fromCode, toCode);
  
  const base_price = 1500;
  const distance_factor = 2.5; 
  const random_surge = Math.floor(Math.random() * 1500); 
  
  const price = base_price + (distance * distance_factor) + random_surge;
  return Math.round(price);
}

module.exports = { generateSimulatedPrice, getFlightDistance };
