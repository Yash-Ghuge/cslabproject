/**
 * Crisp, modern SVG weather icons for various atmospheric conditions and metrics.
 * Designed with smooth gradients, balanced strokes, and responsive scaling.
 */

const WeatherIcons = {
  // Clear Day (Sun)
  clearDay: `
    <svg viewBox="0 0 64 64" class="weather-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFD166" />
          <stop offset="100%" stop-color="#F77F00" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="14" fill="url(#sunGrad)" class="pulse-sun"/>
      <g stroke="#F77F00" stroke-width="3" stroke-linecap="round" opacity="0.85">
        <line x1="32" y1="6" x2="32" y2="12" />
        <line x1="32" y1="52" x2="32" y2="58" />
        <line x1="6" y1="32" x2="12" y2="32" />
        <line x1="52" y1="32" x2="58" y2="32" />
        <line x1="13.6" y1="13.6" x2="17.8" y2="17.8" />
        <line x1="46.2" y1="46.2" x2="50.4" y2="50.4" />
        <line x1="13.6" y1="50.4" x2="17.8" y2="46.2" />
        <line x1="46.2" y1="17.8" x2="50.4" y2="13.6" />
      </g>
    </svg>
  `,

  // Clear Night (Crescent Moon + stars)
  clearNight: `
    <svg viewBox="0 0 64 64" class="weather-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FEF08A" />
          <stop offset="100%" stop-color="#FBBF24" />
        </linearGradient>
      </defs>
      <path d="M40 18C28 18 18 28 18 40C18 48 22.4 54.8 28.8 58C21.6 56 16 49.6 16 41.6C16 30.6 24.6 22 35.6 22C39.6 22 43.4 23.2 46.4 25.2C44.6 20.8 42.6 18 40 18Z" fill="url(#moonGrad)"/>
      <circle cx="48" cy="18" r="1.5" fill="#FEF08A"/>
      <circle cx="54" cy="28" r="1.2" fill="#FEF08A"/>
      <circle cx="44" cy="38" r="1.2" fill="#FEF08A"/>
    </svg>
  `,

  // Partly Cloudy Day
  partlyCloudyDay: `
    <svg viewBox="0 0 64 64" class="weather-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cloudGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="100%" stop-color="#CBD5E1" />
        </linearGradient>
        <radialGradient id="sunP" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FDE047" />
          <stop offset="100%" stop-color="#F59E0B" />
        </radialGradient>
      </defs>
      <circle cx="26" cy="24" r="11" fill="url(#sunP)"/>
      <path d="M44 48H22C16.48 48 12 43.52 12 38C12 32.8 15.98 28.52 21.04 28.06C22.68 21.14 28.84 16 36.2 16C44.8 16 51.84 22.68 52.36 31.18C56.68 32.22 60 36.08 60 40.76C60 46.12 55.6 48 44 48Z" fill="url(#cloudGrad1)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))"/>
    </svg>
  `,

  // Partly Cloudy Night
  partlyCloudyNight: `
    <svg viewBox="0 0 64 64" class="weather-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cloudGradN" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#E2E8F0" />
          <stop offset="100%" stop-color="#94A3B8" />
        </linearGradient>
      </defs>
      <path d="M28 14C22 14 17 19 17 25C17 29 19.2 32.4 22.4 34C18.8 33 16 29.8 16 25.8C16 20.3 20.3 16 25.8 16C27.8 16 29.7 16.6 31.2 17.6C29.8 15.4 29 14 28 14Z" fill="#FDE047"/>
      <path d="M44 48H22C16.48 48 12 43.52 12 38C12 32.8 15.98 28.52 21.04 28.06C22.68 21.14 28.84 16 36.2 16C44.8 16 51.84 22.68 52.36 31.18C56.68 32.22 60 36.08 60 40.76C60 46.12 55.6 48 44 48Z" fill="url(#cloudGradN)"/>
    </svg>
  `,

  // Overcast / Cloudy
  overcast: `
    <svg viewBox="0 0 64 64" class="weather-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="overcastGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#E2E8F0" />
          <stop offset="100%" stop-color="#64748B" />
        </linearGradient>
      </defs>
      <path d="M46 50H20C14.48 50 10 45.52 10 40C10 34.8 13.98 30.52 19.04 30.06C20.68 23.14 26.84 18 34.2 18C42.8 18 49.84 24.68 50.36 33.18C54.68 34.22 58 38.08 58 42.76C58 48.12 53.6 50 46 50Z" fill="url(#overcastGrad)"/>
    </svg>
  `,

  // Fog / Mist / Haze
  fog: `
    <svg viewBox="0 0 64 64" class="weather-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#94A3B8" stroke-width="3" stroke-linecap="round">
        <line x1="14" y1="22" x2="50" y2="22" opacity="0.6"/>
        <line x1="18" y1="30" x2="46" y2="30" opacity="0.85"/>
        <line x1="10" y1="38" x2="54" y2="38" opacity="0.9"/>
        <line x1="16" y1="46" x2="48" y2="46" opacity="0.75"/>
      </g>
    </svg>
  `,

  // Rain / Shower
  rain: `
    <svg viewBox="0 0 64 64" class="weather-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rainCloud" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#CBD5E1" />
          <stop offset="100%" stop-color="#475569" />
        </linearGradient>
      </defs>
      <path d="M44 40H20C15.58 40 12 36.42 12 32C12 27.84 15.18 24.42 19.23 24.05C20.54 18.51 25.47 14.4 31.36 14.4C38.24 14.4 43.87 19.74 44.29 26.54C47.74 27.38 50.4 30.46 50.4 34.21C50.4 38.5 46.88 40 44 40Z" fill="url(#rainCloud)"/>
      <g stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round">
        <line x1="22" y1="46" x2="19" y2="53" />
        <line x1="32" y1="46" x2="29" y2="54" />
        <line x1="42" y1="46" x2="39" y2="53" />
      </g>
    </svg>
  `,

  // Heavy Rain / Monsoon
  heavyRain: `
    <svg viewBox="0 0 64 64" class="weather-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="heavyCloud" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#94A3B8" />
          <stop offset="100%" stop-color="#334155" />
        </linearGradient>
      </defs>
      <path d="M46 38H18C13.58 38 10 34.42 10 30C10 25.84 13.18 22.42 17.23 22.05C18.54 16.51 23.47 12.4 29.36 12.4C36.24 12.4 41.87 17.74 42.29 24.54C45.74 25.38 48.4 28.46 48.4 32.21C48.4 36.5 44.88 38 46 38Z" fill="url(#heavyCloud)"/>
      <g stroke="#0284C7" stroke-width="2.8" stroke-linecap="round">
        <line x1="18" y1="44" x2="14" y2="55" />
        <line x1="26" y1="43" x2="22" y2="56" />
        <line x1="34" y1="44" x2="30" y2="57" />
        <line x1="42" y1="43" x2="38" y2="55" />
      </g>
    </svg>
  `,

  // Thunderstorm
  thunderstorm: `
    <svg viewBox="0 0 64 64" class="weather-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="stormCloud" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#64748B" />
          <stop offset="100%" stop-color="#1E293B" />
        </linearGradient>
      </defs>
      <path d="M46 36H18C13.58 36 10 32.42 10 28C10 23.84 13.18 20.42 17.23 20.05C18.54 14.51 23.47 10.4 29.36 10.4C36.24 10.4 41.87 15.74 42.29 22.54C45.74 23.38 48.4 26.46 48.4 30.21C48.4 34.5 44.88 36 46 36Z" fill="url(#stormCloud)"/>
      <polygon points="32,36 24,47 31,47 27,58 40,44 33,44" fill="#FACC15" />
    </svg>
  `,

  // Snow
  snow: `
    <svg viewBox="0 0 64 64" class="weather-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="snowCloud" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#F1F5F9" />
          <stop offset="100%" stop-color="#94A3B8" />
        </linearGradient>
      </defs>
      <path d="M46 38H18C13.58 38 10 34.42 10 30C10 25.84 13.18 22.42 17.23 22.05C18.54 16.51 23.47 12.4 29.36 12.4C36.24 12.4 41.87 17.74 42.29 24.54C45.74 25.38 48.4 28.46 48.4 32.21C48.4 36.5 44.88 38 46 38Z" fill="url(#snowCloud)"/>
      <g fill="#BAE6FD">
        <circle cx="20" cy="48" r="2.5" />
        <circle cx="32" cy="48" r="2.5" />
        <circle cx="44" cy="48" r="2.5" />
        <circle cx="26" cy="56" r="2" />
        <circle cx="38" cy="56" r="2" />
      </g>
    </svg>
  `
};

