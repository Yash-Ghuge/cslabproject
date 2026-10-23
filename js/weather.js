/**
 * Mausam Weather Dashboard
 * Weather Data Processor & SVG Icon Generator
 */

/**
 * Standard WMO Weather Interpretation Codes (WMO 4677)
 * Maps numerical code to English description and clean SVG representation.
 */
export function getWeatherInterpretation(code, isDay = 1) {
  const isDaytime = Boolean(isDay);

  switch (code) {
    case 0:
      return {
        description: isDaytime ? 'Clear Sky' : 'Clear Night',
        icon: isDaytime ? getClearSunIcon() : getClearMoonIcon(),
        conditionClass: isDaytime ? 'cond-clear' : 'cond-night'
      };
    case 1:
      return {
        description: isDaytime ? 'Mainly Clear' : 'Mainly Clear Night',
        icon: isDaytime ? getClearSunIcon() : getClearMoonIcon(),
        conditionClass: isDaytime ? 'cond-clear' : 'cond-night'
      };
    case 2:
      return {
        description: isDaytime ? 'Partly Cloudy' : 'Partly Cloudy Night',
        icon: isDaytime ? getPartlyCloudySunIcon() : getPartlyCloudyMoonIcon(),
        conditionClass: 'cond-cloudy'
      };
    case 3:
      return {
        description: 'Overcast',
        icon: getOvercastIcon(),
        conditionClass: 'cond-overcast'
      };
    case 45:
    case 48:
      return {
        description: 'Fog and Mist',
        icon: getFogIcon(),
        conditionClass: 'cond-fog'
      };
    case 51:
    case 53:
    case 55:
      return {
        description: 'Light Drizzle',
        icon: getDrizzleIcon(),
        conditionClass: 'cond-rain'
      };
    case 56:
    case 57:
      return {
        description: 'Freezing Drizzle',
        icon: getDrizzleIcon(),
        conditionClass: 'cond-snow'
      };
    case 61:
    case 63:
      return {
        description: 'Rain',
        icon: getRainIcon(),
        conditionClass: 'cond-rain'
      };
    case 65:
    case 80:
    case 81:
    case 82:
      return {
        description: 'Heavy Rain',
        icon: getHeavyRainIcon(),
        conditionClass: 'cond-heavy-rain'
      };
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return {
        description: 'Snow',
        icon: getSnowIcon(),
        conditionClass: 'cond-snow'
      };
    case 95:
    case 96:
    case 99:
      return {
        description: 'Thunderstorm',
        icon: getThunderstormIcon(),
        conditionClass: 'cond-thunder'
      };
    default:
      return {
        description: 'Scattered Clouds',
        icon: getPartlyCloudySunIcon(),
        conditionClass: 'cond-cloudy'
      };
  }
}

/**
 * Format temperature based on selected unit ('C' or 'F')
 */
export function formatTemperature(celsius, unit = 'C') {
  if (celsius === null || celsius === undefined || Number.isNaN(Number(celsius))) {
    return '--';
  }
  const val = Number(celsius);
  if (unit === 'F') {
    return Math.round((val * 9) / 5 + 32);
  }
  return Math.round(val);
}

/**
 * Map wind bearing degrees to cardinal direction
 */
export function getWindDirection(degrees) {
  if (degrees === null || degrees === undefined || Number.isNaN(Number(degrees))) {
    return 'N/A';
  }
  const directions = [
    'North (N)',
    'North-East (NE)',
    'East (E)',
    'South-East (SE)',
    'South (S)',
    'South-West (SW)',
    'West (W)',
    'North-West (NW)'
  ];
  const idx = Math.round((degrees % 360) / 45) % 8;
  return directions[idx];
}

/**
 * Get UV Index risk description
 */
export function getUvRiskLevel(uvIndex) {
  if (uvIndex === null || uvIndex === undefined) return { label: 'Unknown', levelClass: 'uv-low' };
  const uv = Number(uvIndex);
  if (uv <= 2) return { label: 'Low', advice: 'Safe outdoors', levelClass: 'uv-low' };
  if (uv <= 5) return { label: 'Moderate', advice: 'Sunscreen advised', levelClass: 'uv-mod' };
  if (uv <= 7) return { label: 'High', advice: 'Seek shade during midday', levelClass: 'uv-high' };
  if (uv <= 10) return { label: 'Very High', advice: 'Wear hat and eye protection', levelClass: 'uv-very-high' };
  return { label: 'Extreme', advice: 'Avoid direct midday sun', levelClass: 'uv-extreme' };
}

/**
 * Normalize Open-Meteo weather response
 */
