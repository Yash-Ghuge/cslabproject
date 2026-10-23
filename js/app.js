/**
 * Mausam (मौसम) - Indian Weather Intelligence App
 * Core Application Logic, UI controller, and event handlers
 */

const AppState = {
  currentCity: {
    name: "Pune",
    state: "Maharashtra",
    lat: 18.5204,
    lon: 73.8567
  },
  weatherData: null,
  airQualityData: null,
  unit: "C", // 'C' or 'F'
  activeHourlyFilter: "24h"
};

// DOM Elements cache
const DOM = {
  themeContainer: document.getElementById("theme-container"),
  liveClock: document.getElementById("live-clock"),
  searchInput: document.getElementById("search-input"),
  searchDropdown: document.getElementById("search-dropdown"),
  searchWrapper: document.getElementById("search-wrapper"),
  geoBtn: document.getElementById("btn-geolocation"),
  unitToggleBtn: document.getElementById("btn-unit-toggle"),
  unitLabel: document.getElementById("unit-label"),
  chipsContainer: document.getElementById("popular-chips"),
  loadingOverlay: document.getElementById("loading-state"),
  errorState: document.getElementById("error-state"),
  errorMessage: document.getElementById("error-message"),
  retryBtn: document.getElementById("retry-btn"),

  // Weather Main Info
  cityName: document.getElementById("city-name"),
  stateCountry: document.getElementById("state-country"),
  currentDate: document.getElementById("current-date"),
  weatherIconLarge: document.getElementById("weather-icon-large"),
  weatherDesc: document.getElementById("weather-desc"),
  weatherHindiDesc: document.getElementById("weather-hindi-desc"),
  currentTemp: document.getElementById("current-temp"),
  tempUnitBadge: document.getElementById("temp-unit-badge"),
  feelsLikeTemp: document.getElementById("feels-like-temp"),
  tempHighLow: document.getElementById("temp-high-low"),

  // Details
  humidityVal: document.getElementById("val-humidity"),
  humidityDesc: document.getElementById("desc-humidity"),
  windVal: document.getElementById("val-wind"),
  windDirectionPointer: document.getElementById("wind-pointer"),
  windDesc: document.getElementById("desc-wind"),
  uvVal: document.getElementById("val-uv"),
  uvDesc: document.getElementById("desc-uv"),
  pressureVal: document.getElementById("val-pressure"),
  rainChanceVal: document.getElementById("val-rain-chance"),

  // AQI Card
  aqiValue: document.getElementById("val-aqi"),
  aqiBadge: document.getElementById("badge-aqi"),
  aqiProgress: document.getElementById("aqi-progress-bar"),
  aqiAdvice: document.getElementById("aqi-advice"),
  pm25Val: document.getElementById("val-pm25"),
  pm10Val: document.getElementById("val-pm10"),
  no2Val: document.getElementById("val-no2"),
  o3Val: document.getElementById("val-o3"),

  // Sun Cycle
  sunriseTime: document.getElementById("val-sunrise"),
  sunsetTime: document.getElementById("val-sunset"),
  daylightDuration: document.getElementById("val-daylight"),
  sunArcIndicator: document.getElementById("sun-arc-indicator"),

  // Lists
  hourlyList: document.getElementById("hourly-forecast-list"),
  dailyList: document.getElementById("daily-forecast-list"),
  btnScrollLeft: document.getElementById("btn-scroll-left"),
  btnScrollRight: document.getElementById("btn-scroll-right")
};

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initClock();
  renderPopularChips();
  setupEventListeners();

  // Load saved city or default to Pune
  const savedCity = localStorage.getItem("mausam_saved_city");
  if (savedCity) {
    try {
      AppState.currentCity = JSON.parse(savedCity);
    } catch (e) {
      console.warn("Could not parse saved city", e);
    }
  }

  const savedUnit = localStorage.getItem("mausam_unit");
  if (savedUnit && (savedUnit === "C" || savedUnit === "F")) {
    AppState.unit = savedUnit;
    updateUnitDisplay();
  }

  loadCityWeather(AppState.currentCity);
});

