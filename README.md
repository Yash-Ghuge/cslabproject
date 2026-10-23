# Mausam — Professional Weather & Air Quality Dashboard

> A high-performance, responsive, and accessible weather dashboard for Indian locations, engineered exclusively with **plain HTML5, CSS3, and vanilla JavaScript (ES6+)**.

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployment_Ready-black?style=flat&logo=vercel)](https://cslabproject.vercel.app/)
[![HTML5](https://img.shields.io/badge/HTML5-Semantic_Markup-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-Custom_Properties-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla_ES6+-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Open-Meteo](https://img.shields.io/badge/Open--Meteo-Public_API-10B981?style=flat)](https://open-meteo.com/)

---

## 🌐 Overview

**Mausam** delivers accurate, real-time meteorological conditions, 24-hour hourly projections, 7-day extended forecasts, and air quality metrics across Indian cities and districts. Designed with a clean, executive interface, it prioritizes typography, data clarity, mobile responsiveness, and zero-dependency performance.

- **Production URL**: [https://cslabproject.vercel.app/](https://cslabproject.vercel.app/)
- **Technology Stack**: Native HTML5, CSS3, Vanilla JavaScript Modules (No React, Next.js, TypeScript, Tailwind, or bundling tools required).

---

## ✨ Architectural Highlights

### 1. Robust Asynchronous Data Pipeline
- **Race Condition Prevention**: Employs browser-native `AbortController` instances to cancel in-flight requests whenever users quickly switch between cities.
- **Independent Section Fault-Tolerance**: Uses `Promise.allSettled` to fetch Weather and Air Quality data in parallel. If an air quality sensor is offline or delayed, the weather dashboard renders completely without error.
- **Timezone Awareness**: All local dates, timestamps, and forecast intervals are formatted using `Intl.DateTimeFormat` with the location's specific IANA timezone (e.g. `Asia/Kolkata`).
- **Data Transparency**: Explicitly identifies pollutant data with its true standard—**United States Air Quality Index (US EPA Standard)**—sourced from the Open-Meteo Atmospheric Model. Does not fabricate or mislabel sensor data.

### 2. Design System & User Experience
- **Primary Light Palette**: Clean slate background (`#F5F8FC`), crisp white surfaces (`#FFFFFF`), dark slate typography (`#142033`), and royal blue primary accents (`#2563EB`).
- **Dark Mode**: High-contrast, non-distracting dark palette accessible via the top navigation toggle.
- **System Font Stack**: Uses standard system typography (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto...`) for zero-latency First Contentful Paint (FCP).
- **Responsive Layout**: Fluid breakpoints optimized for small phones (320px–375px), tablets (768px), and desktops (1024px–1440px+). Minimum 44px touch targets.
- **Vector Weather Graphics**: Handcrafted inline SVG weather icons matching WMO interpretation codes (clear, clouds, rain, snow, fog, thunderstorms).

---

## 📁 Repository Structure

```
/
├── index.html           # Semantic HTML5 layout
├── css/
│   └── styles.css       # Complete design system, light/dark themes, responsive layout
├── js/
│   ├── app.js           # Core application orchestrator and state management
│   ├── api.js           # Open-Meteo weather, air quality, and geocoding client
│   ├── weather.js       # Meteorological data normalizer, WMO mapper, and SVG icons
│   ├── air-quality.js   # US EPA AQI processor, pollutant formatters, and health advice
│   └── ui.js            # DOM renderer, carousel controller, and event handlers
├── assets/
│   └── favicon.svg      # Clean SVG weather favicon
├── package.json         # Static project descriptor with local serve script
├── vercel.json          # Vercel static routing configuration
├── robots.txt           # Standard search crawler configuration
└── README.md            # Technical documentation
```

---

## 🚀 Local Development

No build pipeline or compilation is required.

### Quick Start
```bash
# Clone the repository
git clone https://github.com/Yash-Ghuge/cslabproject.git

# Enter project directory
cd cslabproject

# Launch local server using standard npm script
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in any modern browser.

Alternatively, you can open `index.html` directly or serve with Python:
```bash
python -m http.server 8000
```

---

## ☁️ Deployment on Vercel

The project is structured as a static website for automatic, zero-configuration deployment on Vercel:

1. Push commits to branch `main` on GitHub.
2. Vercel automatically deploys the static files (`index.html`, `css/styles.css`, `js/app.js`, etc.).
3. Live production URL: [https://cslabproject.vercel.app/](https://cslabproject.vercel.app/)

---

## 📄 License & Attribution

- Weather & Air Quality data provided by [Open-Meteo](https://open-meteo.com/) under the [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) license.
- Geocoding provided by Open-Meteo Geocoding API with OpenStreetMap data.