export function normalizeWeatherData(raw) {
  if (!raw || !raw.current) {
    throw new Error('Invalid weather data structure received.');
  }

  const current = raw.current;
  const daily = raw.daily || {};
  const hourly = raw.hourly || {};
  const timezone = raw.timezone || 'Asia/Kolkata';

  const isDay = current.is_day !== undefined ? current.is_day : 1;
  const weatherCode = current.weather_code !== undefined ? current.weather_code : 0;
  const interpretation = getWeatherInterpretation(weatherCode, isDay);

  // Parse Hourly Forecast (next 24 hours starting from current hour)
  const hourlyEntries = [];
  if (hourly.time && Array.isArray(hourly.time)) {
    const now = new Date();
    let startIdx = 0;

    for (let i = 0; i < hourly.time.length; i++) {
      const entryDate = new Date(hourly.time[i]);
      if (entryDate >= now) {
        startIdx = i;
        break;
      }
    }

    const sliceTimes = hourly.time.slice(startIdx, startIdx + 24);
    sliceTimes.forEach((timeStr, idx) => {
      const realIdx = startIdx + idx;
      const dateObj = new Date(timeStr);
      const hourCode = hourly.weather_code ? hourly.weather_code[realIdx] : 0;
      const hourNum = dateObj.getHours();
      const hourIsDay = hourNum >= 6 && hourNum < 19 ? 1 : 0;
      const hourInterp = getWeatherInterpretation(hourCode, hourIsDay);

      hourlyEntries.push({
        timeIso: timeStr,
        dateObj,
        timeLabel: idx === 0 ? 'Now' : formatTimeWithTimezone(dateObj, timezone),
        tempCelsius: hourly.temperature_2m ? hourly.temperature_2m[realIdx] : null,
        rainChance: hourly.precipitation_probability ? hourly.precipitation_probability[realIdx] : 0,
        weatherCode: hourCode,
        description: hourInterp.description,
        iconSvg: hourInterp.icon
      });
    });
  }

  // Parse 7-Day Forecast
  const dailyEntries = [];
  if (daily.time && Array.isArray(daily.time)) {
    daily.time.forEach((dateStr, i) => {
      const dateObj = new Date(`${dateStr}T00:00:00`);
      const dayCode = daily.weather_code ? daily.weather_code[i] : 0;
      const dayInterp = getWeatherInterpretation(dayCode, 1);

      dailyEntries.push({
        dateStr,
        dateObj,
        dayLabel: i === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short', timeZone: timezone }),
        fullDateLabel: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: timezone }),
        minCelsius: daily.temperature_2m_min ? daily.temperature_2m_min[i] : null,
        maxCelsius: daily.temperature_2m_max ? daily.temperature_2m_max[i] : null,
        rainChance: daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0,
        weatherCode: dayCode,
        description: dayInterp.description,
        iconSvg: dayInterp.icon
      });
    });
  }

  // Sunrise and Sunset
  let sunriseStr = '--:--';
  let sunsetStr = '--:--';
  let daylightHours = '';
  let daylightProgress = 0;

  if (daily.sunrise && daily.sunrise[0] && daily.sunset && daily.sunset[0]) {
    const sunriseDate = new Date(daily.sunrise[0]);
    const sunsetDate = new Date(daily.sunset[0]);

    sunriseStr = formatTimeWithTimezone(sunriseDate, timezone);
    sunsetStr = formatTimeWithTimezone(sunsetDate, timezone);

    const diffMs = sunsetDate.getTime() - sunriseDate.getTime();
    if (diffMs > 0) {
      const h = Math.floor(diffMs / (1000 * 60 * 60));
      const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      daylightHours = `${h}h ${m}m of daylight`;

      const nowTime = new Date().getTime();
      if (nowTime <= sunriseDate.getTime()) {
        daylightProgress = 0;
      } else if (nowTime >= sunsetDate.getTime()) {
        daylightProgress = 100;
      } else {
        daylightProgress = Math.round(((nowTime - sunriseDate.getTime()) / diffMs) * 100);
      }
    }
  }

  return {
    timezone,
    current: {
      temperature: current.temperature_2m,
      apparentTemperature: current.apparent_temperature,
      relativeHumidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      windDirection: current.wind_direction_10m,
      surfacePressure: current.surface_pressure,
      uvIndex: current.uv_index !== undefined ? current.uv_index : (daily.uv_index_max ? daily.uv_index_max[0] : null),
      precipitationProbability: daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 0,
      weatherCode,
      isDay,
      description: interpretation.description,
      iconSvg: interpretation.icon,
      conditionClass: interpretation.conditionClass,
      todayHigh: daily.temperature_2m_max ? daily.temperature_2m_max[0] : null,
      todayLow: daily.temperature_2m_min ? daily.temperature_2m_min[0] : null
    },
    hourly: hourlyEntries,
    daily: dailyEntries,
    sun: {
      sunrise: sunriseStr,
      sunset: sunsetStr,
      daylightDuration: daylightHours,
      progress: daylightProgress
    }
  };
}

