/**
 * Mausam Weather Dashboard
 * UI Controller & DOM Renderer Module
 */

import { formatTemperature, getUvRiskLevel, getWindDirection } from './weather.js';

export class WeatherUI {
  constructor() {
    this.dom = {
      // Header controls
      liveClock: document.getElementById('live-clock'),
      unitToggleBtn: document.getElementById('unit-toggle-btn'),
      unitLabel: document.getElementById('unit-label'),
      themeToggleBtn: document.getElementById('theme-toggle-btn'),
      refreshBtn: document.getElementById('refresh-btn'),
      geoBtn: document.getElementById('geo-btn'),
      searchInput: document.getElementById('search-input'),
      searchDropdown: document.getElementById('search-dropdown'),
      quickChipsContainer: document.getElementById('quick-chips'),

      // Alert & Status
      statusBanner: document.getElementById('status-banner'),
      statusMessage: document.getElementById('status-message'),
      retryBtn: document.getElementById('retry-btn'),
      lastUpdatedText: document.getElementById('last-updated-text'),

      // Hero Current Weather
      cityName: document.getElementById('city-name'),
      locationCountry: document.getElementById('location-country'),
      localTimeDate: document.getElementById('local-time-date'),
      currentTemp: document.getElementById('current-temp'),
      tempUnitBadge: document.getElementById('temp-unit-badge'),
      weatherDesc: document.getElementById('weather-desc'),
      weatherIcon: document.getElementById('weather-icon'),
      feelsLikeTemp: document.getElementById('feels-like-temp'),
      todayHighLow: document.getElementById('today-high-low'),

      // Metric Cards
      valHumidity: document.getElementById('val-humidity'),
      descHumidity: document.getElementById('desc-humidity'),
      valWind: document.getElementById('val-wind'),
      descWind: document.getElementById('desc-wind'),
      windPointer: document.getElementById('wind-pointer'),
      valUv: document.getElementById('val-uv'),
      badgeUv: document.getElementById('badge-uv'),
      valRainChance: document.getElementById('val-rain-chance'),
      valPressure: document.getElementById('val-pressure'),

      // Hourly Forecast
      hourlyList: document.getElementById('hourly-list'),
      scrollHourlyLeft: document.getElementById('scroll-hourly-left'),
      scrollHourlyRight: document.getElementById('scroll-hourly-right'),

      // 7-Day Forecast
      dailyList: document.getElementById('daily-list'),

      // Sun Tracker
      valSunrise: document.getElementById('val-sunrise'),
      valSunset: document.getElementById('val-sunset'),
      valDaylight: document.getElementById('val-daylight'),
      sunProgressBar: document.getElementById('sun-progress-bar'),

      // Air Quality
      valAqi: document.getElementById('val-aqi'),
      badgeAqi: document.getElementById('badge-aqi'),
      aqiBarFill: document.getElementById('aqi-bar-fill'),
      aqiGuidance: document.getElementById('aqi-guidance'),
      aqiStandardText: document.getElementById('aqi-standard-text'),
      valPm25: document.getElementById('val-pm25'),
      valPm10: document.getElementById('val-pm10'),
      valNo2: document.getElementById('val-no2'),
      valO3: document.getElementById('val-o3'),
      valSo2: document.getElementById('val-so2'),
      valCo: document.getElementById('val-co')
    };
  }

