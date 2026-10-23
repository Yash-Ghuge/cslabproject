/**
 * API service for fetching forecast and air quality data using Open-Meteo.
 * Free, open, no secret keys required, completely client-side compatible.
 */

const WeatherAPI = {
  FORECAST_BASE_URL: "https://api.open-meteo.com/v1/forecast",
  AIR_QUALITY_BASE_URL: "https://air-quality-api.open-meteo.com/v1/air-quality",
  GEOCODING_BASE_URL: "https://geocoding-api.open-meteo.com/v1/search",

  /**
   * Fetches full forecast for given latitude and longitude.
   */
  async getForecast(lat, lon) {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "is_day",
        "precipitation",
        "weather_code",
        "surface_pressure",
        "wind_speed_10m",
        "wind_direction_10m",
        "uv_index"
      ].join(","),
      hourly: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "precipitation_probability",
        "weather_code",
        "wind_speed_10m"
      ].join(","),
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "apparent_temperature_max",
        "apparent_temperature_min",
        "sunrise",
        "sunset",
        "uv_index_max",
        "precipitation_sum",
        "precipitation_probability_max"
      ].join(","),
      timezone: "auto",
      forecast_days: 7
    });

    const response = await fetch(`${this.FORECAST_BASE_URL}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }
    return await response.json();
  },

  /**
   * Fetches Air Quality data (PM2.5, PM10, AQI, Ozone, NO2)
   */
  async getAirQuality(lat, lon) {
    try {
      const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current: [
          "european_aqi",
          "us_aqi",
          "pm10",
          "pm2_5",
          "carbon_monoxide",
          "nitrogen_dioxide",
          "sulphur_dioxide",
          "ozone"
        ].join(","),
        timezone: "auto"
      });

      const response = await fetch(`${this.AIR_QUALITY_BASE_URL}?${params.toString()}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (err) {
      console.warn("Air quality data not available:", err);
      return null;
    }
  },

  /**
   * Searches for Indian cities matching query.
   * Merges local curated Indian cities with Geocoding API results.
   */
  async searchCities(query) {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed || trimmed.length < 2) return [];

    // Filter local curated database first
    const localMatches = INDIAN_CITIES.filter(city =>
      city.name.toLowerCase().includes(trimmed) ||
      city.state.toLowerCase().includes(trimmed)
    ).map(city => ({
      name: city.name,
      state: city.state,
      country: "India",
      country_code: "IN",
      latitude: city.lat,
      longitude: city.lon,
      isLocal: true
    }));

    // If local matches already high quality, can return or supplement with API
    try {
      const url = `${this.GEOCODING_BASE_URL}?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
      const res = await fetch(url);
      if (!res.ok) return localMatches;

      const data = await res.json();
      if (!data.results) return localMatches;

      // Filter and prioritize Indian locations
      const apiResults = data.results
        .filter(item => item.country_code === "IN" || (item.country && item.country.toLowerCase() === "india"))
        .map(item => ({
          name: item.name,
          state: item.admin1 || item.admin2 || "India",
          country: "India",
          country_code: "IN",
          latitude: item.latitude,
          longitude: item.longitude,
          isLocal: false
        }));

      // Combine unique by approximate coordinates
      const combined = [...localMatches];
      apiResults.forEach(item => {
        const exists = combined.some(c =>
          c.name.toLowerCase() === item.name.toLowerCase() &&
          c.state.toLowerCase() === item.state.toLowerCase()
        );
        if (!exists) combined.push(item);
      });

      return combined.slice(0, 8);
    } catch (err) {
      console.warn("Geocoding API network issue, fallback to local:", err);
      return localMatches;
    }
  },

  /**
   * Reverse geocodes coordinates to city name if user enables geolocation
   */
  async reverseGeocode(lat, lon) {
    try {
      // Find closest in local Indian cities
      let closest = null;
      let minDistance = Infinity;

      for (const city of INDIAN_CITIES) {
        const d = Math.hypot(city.lat - lat, city.lon - lon);
        if (d < minDistance) {
          minDistance = d;
          closest = city;
        }
      }

      // If within approx 40km, return local city
      if (closest && minDistance < 0.4) {
        return {
          name: closest.name,
          state: closest.state,
          country: "India",
          latitude: lat,
          longitude: lon
        };
      }

      // Otherwise query reverse geocoding via Open-Meteo or BigDataCloud client API
      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
      if (res.ok) {
        const data = await res.json();
        return {
          name: data.locality || data.city || data.principalSubdivision || "Your Location",
          state: data.principalSubdivision || "India",
          country: data.countryName || "India",
          latitude: lat,
          longitude: lon
        };
      }
    } catch (e) {
      console.warn("Reverse geocode fallback", e);
    }

    return {
      name: "My Location",
      state: "India",
      country: "India",
      latitude: lat,
      longitude: lon
    };
  }
};