function formatTimeWithTimezone(date, timezone) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone
    }).format(date);
  } catch {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
}

/* ==========================================================================
   MINIMAL, CRISP SVG WEATHER ICONS
   ========================================================================== */

function getClearSunIcon() {
  return `
    <svg viewBox="0 0 48 48" class="weather-icon-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="10" fill="#F59E0B"/>
      <g stroke="#D97706" stroke-width="2.5" stroke-linecap="round">
        <line x1="24" y1="5" x2="24" y2="9"/>
        <line x1="24" y1="39" x2="24" y2="43"/>
        <line x1="5" y1="24" x2="9" y2="24"/>
        <line x1="39" y1="24" x2="43" y2="24"/>
        <line x1="10.5" y1="10.5" x2="13.5" y2="13.5"/>
        <line x1="34.5" y1="34.5" x2="37.5" y2="37.5"/>
        <line x1="10.5" y1="37.5" x2="13.5" y2="34.5"/>
        <line x1="34.5" y1="13.5" x2="37.5" y2="10.5"/>
      </g>
    </svg>
  `;
}

function getClearMoonIcon() {
  return `
    <svg viewBox="0 0 48 48" class="weather-icon-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Crescent Moon -->
      <path d="M 26 7 A 17 17 0 1 0 26 41 A 21 21 0 0 1 26 7 Z" fill="#FBBF24" stroke="#F59E0B" stroke-width="1.5" stroke-linejoin="round"/>
      <!-- Sparkling Stars -->
      <path d="M 37 9 Q 37 13 41 13 Q 37 13 37 17 Q 37 13 33 13 Q 37 13 37 9 Z" fill="#FDE047"/>
      <path d="M 41 26 Q 41 29 44 29 Q 41 29 41 32 Q 41 29 38 29 Q 41 29 41 26 Z" fill="#FDE047" opacity="0.9"/>
      <path d="M 32 23 Q 32 24.5 33.5 24.5 Q 32 24.5 32 26 Q 32 24.5 30.5 24.5 Q 32 24.5 32 23 Z" fill="#FEF08A" opacity="0.8"/>
    </svg>
  `;
}

function getPartlyCloudySunIcon() {
  return `
    <svg viewBox="0 0 48 48" class="weather-icon-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="19" cy="18" r="8" fill="#F59E0B"/>
      <path d="M34 38H16C12.13 38 9 34.87 9 31C9 27.35 11.79 24.36 15.33 24.04C16.48 19.2 20.79 15.6 25.94 15.6C31.96 15.6 36.89 20.28 37.25 26.23C40.28 26.96 42.6 29.66 42.6 32.93C42.6 36.68 39.52 38 34 38Z" fill="#CBD5E1"/>
    </svg>
  `;
}

function getPartlyCloudyMoonIcon() {
  return `
    <svg viewBox="0 0 48 48" class="weather-icon-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Crescent Moon behind cloud -->
      <path d="M 21 9 A 8 8 0 1 0 21 25 A 10 10 0 0 1 21 9 Z" fill="#FBBF24" stroke="#F59E0B" stroke-width="1.2" stroke-linejoin="round"/>
      <!-- Background Star -->
      <path d="M 34 9 Q 34 11.5 36.5 11.5 Q 34 11.5 34 14 Q 34 11.5 31.5 11.5 Q 34 11.5 34 9 Z" fill="#FDE047"/>
      <!-- Foreground Cloud -->
      <path d="M34 38H16C12.13 38 9 34.87 9 31C9 27.35 11.79 24.36 15.33 24.04C16.48 19.2 20.79 15.6 25.94 15.6C31.96 15.6 36.89 20.28 37.25 26.23C40.28 26.96 42.6 29.66 42.6 32.93C42.6 36.68 39.52 38 34 38Z" fill="#94A3B8"/>
    </svg>
  `;
}

