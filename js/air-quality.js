/**
 * Mausam Weather Dashboard
 * Air Quality Data Processor
 * Compliant with accurate standard attribution (US EPA AQI & Open-Meteo)
 */

/**
 * Standard US EPA AQI Categories and Health Guidance
 */
export const US_AQI_CATEGORIES = [
  {
    min: 0,
    max: 50,
    category: 'Good',
    className: 'aqi-good',
    color: '#16A34A',
    guidance: 'Air quality is satisfactory, and air pollution poses little or no risk. Great conditions for outdoor activities.'
  },
  {
    min: 51,
    max: 100,
    category: 'Moderate',
    className: 'aqi-moderate',
    color: '#D97706',
    guidance: 'Air quality is acceptable. Exceptionally sensitive individuals should monitor prolonged outdoor exertion.'
  },
  {
    min: 101,
    max: 150,
    category: 'Unhealthy for Sensitive Groups',
    className: 'aqi-sensitive',
    color: '#EA580C',
    guidance: 'Members of sensitive groups (children, elderly, respiratory conditions) should reduce prolonged outdoor exertion.'
  },
  {
    min: 151,
    max: 200,
    category: 'Unhealthy',
    className: 'aqi-unhealthy',
    color: '#DC2626',
    guidance: 'Everyone may begin to experience health effects. Sensitive groups should limit heavy outdoor exertion.'
  },
  {
    min: 201,
    max: 300,
    category: 'Very Unhealthy',
    className: 'aqi-very-unhealthy',
    color: '#9333EA',
    guidance: 'Health alert: risk of health effects is increased for all. Avoid strenuous outdoor activity and wear protection.'
  },
  {
    min: 301,
    max: 500,
    category: 'Hazardous',
    className: 'aqi-hazardous',
    color: '#7E22CE',
    guidance: 'Health warning of emergency conditions. Everyone should remain indoors and keep physical exertion low.'
  }
];

/**
 * Get category metadata for a given numerical AQI value
 */
export function getAqiCategory(aqiValue) {
  if (aqiValue === null || aqiValue === undefined || Number.isNaN(Number(aqiValue))) {
    return null;
  }
  const val = Number(aqiValue);
  for (const item of US_AQI_CATEGORIES) {
    if (val >= item.min && val <= item.max) {
      return item;
    }
  }
  if (val > 500) {
    return US_AQI_CATEGORIES[US_AQI_CATEGORIES.length - 1];
  }
  return US_AQI_CATEGORIES[0];
}

/**
 * Format a pollutant value cleanly or return 'Unavailable'
 */
function formatPollutant(value, unit = 'µg/m³') {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return { value: '--', unit: '', isAvailable: false };
  }
  return {
    value: Math.round(Number(value) * 10) / 10,
    unit,
    isAvailable: true
  };
}

/**
 * Normalize Open-Meteo Air Quality response
 */
export function normalizeAirQualityData(raw) {
  if (!raw || !raw.current) {
    return null;
  }

  const curr = raw.current;
  const rawUsAqi = curr.us_aqi;

  const aqiCategory = getAqiCategory(rawUsAqi);
  const aqiNum = rawUsAqi !== null && rawUsAqi !== undefined && !Number.isNaN(Number(rawUsAqi))
    ? Math.round(Number(rawUsAqi))
    : null;

  return {
    aqiValue: aqiNum,
    aqiCategory: aqiCategory ? aqiCategory.category : 'Unavailable',
    className: aqiCategory ? aqiCategory.className : 'aqi-unavailable',
    colorHex: aqiCategory ? aqiCategory.color : '#94A3B8',
    guidance: aqiCategory
      ? aqiCategory.guidance
      : 'Real-time air sensor data is currently unavailable for this specific station.',
    standardName: 'United States AQI (US EPA Standard)',
    dataSource: 'Open-Meteo Atmospheric Air Quality Model',
    pollutants: {
      pm25: formatPollutant(curr.pm2_5),
      pm10: formatPollutant(curr.pm10),
      no2: formatPollutant(curr.nitrogen_dioxide),
      so2: formatPollutant(curr.sulphur_dioxide),
      o3: formatPollutant(curr.ozone),
      co: formatPollutant(curr.carbon_monoxide)
    }
  };
}
