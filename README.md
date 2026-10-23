# ⛅ Mausam (मौसम) — Indian Weather & AQI Intelligence

> A modern, hyper-local, mobile-friendly Weather & Air Quality web application tailored for Indian cities, built exclusively with **Vanilla HTML, CSS, and JavaScript**.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![API](https://img.shields.io/badge/Open--Meteo-Free_API-10B981?style=flat)
![Responsive](https://img.shields.io/badge/Responsive-Mobile_First-FF9933?style=flat)

---

## ✨ Features

- 🇮🇳 **Indian City Reference & Defaults**:
  - Curated database of Indian cities (Pune, Mumbai, New Delhi, Bengaluru, Hyderabad, Chennai, Kolkata, Ahmedabad, Jaipur, etc.).
  - Instant quick-access chips for major Indian metropolitan areas.
  - Live Indian Standard Time (**IST**) digital clock.
  - Bilingual weather condition badges (English + Hindi, e.g. *Partly Cloudy / आंशिक बादल*).
- 🍃 **Air Quality Index (AQI) with CPCB Standards**:
  - Live AQI meter with color-coded categories: *Good, Satisfactory, Moderate, Poor, Very Poor, Severe*.
  - Detailed breakdown of key pollutants: **PM2.5**, **PM10**, **NO₂**, and **O₃ (Ozone)**.
  - Practical health guidance for Indian conditions (morning walks, outdoor sports, N95 mask advisory).
- 🕒 **24-Hour Hourly Forecast Carousel**:
  - Horizontal smooth-scrolling carousel with hour-by-hour temperature, precipitation probability, and weather conditions.
- 📅 **7-Day Weather Outlook**:
  - Day-by-day temperatures with visual minimum/maximum distribution bars and rain chances.
- 🌅 **Sun & Daylight Cycle**:
  - Exact sunrise and sunset times (12-hour IST format).
  - Visual sunlight progression arc showing current sun position.
- 📍 **GPS Geolocation & Smart Search**:
  - One-click current location detection via HTML5 Geolocation.
  - Fast search autocomplete prioritizing Indian cities, towns, and districts.
- 🎨 **Modern Glassmorphism UI**:
  - Atmospheric dynamic backgrounds shifting according to time and weather (Clear Day, Twilight Night, Monsoon Rain, Overcast, Thunderstorm).
  - Crisp, handcrafted SVG weather icons (sharp on Retina & OLED screens, zero external icon library dependencies).
  - °C / °F temperature unit toggle.
- 📱 **Mobile-First & Touch Optimized**:
  - 100% responsive on smartphones, tablets, and desktops.
  - Safe area inset support for notched and punch-hole displays.
  - Finger-friendly tap targets (minimum 44px) and smooth swipe gestures.
- ⚡ **Zero-Dependency & No API Key Needed**:
  - Powered by the public Open-Meteo API. No API keys required, no hidden quotas, zero setup hurdles.

---

## 📁 Project Structure

```
cslabproject/
├── index.html           # Main semantic HTML5 markup
├── css/
│   ├── style.css        # Design tokens, atmospheric themes & global layout
│   ├── components.css   # Cards, search autocomplete, AQI gauge, carousel
│   └── responsive.css   # Mobile-first breakpoints and touch optimizations
├── js/
│   ├── cities.js        # Curated Indian cities dataset & quick chips
│   ├── icons.js         # Scalable SVG weather icons & WMO code mapper
│   ├── api.js           # Open-Meteo Weather, Air Quality & Geocoding API handler
│   └── app.js           # Application state, UI controller & event listeners
└── README.md            # Project documentation
```

---

## 🚀 How to Run Locally

Because the project is written in pure vanilla web technologies, no build tools, Node.js, or complex installations are needed!

### Option 1: Direct File Open
Simply double-click `index.html` or open it directly in any modern browser (Chrome, Edge, Firefox, Safari).

### Option 2: Using VS Code Live Server
1. Open the project folder in VS Code.
2. Right click `index.html` and click **"Open with Live Server"**.

### Option 3: Python Local HTTP Server
```bash
# In the project directory
python -m http.server 8000
```
Then open `http://localhost:8000` in your web browser.

---

## 🌐 Deploying to GitHub Pages

1. Go to your repository settings on GitHub: `https://github.com/Yash-Ghuge/cslabproject/settings/pages`.
2. Under **Build and deployment** > **Source**, select `Deploy from a branch`.
3. Choose branch `main` and folder `/(root)`.
4. Click **Save**. Your weather website will be live at `https://yash-ghuge.github.io/cslabproject/` within a few minutes!

---

## 🛠️ Technology Stack

- **HTML5**: Semantic markup (`header`, `main`, `section`, `article`, `nav`, `footer`).
- **Vanilla CSS3**: CSS Variables, Glassmorphism backdrop-filters, Flexbox, Grid, CSS animations.
- **JavaScript (ES6+)**: Fetch API, Async/Await, HTML5 Geolocation, LocalStorage, DOM manipulation.
- **Data Providers**:
  - Weather Forecast & Hourly Data: [Open-Meteo](https://open-meteo.com/)
  - Air Quality API: [Open-Meteo Air Quality](https://air-quality-api.open-meteo.com/)
  - Geocoding API: [Open-Meteo Geocoding](https://geocoding-api.open-meteo.com/)

---

## 📄 License

This project is created for educational and academic purposes (CS Lab Micro Project). Feel free to use and customize!