function getOvercastIcon() {
  return `
    <svg viewBox="0 0 48 48" class="weather-icon-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M35 37H15C11.13 37 8 33.87 8 30C8 26.35 10.79 23.36 14.33 23.04C15.48 18.2 19.79 14.6 24.94 14.6C30.96 14.6 35.89 19.28 36.25 25.23C39.28 25.96 41.6 28.66 41.6 31.93C41.6 35.68 38.52 37 35 37Z" fill="#94A3B8"/>
    </svg>
  `;
}

function getFogIcon() {
  return `
    <svg viewBox="0 0 48 48" class="weather-icon-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round">
        <line x1="12" y1="18" x2="36" y2="18"/>
        <line x1="9" y1="24" x2="39" y2="24"/>
        <line x1="14" y1="30" x2="34" y2="30"/>
        <line x1="18" y1="36" x2="30" y2="36"/>
      </g>
    </svg>
  `;
}

function getDrizzleIcon() {
  return `
    <svg viewBox="0 0 48 48" class="weather-icon-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M34 30H16C12.7 30 10 27.3 10 24C10 20.9 12.3 18.4 15.4 18C16.4 13.9 20.1 10.8 24.5 10.8C29.6 10.8 33.8 14.8 34.1 19.9C36.7 20.5 38.6 22.8 38.6 25.6C38.6 28.8 36 30 34 30Z" fill="#94A3B8"/>
      <g stroke="#0284C7" stroke-width="2" stroke-linecap="round">
        <line x1="17" y1="35" x2="15" y2="40"/>
        <line x1="25" y1="35" x2="23" y2="40"/>
        <line x1="33" y1="35" x2="31" y2="40"/>
      </g>
    </svg>
  `;
}

function getRainIcon() {
  return `
    <svg viewBox="0 0 48 48" class="weather-icon-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M34 29H16C12.7 29 10 26.3 10 23C10 19.9 12.3 17.4 15.4 17C16.4 12.9 20.1 9.8 24.5 9.8C29.6 9.8 33.8 13.8 34.1 18.9C36.7 19.5 38.6 21.8 38.6 24.6C38.6 27.8 36 29 34 29Z" fill="#64748B"/>
      <g stroke="#2563EB" stroke-width="2.5" stroke-linecap="round">
        <line x1="16" y1="34" x2="13" y2="42"/>
        <line x1="24" y1="34" x2="21" y2="42"/>
        <line x1="32" y1="34" x2="29" y2="42"/>
      </g>
    </svg>
  `;
}

function getHeavyRainIcon() {
  return `
    <svg viewBox="0 0 48 48" class="weather-icon-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M34 28H16C12.7 28 10 25.3 10 22C10 18.9 12.3 16.4 15.4 16C16.4 11.9 20.1 8.8 24.5 8.8C29.6 8.8 33.8 12.8 34.1 17.9C36.7 18.5 38.6 20.8 38.6 23.6C38.6 26.8 36 28 34 28Z" fill="#475569"/>
      <g stroke="#1D4ED8" stroke-width="2.8" stroke-linecap="round">
        <line x1="14" y1="33" x2="10" y2="43"/>
        <line x1="21" y1="33" x2="17" y2="43"/>
        <line x1="28" y1="33" x2="24" y2="43"/>
        <line x1="35" y1="33" x2="31" y2="43"/>
      </g>
    </svg>
  `;
}

function getThunderstormIcon() {
  return `
    <svg viewBox="0 0 48 48" class="weather-icon-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M34 27H16C12.7 27 10 24.3 10 21C10 17.9 12.3 15.4 15.4 15C16.4 10.9 20.1 7.8 24.5 7.8C29.6 7.8 33.8 11.8 34.1 16.9C36.7 17.5 38.6 19.8 38.6 22.6C38.6 25.8 36 27 34 27Z" fill="#334155"/>
      <polygon points="24,28 18,37 23,37 20,45 30,34 25,34" fill="#F59E0B"/>
    </svg>
  `;
}

function getSnowIcon() {
  return `
    <svg viewBox="0 0 48 48" class="weather-icon-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M34 29H16C12.7 29 10 26.3 10 23C10 19.9 12.3 17.4 15.4 17C16.4 12.9 20.1 9.8 24.5 9.8C29.6 9.8 33.8 13.8 34.1 18.9C36.7 19.5 38.6 21.8 38.6 24.6C38.6 27.8 36 29 34 29Z" fill="#94A3B8"/>
      <g fill="#38BDF8">
        <circle cx="16" cy="36" r="2"/>
        <circle cx="24" cy="36" r="2"/>
        <circle cx="32" cy="36" r="2"/>
        <circle cx="20" cy="42" r="1.8"/>
        <circle cx="28" cy="42" r="1.8"/>
      </g>
    </svg>
  `;
}
