/**
 * Mausam Weather & Air Quality Dashboard
 * API Client Module - Handles requests to Open-Meteo APIs
 */

const API_CONFIG = {
  WEATHER_URL: 'https://api.open-meteo.com/v1/forecast',
  AIR_QUALITY_URL: 'https://air-quality-api.open-meteo.com/v1/air-quality',
  GEOCODING_URL: 'https://geocoding-api.open-meteo.com/v1/search',
  TIMEOUT_MS: 10000
};

/**
 * Curated list of major Indian cities for instant search suggestions and fallback
 */
export const DEFAULT_INDIAN_CITIES = [
  { name: 'Pune', state: 'Maharashtra', country: 'India', lat: 18.5204, lon: 73.8567 },
  { name: 'Mumbai', state: 'Maharashtra', country: 'India', lat: 19.0760, lon: 72.8777 },
  { name: 'New Delhi', state: 'Delhi', country: 'India', lat: 28.6139, lon: 77.2090 },
  { name: 'Bengaluru', state: 'Karnataka', country: 'India', lat: 12.9716, lon: 77.5946 },
  { name: 'Hyderabad', state: 'Telangana', country: 'India', lat: 17.3850, lon: 78.4867 },
  { name: 'Chennai', state: 'Tamil Nadu', country: 'India', lat: 13.0827, lon: 80.2707 },
  { name: 'Kolkata', state: 'West Bengal', country: 'India', lat: 22.5726, lon: 88.3639 },
  { name: 'Ahmedabad', state: 'Gujarat', country: 'India', lat: 23.0225, lon: 72.5714 },
  { name: 'Jaipur', state: 'Rajasthan', country: 'India', lat: 26.9124, lon: 75.7873 },
  { name: 'Chandigarh', state: 'Punjab', country: 'India', lat: 30.7333, lon: 76.7794 },
  { name: 'Lucknow', state: 'Uttar Pradesh', country: 'India', lat: 26.8467, lon: 80.9462 },
  { name: 'Kochi', state: 'Kerala', country: 'India', lat: 9.9312, lon: 76.2673 },
  { name: 'Nagpur', state: 'Maharashtra', country: 'India', lat: 21.1458, lon: 79.0882 },
  { name: 'Indore', state: 'Madhya Pradesh', country: 'India', lat: 22.7196, lon: 75.8577 },
  { name: 'Bhopal', state: 'Madhya Pradesh', country: 'India', lat: 23.2599, lon: 77.4126 },
  { name: 'Shimla', state: 'Himachal Pradesh', country: 'India', lat: 31.1048, lon: 77.1734 },
  { name: 'Srinagar', state: 'Jammu and Kashmir', country: 'India', lat: 34.0837, lon: 74.7973 },
  { name: 'Varanasi', state: 'Uttar Pradesh', country: 'India', lat: 25.3176, lon: 82.9739 },
  { name: 'Goa', state: 'Goa', country: 'India', lat: 15.4909, lon: 73.8278 },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India', lat: 17.6868, lon: 83.2185 }
];

/**
 * Fetch with timeout and AbortController integration
 */
async function fetchWithTimeout(url, signal = null) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request was aborted or timed out.');
    }
    throw err;
  }
}

/**
 * Fetch 7-day weather forecast, hourly forecast, and current conditions
 */
export async function getWeatherData(latitude, longitude, signal = null) {
  const params = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
      'uv_index'
    ].join(','),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation_probability',
      'weather_code',
      'wind_speed_10m'
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_sum',
      'precipitation_probability_max'
    ].join(','),
    timezone: 'auto',
    forecast_days: '7'
  });

  const url = `${API_CONFIG.WEATHER_URL}?${params.toString()}`;
  return await fetchWithTimeout(url, signal);
}

/**
 * Fetch air quality and pollutant concentration data
 */
export async function getAirQualityData(latitude, longitude, signal = null) {
  const params = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    current: [
      'us_aqi',
      'european_aqi',
      'pm10',
      'pm2_5',
      'carbon_monoxide',
      'nitrogen_dioxide',
      'sulphur_dioxide',
      'ozone'
    ].join(','),
    timezone: 'auto'
  });

  const url = `${API_CONFIG.AIR_QUALITY_URL}?${params.toString()}`;
  return await fetchWithTimeout(url, signal);
}

/**
 * Search locations using Open-Meteo Geocoding API with local Indian city augmentation
 */
export async function searchLocations(query, signal = null) {
  const normalized = (query || '').trim().toLowerCase();
  if (normalized.length < 2) return [];

  // Match local Indian database first
  const localMatches = DEFAULT_INDIAN_CITIES.filter(city =>
    city.name.toLowerCase().includes(normalized) ||
    (city.state && city.state.toLowerCase().includes(normalized))
  ).map(city => ({
    name: city.name,
    admin1: city.state,
    country: city.country,
    country_code: 'IN',
    latitude: city.lat,
    longitude: city.lon,
    isLocalMatch: true
  }));

  try {
    const params = new URLSearchParams({
      name: query.trim(),
      count: '8',
      language: 'en',
      format: 'json'
    });

    const url = `${API_CONFIG.GEOCODING_URL}?${params.toString()}`;
    const data = await fetchWithTimeout(url, signal);

    if (!data || !data.results) {
      return localMatches;
    }

    // Prioritize results from India or matching English query
    const apiResults = data.results.map(item => ({
      name: item.name,
      admin1: item.admin1 || item.admin2 || '',
      country: item.country || 'India',
      country_code: item.country_code || 'IN',
      latitude: item.latitude,
      longitude: item.longitude,
      isLocalMatch: false
    }));

    // Merge unique by approx coords
    const combined = [...localMatches];
    apiResults.forEach(item => {
      const exists = combined.some(c =>
        c.name.toLowerCase() === item.name.toLowerCase() &&
        c.admin1.toLowerCase() === item.admin1.toLowerCase()
      );
      if (!exists) combined.push(item);
    });

    return combined.slice(0, 8);
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    console.warn('Geocoding API network issue, returning local matches:', err);
    return localMatches;
  }
}

/**
 * Find closest curated city or reverse-geocode coordinates
 */
export async function reverseGeocodeLocation(lat, lon) {
  // Check closest in local database
  let closest = null;
  let minDistance = Infinity;

  for (const city of DEFAULT_INDIAN_CITIES) {
    const dist = Math.hypot(city.lat - lat, city.lon - lon);
    if (dist < minDistance) {
      minDistance = dist;
      closest = city;
    }
  }

  // Within ~35km
  if (closest && minDistance < 0.35) {
    return {
      name: closest.name,
      admin1: closest.state,
      country: closest.country,
      latitude: lat,
      longitude: lon
    };
  }

  // Fallback to coordinates label
  return {
    name: closest ? closest.name : 'Current Location',
    admin1: closest ? closest.state : 'Coordinates',
    country: 'India',
    latitude: lat,
    longitude: lon
  };
}
