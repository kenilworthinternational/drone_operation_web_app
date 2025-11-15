// Estate to City mapping
// This maps estate names to their nearest cities for weather lookup
// Used as fallback when city is not provided in the API response

const estateCityMap = {
  'Pedro': 'Nuwara Eliya',
  'Uda Radella': 'Nuwara Eliya',
  'Robgill': 'Maskeliya',
  'Edinburgh': 'Nanu Oya',
  'Nuwara Eliya': 'Nuwara Eliya',
  'Annfield': 'Hatton',
  'Invery': 'Hatton',
  'Glassaugh': 'Nanu Oya',
  'Batalgalla': 'Hatton',
  'Oliphant': 'Nuwara Eliya',
  'Tillyrie': 'Dickoya',
  'Ingestre': 'Maskeliya',
  'Fordyce': 'Maskeliya',
  'Labookellie': 'Nuwara Eliya',
  'Somerset': 'Nanu Oya',
  'Holyrood': 'Talawakele',
  'Calsay': 'Nanu Oya',
  'Palmeston': 'Hatton',
  'Clarendon': 'Nanu Oya',
  'Dessford': 'Talawakele',
  'Wattagoda': 'Hatton',
  'Bearwell': 'Talawakele',
  'Great Western': 'Talawakele',
  'Logie': 'Talawakele',
  'Mattakelle': 'Talawakele',
  'Vellaioya': 'Maskeliya',
  'Waltrim': 'Lindula',
  'Abbostleiggh': 'Hatton',
  'Dickoya': 'Dickoya',
  'Balmoral': 'Lindula',
  'Dambatenna': 'Haputale',
  'Henfold': 'Hatton',
  'Agarakanda': 'Ginigathena',
  'Tangakelle': 'Lindula',
  'Radella': 'Nanu Oya',
  'Kenilworth': 'Ginigathena',
  'Wigton': 'Kotagala',
  'Ouvahkelle': 'Badulla',
  'Carolina': 'Haputale',
  'Norwood': 'Maskeliya',
  'Nelna Rahathangana': 'Badulla',
  'Telbedde': 'Badulla',
  'Verellapatna': 'Haputale',
  // Note: Ingestre is already mapped above, keeping Ingestry as alias if needed
  'Ingestry': 'Maskeliya', // Alias for Ingestre (if estate name varies)
};

/**
 * Get the nearest city for an estate
 * @param {string} estateName - Name of the estate
 * @returns {string} City name, defaults to estate name if not found
 */
export const getCityForEstate = (estateName) => {
  if (!estateName) return 'Colombo'; // Default fallback
  
  // Check if we have a direct mapping
  if (estateCityMap[estateName]) {
    return estateCityMap[estateName];
  }
  
  // Try case-insensitive match
  const estateKey = Object.keys(estateCityMap).find(
    key => key.toLowerCase() === estateName.toLowerCase()
  );
  
  if (estateKey) {
    return estateCityMap[estateKey];
  }
  
  // If no mapping found, try to extract city from estate name or use estate name
  // This is a fallback - ideally this should come from the backend
  return estateName;
};

/**
 * Add city information to plan data
 * First tries to use city from API response, falls back to mapping if not available
 * @param {Object} plan - Plan object
 * @returns {Object} Plan object with city field added
 */
export const enrichPlanWithCity = (plan) => {
  if (!plan) return plan;
  
  // First, check if city is already in the API response
  let city = plan.city;
  
  // If city is not in API response or is empty, use the mapping
  if (!city || city.trim() === '') {
    city = getCityForEstate(plan.estate);
  }
  
  return {
    ...plan,
    city,
  };
};

export default estateCityMap;

