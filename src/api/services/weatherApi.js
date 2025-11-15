// External weather API services
// These are external APIs, so we'll use fetch directly instead of RTK Query

/**
 * Get geocoding data for a city name
 * @param {string} cityName - Name of the city
 * @param {string} countryCode - Country code (default: 'LK' for Sri Lanka)
 * @returns {Promise} Geocoding response with latitude and longitude
 */
export const getCityGeocoding = async (cityName, countryCode = 'LK') => {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=10&language=en&format=json&countryCode=${countryCode}`
    );
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching geocoding:', error);
    throw error;
  }
};

/**
 * Get weather forecast for a location
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {number} forecastDays - Number of forecast days (default: 1)
 * @returns {Promise} Weather forecast response
 */
export const getWeatherForecast = async (latitude, longitude, forecastDays = 1, startDate, endDate) => {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      daily: 'weather_code,temperature_2m_min,temperature_2m_max,sunrise,sunset,rain_sum,showers_sum,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,apparent_temperature_max,apparent_temperature_min',
    });

    if (startDate) {
      params.set('start_date', startDate);
    }

    if (endDate) {
      params.set('end_date', endDate);
    }
    
    // Only include forecast_days when start/end are not provided
    if (!startDate && !endDate) {
      params.set('forecast_days', forecastDays.toString());
    }

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
};

/**
 * Get weather data for a city (combines geocoding and weather)
 * @param {string} cityName - Name of the city
 * @param {number} forecastDays - Number of forecast days (default: 1)
 * @param {string} startDate - Start date for weather forecast (YYYY-MM-DD)
 * @param {string} endDate - End date for weather forecast (YYYY-MM-DD)
 * @returns {Promise} Combined geocoding and weather data
 */
export const getWeatherForCity = async (cityName, forecastDays = 1, startDate, endDate) => {
  try {
    // First get geocoding
    const geocodingData = await getCityGeocoding(cityName);
    
    if (!geocodingData.results || geocodingData.results.length === 0) {
      throw new Error(`No geocoding results found for city: ${cityName}`);
    }

    // Special handling for Kotagala - use specific ID 1239148
    let location;
    if (cityName.toLowerCase() === 'kotagala') {
      const kotagalaResult = geocodingData.results.find(result => result.id === 1239148);
      location = kotagalaResult || geocodingData.results[0]; // Fallback to first if not found
    } else {
      // Use the first result for other cities
      location = geocodingData.results[0];
    }
    
    const { latitude, longitude } = location;

    // Then get weather
    const weatherData = await getWeatherForecast(latitude, longitude, forecastDays, startDate, endDate);

    return {
      city: cityName,
      location,
      weather: weatherData,
    };
  } catch (error) {
    console.error('Error getting weather for city:', error);
    throw error;
  }
};

