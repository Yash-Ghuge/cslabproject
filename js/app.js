/**
 * Mausam Weather & Air Quality Dashboard
 * Main Application Orchestrator (ES Module)
 */

import {
  getWeatherData,
  getAirQualityData,
  searchLocations,
  reverseGeocodeLocation,
  DEFAULT_INDIAN_CITIES
} from './api.js';
import { normalizeWeatherData } from './weather.js';
import { normalizeAirQualityData } from './air-quality.js';
import { WeatherUI } from './ui.js';

class WeatherApp {
  constructor() {
    this.ui = new WeatherUI();

    // Default to Pune, Maharashtra
    this.state = {
      location: {
        name: 'Pune',
        admin1: 'Maharashtra',
        country: 'India',
        latitude: 18.5204,
        longitude: 73.8567
      },
      weatherData: null,
      airQualityData: null,
      unit: localStorage.getItem('mausam_unit') === 'F' ? 'F' : 'C',
      theme: localStorage.getItem('mausam_theme') === 'light' ? 'light' : 'dark',
      abortController: null,
      isFetching: false
    };

    this.debounceTimer = null;
  }

  /**
   * Application bootstrap
   */
  async init() {
    this.applyTheme(this.state.theme);
    this.ui.updateUnitToggleLabel(this.state.unit);
    this.startLiveClock();
    this.bindEvents();

    // Load and validate saved location with strict schema checks
    const savedLoc = localStorage.getItem('mausam_location');
    if (savedLoc) {
      try {
        const parsed = JSON.parse(savedLoc);
        if (
          parsed &&
          typeof parsed === 'object' &&
          typeof parsed.name === 'string' &&
          Number.isFinite(Number(parsed.latitude)) &&
          Number.isFinite(Number(parsed.longitude))
        ) {
          const lat = Number(parsed.latitude);
          const lon = Number(parsed.longitude);
          if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
            this.state.location = {
              name: String(parsed.name).slice(0, 80),
              admin1: typeof parsed.admin1 === 'string' ? parsed.admin1.slice(0, 80) : '',
              country: typeof parsed.country === 'string' ? parsed.country.slice(0, 80) : 'India',
              latitude: lat,
              longitude: lon
            };
          }
        }
      } catch (e) {
        console.warn('Could not parse stored location', e);
      }
    }