/* ==========================================================================
   LIVE INDIAN STANDARD TIME (IST) CLOCK
   ========================================================================== */

function initClock() {
  function updateTime() {
    const now = new Date();
    // Format according to Indian time
    const options = {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    };
    if (DOM.liveClock) {
      DOM.liveClock.textContent = now.toLocaleDateString("en-IN", options);
    }
  }
  updateTime();
  setInterval(updateTime, 1000);
}

/* ==========================================================================
   EVENT LISTENERS
   ========================================================================== */

function setupEventListeners() {
  // Unit toggle
  if (DOM.unitToggleBtn) {
    DOM.unitToggleBtn.addEventListener("click", () => {
      AppState.unit = AppState.unit === "C" ? "F" : "C";
      localStorage.setItem("mausam_unit", AppState.unit);
      updateUnitDisplay();
      if (AppState.weatherData) {
        renderAllWeather(AppState.weatherData, AppState.airQualityData);
      }
    });
  }

  // Geolocation button
  if (DOM.geoBtn) {
    DOM.geoBtn.addEventListener("click", handleGeolocation);
  }

  // Search input debounced autocomplete
  let debounceTimeout = null;
  if (DOM.searchInput) {
    DOM.searchInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimeout);
      const query = e.target.value.trim();
      if (query.length < 2) {
        hideDropdown();
        return;
      }
      debounceTimeout = setTimeout(() => {
        handleSearch(query);
      }, 250);
    });

    DOM.searchInput.addEventListener("focus", () => {
      if (DOM.searchInput.value.trim().length >= 2) {
        DOM.searchDropdown.classList.remove("hidden");
      }
    });
  }

  // Close search dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (DOM.searchWrapper && !DOM.searchWrapper.contains(e.target)) {
      hideDropdown();
    }
  });

  // Hourly forecast horizontal scroll buttons
  if (DOM.btnScrollLeft && DOM.hourlyList) {
    DOM.btnScrollLeft.addEventListener("click", () => {
      DOM.hourlyList.scrollBy({ left: -240, behavior: "smooth" });
    });
  }
  if (DOM.btnScrollRight && DOM.hourlyList) {
    DOM.btnScrollRight.addEventListener("click", () => {
      DOM.hourlyList.scrollBy({ left: 240, behavior: "smooth" });
    });
  }

  // Retry button on error
  if (DOM.retryBtn) {
    DOM.retryBtn.addEventListener("click", () => {
      loadCityWeather(AppState.currentCity);
    });
  }
}

function updateUnitDisplay() {
  if (DOM.unitLabel) {
    DOM.unitLabel.textContent = `°${AppState.unit}`;
  }
  if (DOM.tempUnitBadge) {
    DOM.tempUnitBadge.textContent = `°${AppState.unit}`;
  }
}

/* ==========================================================================
   POPULAR INDIAN CITIES QUICK CHIPS
   ========================================================================== */