  /**
   * Render Hero Section with current conditions
   */
  renderHero(weather, location, unit = 'C') {
    if (!weather || !weather.current) return;
    const curr = weather.current;

    // City and Region
    if (this.dom.cityName) {
      this.dom.cityName.textContent = location.name;
    }
    if (this.dom.locationCountry) {
      const parts = [location.admin1, location.country].filter(Boolean);
      this.dom.locationCountry.textContent = parts.join(', ') || 'India';
    }

    // Local Date & Time using location timezone
    if (this.dom.localTimeDate) {
      try {
        const now = new Date();
        const dateStr = new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: weather.timezone || 'Asia/Kolkata'
        }).format(now);
        this.dom.localTimeDate.textContent = `${dateStr} (${weather.timezone.replace('_', ' ')})`;
      } catch {
        this.dom.localTimeDate.textContent = new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric'
        });
      }
    }

    // Temperature
    if (this.dom.currentTemp) {
      this.dom.currentTemp.textContent = formatTemperature(curr.temperature, unit);
    }
    if (this.dom.tempUnitBadge) {
      this.dom.tempUnitBadge.textContent = `°${unit}`;
    }

    // Condition & Icon
    if (this.dom.weatherDesc) {
      this.dom.weatherDesc.textContent = curr.description;
    }
    if (this.dom.weatherIcon) {
      this.dom.weatherIcon.innerHTML = curr.iconSvg;
    }

    // Feels like & High/Low
    if (this.dom.feelsLikeTemp) {
      this.dom.feelsLikeTemp.textContent = `${formatTemperature(curr.apparentTemperature, unit)}°${unit}`;
    }
    if (this.dom.todayHighLow) {
      const high = formatTemperature(curr.todayHigh, unit);
      const low = formatTemperature(curr.todayLow, unit);
      this.dom.todayHighLow.textContent = `High ${high}° / Low ${low}°`;
    }
  }

  /**
   * Render Environmental Metrics cards
   */
  renderMetrics(weather, unit = 'C') {
    if (!weather || !weather.current) return;
    const curr = weather.current;

    // Humidity
    if (this.dom.valHumidity) {
      this.dom.valHumidity.textContent = `${Math.round(curr.relativeHumidity)}%`;
    }
    if (this.dom.descHumidity) {
      const h = curr.relativeHumidity;
      if (h > 75) this.dom.descHumidity.textContent = 'High humidity (sticky)';
      else if (h >= 40) this.dom.descHumidity.textContent = 'Comfortable';
      else this.dom.descHumidity.textContent = 'Dry air';
    }

    // Wind
    if (this.dom.valWind) {
      if (unit === 'F') {
        const mph = Math.round(curr.windSpeed * 0.621371);
        this.dom.valWind.textContent = `${mph} mph`;
      } else {
        this.dom.valWind.textContent = `${Math.round(curr.windSpeed)} km/h`;
      }
    }
    if (this.dom.descWind) {
      this.dom.descWind.textContent = getWindDirection(curr.windDirection);
    }
    if (this.dom.windPointer) {
      const deg = curr.windDirection || 0;
      this.dom.windPointer.style.transform = `rotate(${deg}deg)`;
    }

    // UV Index
    const uvRisk = getUvRiskLevel(curr.uvIndex);
    if (this.dom.valUv) {
      this.dom.valUv.textContent = curr.uvIndex !== null ? (Math.round(curr.uvIndex * 10) / 10).toString() : '--';
    }
    if (this.dom.badgeUv) {
      this.dom.badgeUv.textContent = uvRisk.label;
      this.dom.badgeUv.className = `metric-badge ${uvRisk.levelClass}`;
    }

    // Precipitation Probability
    if (this.dom.valRainChance) {
      this.dom.valRainChance.textContent = `${Math.round(curr.precipitationProbability || 0)}%`;
    }

    // Surface Pressure
    if (this.dom.valPressure) {
      this.dom.valPressure.textContent = curr.surfacePressure
        ? `${Math.round(curr.surfacePressure)} hPa`
        : '-- hPa';
    }
  }

  /**
   * Render 24-Hour Forecast Horizontal Carousel
   */
  renderHourly(hourlyEntries, unit = 'C') {
    if (!this.dom.hourlyList) return;
    this.dom.hourlyList.innerHTML = '';

    if (!hourlyEntries || hourlyEntries.length === 0) {
      this.dom.hourlyList.innerHTML = '<div class="empty-state">Hourly forecast unavailable.</div>';
      return;
    }

    const fragment = document.createDocumentFragment();

    hourlyEntries.forEach((entry, idx) => {
      const card = document.createElement('div');
      card.className = `hourly-card ${idx === 0 ? 'is-now' : ''}`;

      const tempStr = formatTemperature(entry.tempCelsius, unit);
      const rainHtml = entry.rainChance > 15
        ? `<span class="hourly-rain-val">${entry.rainChance}% rain</span>`
        : '<span class="hourly-rain-none">0%</span>';

      card.innerHTML = `
        <span class="hourly-time">${this.escapeText(entry.timeLabel)}</span>
        <div class="hourly-icon">${entry.iconSvg}</div>
        <span class="hourly-temp">${tempStr}°</span>
        <div class="hourly-rain-row">${rainHtml}</div>
      `;

      fragment.appendChild(card);
    });

    this.dom.hourlyList.appendChild(fragment);
  }

  /**
   * Render 7-Day Forecast rows
   */
  renderDaily(dailyEntries, unit = 'C') {
    if (!this.dom.dailyList) return;
    this.dom.dailyList.innerHTML = '';

    if (!dailyEntries || dailyEntries.length === 0) {
      this.dom.dailyList.innerHTML = '<div class="empty-state">7-day forecast unavailable.</div>';
      return;
    }

    // Find min and max for range bar
    const validMins = dailyEntries.map(e => e.minCelsius).filter(v => v !== null);
    const validMaxs = dailyEntries.map(e => e.maxCelsius).filter(v => v !== null);
    const minAll = validMins.length ? Math.min(...validMins) : 0;
    const maxAll = validMaxs.length ? Math.max(...validMaxs) : 40;
    const range = Math.max(maxAll - minAll, 1);

    const fragment = document.createDocumentFragment();

    dailyEntries.forEach(entry => {
      const row = document.createElement('div');
      row.className = `daily-row ${entry.dayLabel === 'Today' ? 'is-today' : ''}`;

      const minFormatted = formatTemperature(entry.minCelsius, unit);
      const maxFormatted = formatTemperature(entry.maxCelsius, unit);

      let barLeft = 0;
      let barWidth = 100;
      if (entry.minCelsius !== null && entry.maxCelsius !== null) {
        barLeft = Math.max(0, ((entry.minCelsius - minAll) / range) * 100);
        barWidth = Math.max(8, ((entry.maxCelsius - entry.minCelsius) / range) * 100);
      }

      const rainHtml = entry.rainChance > 20
        ? `<span class="daily-rain-tag">${entry.rainChance}%</span>`
        : '<span class="daily-rain-tag zero">--</span>';

      row.innerHTML = `
        <div class="daily-col-day">
          <span class="daily-day-title">${this.escapeText(entry.dayLabel)}</span>
          <span class="daily-date-sub">${this.escapeText(entry.fullDateLabel)}</span>
        </div>
        <div class="daily-col-condition">
          <div class="daily-row-icon">${entry.iconSvg}</div>
          <span class="daily-cond-text">${this.escapeText(entry.description)}</span>
        </div>
        <div class="daily-col-rain">${rainHtml}</div>
        <div class="daily-col-temps">
          <span class="temp-min">${minFormatted}°</span>
          <div class="temp-bar-bg">
            <div class="temp-bar-fill" style="margin-left: ${barLeft}%; width: ${barWidth}%;"></div>
          </div>
          <span class="temp-max">${maxFormatted}°</span>
        </div>
      `;

      fragment.appendChild(row);
    });

    this.dom.dailyList.appendChild(fragment);
  }

  /**
   * Render Sun and Daylight Tracker
   */
  renderSunTracker(sunData) {
    if (!sunData) return;

    if (this.dom.valSunrise) this.dom.valSunrise.textContent = sunData.sunrise;
    if (this.dom.valSunset) this.dom.valSunset.textContent = sunData.sunset;
    if (this.dom.valDaylight) this.dom.valDaylight.textContent = sunData.daylightDuration;

    if (this.dom.sunProgressBar) {
      const pct = Math.min(Math.max(sunData.progress || 0, 0), 100);
      this.dom.sunProgressBar.style.width = `${pct}%`;
    }
  }

  /**
   * Render Air Quality card with strict attribution
   */
  renderAirQuality(aqi) {
    if (!aqi || aqi.aqiValue === null) {
      if (this.dom.valAqi) this.dom.valAqi.textContent = '--';
      if (this.dom.badgeAqi) {
        this.dom.badgeAqi.textContent = 'Data Unavailable';
        this.dom.badgeAqi.className = 'aqi-badge aqi-unavailable';
      }
      if (this.dom.aqiBarFill) this.dom.aqiBarFill.style.width = '0%';
      if (this.dom.aqiGuidance) {
        this.dom.aqiGuidance.textContent = 'Air quality sensor readings are temporarily unavailable for this coordinate.';
      }
      this.clearPollutants();
      return;
    }

    if (this.dom.valAqi) this.dom.valAqi.textContent = aqi.aqiValue.toString();

    if (this.dom.badgeAqi) {
      this.dom.badgeAqi.textContent = aqi.aqiCategory;
      this.dom.badgeAqi.className = `aqi-badge ${aqi.className}`;
    }

    if (this.dom.aqiBarFill) {
      // 0 - 500 scale
      const pct = Math.min(Math.round((aqi.aqiValue / 500) * 100), 100);
      this.dom.aqiBarFill.style.width = `${pct}%`;
      this.dom.aqiBarFill.style.backgroundColor = aqi.colorHex;
    }

    if (this.dom.aqiGuidance) {
      this.dom.aqiGuidance.textContent = aqi.guidance;
    }

    if (this.dom.aqiStandardText) {
      this.dom.aqiStandardText.textContent = `${aqi.standardName} • Source: ${aqi.dataSource}`;
    }

    // Pollutant breakdown
    const p = aqi.pollutants;
    this.renderPollutant(this.dom.valPm25, p.pm25);
    this.renderPollutant(this.dom.valPm10, p.pm10);
    this.renderPollutant(this.dom.valNo2, p.no2);
    this.renderPollutant(this.dom.valO3, p.o3);
    this.renderPollutant(this.dom.valSo2, p.so2);
    this.renderPollutant(this.dom.valCo, p.co);
  }

  renderPollutant(element, pollutant) {
    if (!element) return;
    if (pollutant && pollutant.isAvailable) {
      element.textContent = `${pollutant.value} ${pollutant.unit}`;
    } else {
      element.textContent = 'N/A';
    }
  }

  clearPollutants() {
    [this.dom.valPm25, this.dom.valPm10, this.dom.valNo2, this.dom.valO3, this.dom.valSo2, this.dom.valCo]
      .forEach(el => { if (el) el.textContent = 'N/A'; });
  }

  /**
   * Render quick Indian cities chips
   */
  renderQuickChips(cities, activeCityName, onSelectCity) {
    if (!this.dom.quickChipsContainer) return;
    this.dom.quickChipsContainer.innerHTML = '';

    const fragment = document.createDocumentFragment();

    cities.forEach(city => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isActive = city.name.toLowerCase() === activeCityName.toLowerCase();
      btn.className = `chip-btn ${isActive ? 'is-active' : ''}`;
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      btn.textContent = city.name;

      btn.addEventListener('click', () => {
        onSelectCity(city);
      });

      fragment.appendChild(btn);
    });

    this.dom.quickChipsContainer.appendChild(fragment);
  }

  /**
   * Render search suggestions
   */
  renderSearchSuggestions(results, onSelectLocation) {
    if (!this.dom.searchDropdown) return;
    this.dom.searchDropdown.innerHTML = '';

    if (!results || results.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'search-empty';
      emptyDiv.textContent = 'No matching locations found in India.';
      this.dom.searchDropdown.appendChild(emptyDiv);
      this.dom.searchDropdown.classList.remove('is-hidden');
      return;
    }

    const fragment = document.createDocumentFragment();

    results.forEach(loc => {
      const item = document.createElement('div');
      item.className = 'search-item';
      item.setAttribute('role', 'option');

      const adminStr = [loc.admin1, loc.country].filter(Boolean).join(', ');

      const infoDiv = document.createElement('div');
      infoDiv.className = 'search-item-info';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'search-name';
      nameSpan.textContent = loc.name || '';

      const subSpan = document.createElement('span');
      subSpan.className = 'search-sub';
      subSpan.textContent = adminStr;

      infoDiv.appendChild(nameSpan);
      infoDiv.appendChild(subSpan);
      item.appendChild(infoDiv);

      if (loc.isLocalMatch) {
        const badgeSpan = document.createElement('span');
        badgeSpan.className = 'search-badge';
        badgeSpan.textContent = 'Verified';
        item.appendChild(badgeSpan);
      }

      item.addEventListener('click', () => {
        this.hideSearchDropdown();
        onSelectLocation(loc);
      });

      fragment.appendChild(item);
    });

    this.dom.searchDropdown.appendChild(fragment);
    this.dom.searchDropdown.classList.remove('is-hidden');
  }

  hideSearchDropdown() {
    if (this.dom.searchDropdown) {
      this.dom.searchDropdown.classList.add('is-hidden');
    }
  }

  /**
   * Show banner notification/error
   */
  showError(message, canRetry = true) {
    if (this.dom.statusBanner) {
      if (this.dom.statusMessage) this.dom.statusMessage.textContent = message;
      if (this.dom.retryBtn) this.dom.retryBtn.style.display = canRetry ? 'inline-flex' : 'none';
      this.dom.statusBanner.classList.remove('is-hidden');
    }
  }

  hideError() {
    if (this.dom.statusBanner) {
      this.dom.statusBanner.classList.add('is-hidden');
    }
  }

  setRefreshing(isRefreshing) {
    if (this.dom.refreshBtn) {
      if (isRefreshing) {
        this.dom.refreshBtn.classList.add('is-spinning');
        this.dom.refreshBtn.setAttribute('aria-busy', 'true');
      } else {
        this.dom.refreshBtn.classList.remove('is-spinning');
        this.dom.refreshBtn.setAttribute('aria-busy', 'false');
      }
    }
  }

  setGeoSpinning(isSpinning) {
    if (this.dom.geoBtn) {
      if (isSpinning) this.dom.geoBtn.classList.add('is-spinning');
      else this.dom.geoBtn.classList.remove('is-spinning');
    }
  }

  updateLastUpdated(date = new Date()) {
    if (this.dom.lastUpdatedText) {
      const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      this.dom.lastUpdatedText.textContent = `Last synchronized at ${timeStr}`;
    }
  }

  updateUnitToggleLabel(unit) {
    if (this.dom.unitLabel) {
      this.dom.unitLabel.textContent = `°${unit}`;
    }
  }

  /**
   * OWASP-compliant HTML string sanitization
   */
  escapeText(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