    this.renderChips();
    await this.loadLocationData(this.state.location);
  }

  /**
   * Load Weather and Air Quality data concurrently with race-condition prevention
   */
  async loadLocationData(location) {
    // Cancel any ongoing fetch to avoid race condition
    if (this.state.abortController) {
      this.state.abortController.abort();
    }
    this.state.abortController = new AbortController();
    const signal = this.state.abortController.signal;

    this.state.location = location;
    this.state.isFetching = true;
    this.ui.setRefreshing(true);
    this.ui.hideError();

    // Persist location
    localStorage.setItem('mausam_location', JSON.stringify(location));
    this.renderChips();

    try {
      const lat = location.latitude;
      const lon = location.longitude;

      // Independent requests using Promise.allSettled
      const [weatherResult, aqiResult] = await Promise.allSettled([
        getWeatherData(lat, lon, signal),
        getAirQualityData(lat, lon, signal)
      ]);

      // Handle Weather Result
      if (weatherResult.status === 'fulfilled' && weatherResult.value) {
        this.state.weatherData = normalizeWeatherData(weatherResult.value);
        this.ui.renderHero(this.state.weatherData, this.state.location, this.state.unit);
        this.ui.renderMetrics(this.state.weatherData, this.state.unit);
        this.ui.renderHourly(this.state.weatherData.hourly, this.state.unit);
        this.ui.renderDaily(this.state.weatherData.daily, this.state.unit);
        this.ui.renderSunTracker(this.state.weatherData.sun);
        this.ui.updateLastUpdated(new Date());
      } else if (weatherResult.status === 'rejected') {
        const err = weatherResult.reason;
        if (err.name !== 'AbortError') {
          console.error('Weather data request failed:', err);
          this.ui.showError('Unable to load weather forecast. Please check your network and click Retry.');
        }
      }

      // Handle Air Quality Result independently (doesn't fail weather if AQI is missing)
      if (aqiResult.status === 'fulfilled' && aqiResult.value) {
        this.state.airQualityData = normalizeAirQualityData(aqiResult.value);
        this.ui.renderAirQuality(this.state.airQualityData);
      } else {
        this.state.airQualityData = null;
        this.ui.renderAirQuality(null);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Data loading error:', err);
        this.ui.showError('An unexpected network error occurred.');
      }
    } finally {
      this.state.isFetching = false;
      this.ui.setRefreshing(false);
    }
  }

  /**
   * Event bindings
   */
  bindEvents() {
    // Unit Toggle
    if (this.ui.dom.unitToggleBtn) {
      this.ui.dom.unitToggleBtn.addEventListener('click', () => {
        this.state.unit = this.state.unit === 'C' ? 'F' : 'C';
        localStorage.setItem('mausam_unit', this.state.unit);
        this.ui.updateUnitToggleLabel(this.state.unit);

        // Re-render without re-fetching
        if (this.state.weatherData) {
          this.ui.renderHero(this.state.weatherData, this.state.location, this.state.unit);
          this.ui.renderMetrics(this.state.weatherData, this.state.unit);
          this.ui.renderHourly(this.state.weatherData.hourly, this.state.unit);
          this.ui.renderDaily(this.state.weatherData.daily, this.state.unit);
        }
      });
    }

    // Theme Toggle (Light / Dark)
    if (this.ui.dom.themeToggleBtn) {
      this.ui.dom.themeToggleBtn.addEventListener('click', () => {
        const newTheme = this.state.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
      });
    }

    // Refresh Button
    if (this.ui.dom.refreshBtn) {
      this.ui.dom.refreshBtn.addEventListener('click', () => {
        if (!this.state.isFetching) {
          this.loadLocationData(this.state.location);
        }
      });
    }

    // Retry Button on error banner
    if (this.ui.dom.retryBtn) {
      this.ui.dom.retryBtn.addEventListener('click', () => {
        this.loadLocationData(this.state.location);
      });
    }

    // Geolocation detection
    if (this.ui.dom.geoBtn) {
      this.ui.dom.geoBtn.addEventListener('click', () => this.handleGeolocation());
    }

    // Debounced Search Input
    if (this.ui.dom.searchInput) {
      this.ui.dom.searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        clearTimeout(this.debounceTimer);

        if (query.length < 2) {
          this.ui.hideSearchDropdown();
          return;
        }

        this.debounceTimer = setTimeout(async () => {
          try {
            const results = await searchLocations(query);
            this.ui.renderSearchSuggestions(results, (selected) => {
              this.ui.dom.searchInput.value = selected.name;
              this.loadLocationData({
                name: selected.name,
                admin1: selected.admin1,
                country: selected.country,
                latitude: selected.latitude,
                longitude: selected.longitude
              });
            });
          } catch (err) {
            console.warn('Search query failed:', err);
          }
        }, 250);
      });

      // Submit on Enter key
      this.ui.dom.searchInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const query = this.ui.dom.searchInput.value.trim();
          if (query.length >= 2) {
            try {
              const results = await searchLocations(query);
              if (results && results.length > 0) {
                const first = results[0];
                this.ui.hideSearchDropdown();
                this.loadLocationData({
                  name: first.name,
                  admin1: first.admin1,
                  country: first.country,
                  latitude: first.latitude,
                  longitude: first.longitude
                });
              }
            } catch (err) {
              console.warn('Enter search failed:', err);
            }
          }
        } else if (e.key === 'Escape') {
          this.ui.hideSearchDropdown();
        }
      });
    }

    // Close search dropdown on click outside
    document.addEventListener('click', (e) => {
      const isInside = e.target.closest('#search-wrapper');
      if (!isInside) {
        this.ui.hideSearchDropdown();
      }
    });

    // Hourly horizontal scroll controls
    if (this.ui.dom.scrollHourlyLeft && this.ui.dom.hourlyList) {
      this.ui.dom.scrollHourlyLeft.addEventListener('click', () => {
        this.ui.dom.hourlyList.scrollBy({ left: -260, behavior: 'smooth' });
      });
    }
    if (this.ui.dom.scrollHourlyRight && this.ui.dom.hourlyList) {
      this.ui.dom.scrollHourlyRight.addEventListener('click', () => {
        this.ui.dom.hourlyList.scrollBy({ left: 260, behavior: 'smooth' });
      });
    }
  }

  /**
   * Handle user-initiated GPS Geolocation
   */
  handleGeolocation() {
    if (!navigator.geolocation) {
      this.ui.showError('Geolocation is not supported by your browser.', false);
      return;
    }

    this.ui.setGeoSpinning(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        this.ui.setGeoSpinning(false);
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        try {
          const loc = await reverseGeocodeLocation(lat, lon);
          this.loadLocationData(loc);
        } catch {
          this.loadLocationData({
            name: 'My Location',
            admin1: 'India',
            country: 'India',
            latitude: lat,
            longitude: lon
          });
        }
      },
      (error) => {
        this.ui.setGeoSpinning(false);
        let msg = 'Could not retrieve your GPS position.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can still search for any city in India.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please try again.';
        }
        this.ui.showError(msg, false);
      },
      { timeout: 9000, enableHighAccuracy: true }
    );
  }

  /**
   * Render popular city chips
   */
  renderChips() {
    const popularList = DEFAULT_INDIAN_CITIES.slice(0, 10);
    this.ui.renderQuickChips(popularList, this.state.location.name, (selectedCity) => {
      this.loadLocationData({
        name: selectedCity.name,
        admin1: selectedCity.state,
        country: selectedCity.country,
        latitude: selectedCity.lat,
        longitude: selectedCity.lon
      });
    });
  }

  /**
   * Theme switcher with strict value whitelist
   */
  applyTheme(theme) {
    const safeTheme = theme === 'light' ? 'light' : 'dark';
    this.state.theme = safeTheme;
    localStorage.setItem('mausam_theme', safeTheme);
    document.documentElement.setAttribute('data-theme', safeTheme);

    if (this.ui.dom.themeToggleBtn) {
      const nextTheme = safeTheme === 'light' ? 'dark' : 'light';
      this.ui.dom.themeToggleBtn.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
      this.ui.dom.themeToggleBtn.title = `Switch to ${nextTheme} theme`;
    }
  }

  /**
   * Header live clock in IST
   */
  startLiveClock() {
    const update = () => {
      if (!this.ui.dom.liveClock) return;
      const now = new Date();
      this.ui.dom.liveClock.textContent = new Intl.DateTimeFormat('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      }).format(now) + ' IST';
    };
    update();
    setInterval(update, 1000);
  }
}

// Start application
document.addEventListener('DOMContentLoaded', () => {
  const app = new WeatherApp();
  app.init();
});