function renderPopularChips() {
  if (!DOM.chipsContainer) return;
  DOM.chipsContainer.innerHTML = "";

  POPULAR_CHIPS.forEach(cityName => {
    const cityInfo = INDIAN_CITIES.find(c => c.name.toLowerCase() === cityName.toLowerCase());
    if (!cityInfo) return;

    const chip = document.createElement("button");
    chip.className = `city-chip ${AppState.currentCity.name === cityInfo.name ? "active" : ""}`;
    chip.setAttribute("type", "button");
    chip.setAttribute("aria-label", `Show weather for ${cityInfo.name}`);
    chip.innerHTML = `<span class="pin">📍</span> ${cityInfo.name}`;

    chip.addEventListener("click", () => {
      // Highlight active chip
      document.querySelectorAll(".city-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      loadCityWeather(cityInfo);
    });

    DOM.chipsContainer.appendChild(chip);
  });
}

function updateActiveChip(cityName) {
  document.querySelectorAll(".city-chip").forEach(chip => {
    if (chip.textContent.includes(cityName)) {
      chip.classList.add("active");
    } else {
      chip.classList.remove("active");
    }
  });
}

/* ==========================================================================
   SEARCH & AUTOCOMPLETE
   ========================================================================== */

async function handleSearch(query) {
  if (!DOM.searchDropdown) return;

  DOM.searchDropdown.innerHTML = `<div class="search-loading">Searching Indian locations...</div>`;
  DOM.searchDropdown.classList.remove("hidden");

  try {
    const results = await WeatherAPI.searchCities(query);
    if (!results || results.length === 0) {
      DOM.searchDropdown.innerHTML = `<div class="search-empty">No Indian cities found matching "${query}". Try Pune, Mumbai, Delhi, etc.</div>`;
      return;
    }

    DOM.searchDropdown.innerHTML = "";
    results.forEach(city => {
      const item = document.createElement("div");
      item.className = "search-item";
      item.innerHTML = `
        <div class="search-item-main">
          <span class="search-item-pin">📍</span>
          <div>
            <div class="search-city-title">${city.name}</div>
            <div class="search-city-sub">${city.state ? city.state + ", " : ""}India</div>
          </div>
        </div>
        ${city.isLocal ? '<span class="badge-quick">Verified</span>' : ''}
      `;

      item.addEventListener("click", () => {
        DOM.searchInput.value = `${city.name}, ${city.state}`;
        hideDropdown();
        loadCityWeather({
          name: city.name,
          state: city.state,
          lat: city.latitude,
          lon: city.longitude
        });
      });

      DOM.searchDropdown.appendChild(item);
    });
  } catch (err) {
    console.error("Search error:", err);
    DOM.searchDropdown.innerHTML = `<div class="search-empty">Unable to fetch suggestions. Please check connection.</div>`;
  }
}

function hideDropdown() {
  if (DOM.searchDropdown) {
    DOM.searchDropdown.classList.add("hidden");
  }
}

/* ==========================================================================
   GEOLOCATION
   ========================================================================== */

function handleGeolocation() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  DOM.geoBtn.classList.add("spinning");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      DOM.geoBtn.classList.remove("spinning");
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        const locationInfo = await WeatherAPI.reverseGeocode(lat, lon);
        loadCityWeather(locationInfo);
      } catch (e) {
        loadCityWeather({
          name: "My Location",
          state: "India",
          lat: lat,
          lon: lon
        });
      }
    },
    (error) => {
      DOM.geoBtn.classList.remove("spinning");
      let message = "Unable to retrieve your location.";
      if (error.code === error.PERMISSION_DENIED) {
        message = "Location permission was denied. You can still search for any Indian city!";
      }
      alert(message);
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}

/* ==========================================================================
   MAIN DATA LOADER
   ========================================================================== */

async function loadCityWeather(city) {
  AppState.currentCity = city;
  localStorage.setItem("mausam_saved_city", JSON.stringify(city));
  updateActiveChip(city.name);

  // Show loading skeleton
  showLoading();
  hideError();

  try {
    const [forecastData, airQualityData] = await Promise.all([
      WeatherAPI.getForecast(city.lat || city.latitude, city.lon || city.longitude),
      WeatherAPI.getAirQuality(city.lat || city.latitude, city.lon || city.longitude)
    ]);

    AppState.weatherData = forecastData;
    AppState.airQualityData = airQualityData;

    renderAllWeather(forecastData, airQualityData);
    hideLoading();
  } catch (err) {
    console.error("Error loading weather data:", err);
    showError("Could not retrieve weather data. Please check your internet connection and try again.");
    hideLoading();
  }
}

function showLoading() {
  if (DOM.loadingOverlay) DOM.loadingOverlay.classList.remove("hidden");
}