/**
 * Returns weather description and matching icon based on WMO Weather Code & is_day flag.
 */
function getWeatherInfo(code, isDay = 1) {
  // WMO Code interpretation
  switch (code) {
    case 0:
      return {
        label: isDay ? "Clear Sky" : "Clear Night",
        icon: isDay ? WeatherIcons.clearDay : WeatherIcons.clearNight,
        themeClass: isDay ? "theme-sunny" : "theme-night",
        hindiLabel: "साफ़ मौसम"
      };
    case 1:
      return {
        label: isDay ? "Mainly Clear" : "Clear Night",
        icon: isDay ? WeatherIcons.clearDay : WeatherIcons.clearNight,
        themeClass: isDay ? "theme-sunny" : "theme-night",
        hindiLabel: "हल्की धूप"
      };
    case 2:
      return {
        label: isDay ? "Partly Cloudy" : "Partly Cloudy Night",
        icon: isDay ? WeatherIcons.partlyCloudyDay : WeatherIcons.partlyCloudyNight,
        themeClass: isDay ? "theme-cloudy" : "theme-night",
        hindiLabel: "आंशिक बादल"
      };
    case 3:
      return {
        label: "Overcast",
        icon: WeatherIcons.overcast,
        themeClass: "theme-overcast",
        hindiLabel: "बादल छाए रहेंगे"
      };
    case 45:
    case 48:
      return {
        label: "Fog & Mist",
        icon: WeatherIcons.fog,
        themeClass: "theme-fog",
        hindiLabel: "कोहरा / धुंध"
      };
    case 51:
    case 53:
    case 55:
      return {
        label: "Light Drizzle",
        icon: WeatherIcons.rain,
        themeClass: "theme-rainy",
        hindiLabel: "हल्की बूंदाबांदी"
      };
    case 61:
    case 63:
      return {
        label: "Rain Showers",
        icon: WeatherIcons.rain,
        themeClass: "theme-rainy",
        hindiLabel: "बारिश"
      };
    case 65:
    case 80:
    case 81:
    case 82:
      return {
        label: "Heavy Monsoon Rain",
        icon: WeatherIcons.heavyRain,
        themeClass: "theme-rainy",
        hindiLabel: "तेज़ बारिश"
      };
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return {
        label: "Snowfall",
        icon: WeatherIcons.snow,
        themeClass: "theme-snow",
        hindiLabel: "बर्फबारी"
      };
    case 95:
    case 96:
    case 99:
      return {
        label: "Thunderstorm",
        icon: WeatherIcons.thunderstorm,
        themeClass: "theme-storm",
        hindiLabel: "आंधी-तूफान"
      };
    default:
      return {
        label: "Moderate Weather",
        icon: WeatherIcons.partlyCloudyDay,
        themeClass: "theme-cloudy",
        hindiLabel: "सामान्य"
      };
  }
}