function hideLoading() {
  if (DOM.loadingOverlay) DOM.loadingOverlay.classList.add("hidden");
}

function showError(msg) {
  if (DOM.errorMessage) DOM.errorMessage.textContent = msg;
  if (DOM.errorState) DOM.errorState.classList.remove("hidden");
}

function hideError() {
  if (DOM.errorState) DOM.errorState.classList.add("hidden");
}

/* ==========================================================================
   RENDER METHODS
   ========================================================================== */

function renderAllWeather(weather, aqi) {
  renderHero(weather);
  renderWeatherMetrics(weather);
  renderAirQuality(aqi);
  renderHourlyForecast(weather);
  renderDailyForecast(weather);
  renderSunCycle(weather);
}

/**
 * Render main current weather card & dynamic theme atmosphere
 */
function renderHero(data) {
  const current = data.current;
  const isDay = current.is_day;
  const weatherCode = current.weather_code;
  const weatherInfo = getWeatherInfo(weatherCode, isDay);

  // Apply dynamic atmospheric background theme class to body/container
  if (DOM.themeContainer) {
    DOM.themeContainer.className = `app-wrapper ${weatherInfo.themeClass}`;
  }

  // City & State
  if (DOM.cityName) DOM.cityName.textContent = AppState.currentCity.name;
  if (DOM.stateCountry) {
    const stateStr = AppState.currentCity.state ? `${AppState.currentCity.state}, ` : "";
    DOM.stateCountry.textContent = `${stateStr}India 🇮🇳`;
  }

  // Date
  if (DOM.currentDate) {
    const now = new Date();
    DOM.currentDate.textContent = now.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  // Icon & Condition
  if (DOM.weatherIconLarge) {
    DOM.weatherIconLarge.innerHTML = weatherInfo.icon;
  }
  if (DOM.weatherDesc) DOM.weatherDesc.textContent = weatherInfo.label;
  if (DOM.weatherHindiDesc) DOM.weatherHindiDesc.textContent = weatherInfo.hindiLabel;

  // Temperature
  const currentTempVal = formatTemperature(current.temperature_2m);
  if (DOM.currentTemp) DOM.currentTemp.textContent = currentTempVal;

  // Feels like
  const feelsLikeVal = formatTemperature(current.apparent_temperature);
  if (DOM.feelsLikeTemp) DOM.feelsLikeTemp.textContent = `${feelsLikeVal}°${AppState.unit}`;

  // High / Low for today
  if (data.daily && data.daily.temperature_2m_max && data.daily.temperature_2m_min) {
    const maxT = formatTemperature(data.daily.temperature_2m_max[0]);
    const minT = formatTemperature(data.daily.temperature_2m_min[0]);
    if (DOM.tempHighLow) {
      DOM.tempHighLow.innerHTML = `<span>H: ${maxT}°</span> • <span>L: ${minT}°</span>`;
    }
  }
}

/**
 * Render grid metrics (humidity, wind, UV, pressure, rain probability)
 */
function renderWeatherMetrics(data) {
  const current = data.current;
  const daily = data.daily;

  // Humidity
  if (DOM.humidityVal) DOM.humidityVal.textContent = `${Math.round(current.relative_humidity_2m)}%`;
  if (DOM.humidityDesc) {
    const h = current.relative_humidity_2m;
    if (h > 75) DOM.humidityDesc.textContent = "High (Humid / Sticky)";
    else if (h > 45) DOM.humidityDesc.textContent = "Comfortable";
    else DOM.humidityDesc.textContent = "Dry atmosphere";
  }

  // Wind
  const windSpeed = AppState.unit === "C"
    ? `${Math.round(current.wind_speed_10m)} km/h`
    : `${Math.round(current.wind_speed_10m * 0.621371)} mph`;
  if (DOM.windVal) DOM.windVal.textContent = windSpeed;

  if (DOM.windDirectionPointer) {
    const dir = current.wind_direction_10m || 0;
    DOM.windDirectionPointer.style.transform = `rotate(${dir}deg)`;
  }
  if (DOM.windDesc) {
    DOM.windDesc.textContent = getWindDirectionText(current.wind_direction_10m);
  }

  // UV Index
  const uv = current.uv_index !== undefined ? current.uv_index : (daily.uv_index_max ? daily.uv_index_max[0] : 0);
  if (DOM.uvVal) DOM.uvVal.textContent = Math.round(uv * 10) / 10;
  if (DOM.uvDesc) {
    if (uv <= 2) DOM.uvDesc.textContent = "Low (Safe outdoors)";
    else if (uv <= 5) DOM.uvDesc.textContent = "Moderate (Sunscreen advised)";
    else if (uv <= 7) DOM.uvDesc.textContent = "High (Seek shade midday)";
    else if (uv <= 10) DOM.uvDesc.textContent = "Very High (Wear hat & glasses)";
    else DOM.uvDesc.textContent = "Extreme danger (Stay indoors)";
  }

  // Pressure
  if (DOM.pressureVal) {
    DOM.pressureVal.textContent = `${Math.round(current.surface_pressure || 1013)} hPa`;
  }

  // Rain Probability (from today's daily or next few hours)
  const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 0;
  if (DOM.rainChanceVal) {
    DOM.rainChanceVal.textContent = `${Math.round(rainProb)}%`;
  }
}

/**
 * Render Air Quality Index (AQI) card with Indian context
 */
function renderAirQuality(aqiData) {
  if (!aqiData || !aqiData.current) {
    if (DOM.aqiValue) DOM.aqiValue.textContent = "--";
    if (DOM.aqiBadge) {
      DOM.aqiBadge.textContent = "Data Unavailable";
      DOM.aqiBadge.className = "aqi-badge aqi-unknown";
    }
    if (DOM.aqiAdvice) DOM.aqiAdvice.textContent = "Real-time air sensor data is currently offline for this location.";
    return;
  }

  const curr = aqiData.current;
  const pm25 = curr.pm2_5 || 0;
  const pm10 = curr.pm10 || 0;
  const no2 = curr.nitrogen_dioxide || 0;
  const o3 = curr.ozone || 0;

  // Update pollutant values
  if (DOM.pm25Val) DOM.pm25Val.textContent = `${Math.round(pm25)} µg/m³`;
  if (DOM.pm10Val) DOM.pm10Val.textContent = `${Math.round(pm10)} µg/m³`;
  if (DOM.no2Val) DOM.no2Val.textContent = `${Math.round(no2)} µg/m³`;
  if (DOM.o3Val) DOM.o3Val.textContent = `${Math.round(o3)} µg/m³`;

  // Calculate AQI category based on Central Pollution Control Board (CPCB / Indian Standard) & US AQI
  const aqiNum = Math.round(curr.us_aqi || (pm25 * 3.5)); // approximate US/Indian AQI
  if (DOM.aqiValue) DOM.aqiValue.textContent = aqiNum;

  let category = "Good";
  let badgeClass = "aqi-good";
  let advice = "Air quality is satisfactory and poses little to no health risk. Great day for morning walks!";

  if (aqiNum <= 50) {
    category = "Good (उत्तम)";
    badgeClass = "aqi-good";
    advice = "Air quality is pristine. Ideal conditions for outdoor activities and morning runs across the city.";
  } else if (aqiNum <= 100) {
    category = "Moderate (संतोषजनक)";
    badgeClass = "aqi-moderate";
    advice = "Acceptable air quality. Exceptionally sensitive individuals should monitor outdoor prolonged exertion.";
  } else if (aqiNum <= 150) {
    category = "Unhealthy for Sensitive (मध्यम)";
    badgeClass = "aqi-unhealthy-sensitive";
    advice = "Children, elderly, and people with respiratory or heart conditions should limit prolonged outdoor exertion.";
  } else if (aqiNum <= 200) {
    category = "Poor (खराब)";
    badgeClass = "aqi-poor";
    advice = "General public may experience irritation. Consider wearing an N95 mask during heavy traffic / peak smog.";
  } else if (aqiNum <= 300) {
    category = "Very Poor (बहुत खराब)";
    badgeClass = "aqi-very-poor";
    advice = "Health alert: increased likelihood of respiratory issues. Avoid morning jogging and keep indoor windows closed.";
  } else {
    category = "Severe (गंभीर)";
    badgeClass = "aqi-severe";
    advice = "Emergency conditions: Entire population is at risk. Run air purifiers indoors and avoid stepping outside.";
  }

  if (DOM.aqiBadge) {
    DOM.aqiBadge.textContent = category;
    DOM.aqiBadge.className = `aqi-badge ${badgeClass}`;
  }

  if (DOM.aqiAdvice) {
    DOM.aqiAdvice.textContent = advice;
  }

  // Progress meter percentage (capped at 500)
  if (DOM.aqiProgress) {
    const percent = Math.min(Math.round((aqiNum / 400) * 100), 100);
    DOM.aqiProgress.style.width = `${percent}%`;
  }
}

/**
 * Render 24-Hour Forecast carousel
 */
function renderHourlyForecast(data) {
  if (!DOM.hourlyList || !data.hourly) return;
  DOM.hourlyList.innerHTML = "";

  const hourly = data.hourly;
  const currentIsoHour = new Date().getHours();
  const times = hourly.time;

  // Find index of current hour
  let startIndex = 0;
  for (let i = 0; i < times.length; i++) {
    const itemDate = new Date(times[i]);
    if (itemDate.getHours() === currentIsoHour) {
      startIndex = i;
      break;
    }
  }

  // Slice next 24 hours
  const next24 = times.slice(startIndex, startIndex + 24);

  next24.forEach((timeStr, idx) => {
    const actualIdx = startIndex + idx;
    const timeObj = new Date(timeStr);
    const hour12 = timeObj.toLocaleTimeString("en-IN", { hour: "numeric", hour12: true });
    const isNow = idx === 0;

    const code = hourly.weather_code[actualIdx];
    // Check if hour is between 6am and 7pm for day/night icon
    const hour24 = timeObj.getHours();
    const isDayHour = hour24 >= 6 && hour24 < 19 ? 1 : 0;
    const weatherInfo = getWeatherInfo(code, isDayHour);

    const tempVal = formatTemperature(hourly.temperature_2m[actualIdx]);
    const rainChance = hourly.precipitation_probability ? hourly.precipitation_probability[actualIdx] : 0;

    const card = document.createElement("div");
    card.className = `hourly-card ${isNow ? "is-current-hour" : ""}`;
    card.innerHTML = `
      <div class="hourly-time">${isNow ? "Now" : hour12}</div>
      <div class="hourly-icon">${weatherInfo.icon}</div>
      <div class="hourly-temp">${tempVal}°</div>
      <div class="hourly-rain ${rainChance > 20 ? "has-rain" : ""}">
        <span class="drop">💧</span> ${rainChance}%
      </div>
    `;

    DOM.hourlyList.appendChild(card);
  });
}

/**
 * Render 7-Day Forecast
 */
function renderDailyForecast(data) {
  if (!DOM.dailyList || !data.daily) return;
  DOM.dailyList.innerHTML = "";

  const daily = data.daily;
  const days = daily.time;

  // Find min and max across all 7 days for proportional bar rendering
  const allMins = daily.temperature_2m_min;
  const allMaxs = daily.temperature_2m_max;
  const overallMin = Math.min(...allMins);
  const overallMax = Math.max(...allMaxs);
  const tempRange = Math.max(overallMax - overallMin, 1);

  days.forEach((dateStr, i) => {
    const dateObj = new Date(dateStr + "T00:00:00");
    const isToday = i === 0;
    const dayName = isToday
      ? "Today"
      : dateObj.toLocaleDateString("en-IN", { weekday: "short" });
    const dateFormatted = dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

    const code = daily.weather_code[i];
    const weatherInfo = getWeatherInfo(code, 1);

    const minT = formatTemperature(daily.temperature_2m_min[i]);
    const maxT = formatTemperature(daily.temperature_2m_max[i]);
    const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0;

    // Calculate bar positions
    const barLeft = ((daily.temperature_2m_min[i] - overallMin) / tempRange) * 100;
    const barWidth = ((daily.temperature_2m_max[i] - daily.temperature_2m_min[i]) / tempRange) * 100;

    const row = document.createElement("div");
    row.className = `daily-row ${isToday ? "is-today" : ""}`;
    row.innerHTML = `
      <div class="daily-day-col">
        <span class="day-name">${dayName}</span>
        <span class="day-date">${dateFormatted}</span>
      </div>

      <div class="daily-condition-col">
        <div class="daily-icon">${weatherInfo.icon}</div>
        <span class="daily-condition-label">${weatherInfo.label}</span>
      </div>

      <div class="daily-rain-col">
        ${rainProb > 15 ? `<span class="daily-rain-badge">💧 ${rainProb}%</span>` : `<span class="daily-rain-none">--</span>`}
      </div>

      <div class="daily-temps-col">
        <span class="daily-min">${minT}°</span>
        <div class="daily-temp-bar-wrapper">
          <div class="daily-temp-bar" style="margin-left: ${barLeft}%; width: ${Math.max(barWidth, 8)}%;"></div>
        </div>
        <span class="daily-max">${maxT}°</span>
      </div>
    `;

    DOM.dailyList.appendChild(row);
  });
}

/**
 * Render Sunrise, Sunset and Daylight progression
 */
function renderSunCycle(data) {
  if (!data.daily || !data.daily.sunrise || !data.daily.sunset) return;

  const sunriseIso = data.daily.sunrise[0];
  const sunsetIso = data.daily.sunset[0];

  const sunriseDate = new Date(sunriseIso);
  const sunsetDate = new Date(sunsetIso);

  const formatOpts = { hour: "numeric", minute: "2-digit", hour12: true };
  if (DOM.sunriseTime) DOM.sunriseTime.textContent = sunriseDate.toLocaleTimeString("en-IN", formatOpts);
  if (DOM.sunsetTime) DOM.sunsetTime.textContent = sunsetDate.toLocaleTimeString("en-IN", formatOpts);

  // Daylight duration
  const diffMs = sunsetDate - sunriseDate;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (DOM.daylightDuration) {
    DOM.daylightDuration.textContent = `${diffHours}h ${diffMins}m of sunlight`;
  }

  // Calculate sun progression %
  const now = new Date();
  let progress = 0;
  if (now > sunriseDate && now < sunsetDate) {
    progress = ((now - sunriseDate) / diffMs) * 100;
  } else if (now >= sunsetDate) {
    progress = 100;
  }

  if (DOM.sunArcIndicator) {
    DOM.sunArcIndicator.style.left = `${Math.min(Math.max(progress, 0), 100)}%`;
  }
}

/* ==========================================================================
   UTILITY HELPERS
   ========================================================================== */

function formatTemperature(celsiusVal) {
  if (celsiusVal === undefined || celsiusVal === null) return "--";
  if (AppState.unit === "F") {
    return Math.round((celsiusVal * 9) / 5 + 32);
  }
  return Math.round(celsiusVal);
}

function getWindDirectionText(deg) {
  if (deg === undefined) return "";
  const directions = [
    "North (N)", "North-East (NE)", "East (E)", "South-East (SE)",
    "South (S)", "South-West (SW)", "West (W)", "North-West (NW)"
  ];
  const index = Math.round((deg % 360) / 45) % 8;
  return directions[index];
}
