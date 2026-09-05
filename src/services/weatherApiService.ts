import { WeatherTelemetry } from '../types';

export interface LiveWeatherResult {
  temperature: number;
  humidity: number;
  apparentTemperature: number;
  windSpeed: number;
  precipitation: number;
  weatherCode: number;
  timestamp: string;
}

/**
 * Calculate Stull's Wet Bulb Temperature (Tw) from Air Temp (T) in °C and Relative Humidity (RH) in %
 */
export function calculateWetBulbTemp(T: number, RH: number): number {
  const Tw =
    T * Math.atan(0.151977 * Math.sqrt(RH + 8.313659)) +
    Math.atan(T + RH) -
    Math.atan(RH - 1.676331) +
    0.00391838 * Math.pow(RH, 1.5) * Math.atan(0.023101 * RH) -
    4.686035;
  return Number(Tw.toFixed(1));
}

/**
 * Estimate Outdoor Wet Bulb Globe Temperature (WBGT)
 */
export function calculateWBGT(T: number, RH: number, windSpeedKmH: number, solarRad = 850): number {
  const Tw = calculateWetBulbTemp(T, RH);
  const windM_S = Math.max(0.2, windSpeedKmH / 3.6);
  // Approximate globe temperature Tg under solar radiation
  const Tg = T + (solarRad / 1000) * 12 - (windM_S * 0.8);
  const wbgt = 0.7 * Tw + 0.2 * Tg + 0.1 * T;
  return Number(wbgt.toFixed(1));
}

/**
 * Calculate UTCI (Universal Thermal Climate Index) approximation
 */
export function calculateUTCI(T: number, RH: number, windSpeedKmH: number): number {
  const windM_S = Math.max(0.5, windSpeedKmH / 3.6);
  const utci = T + (0.33 * (RH / 100) * 6.105 * Math.exp((17.27 * T) / (237.7 + T))) - (0.7 * windM_S) - 4.0;
  return Number(utci.toFixed(1));
}

/**
 * Calculate hourly sweat loss rate in ml/h based on thermal strain
 */
export function calculateSweatLossRate(heatIndex: number, wbgt: number): number {
  const baseline = 300;
  const heatFactor = Math.max(0, (heatIndex - 32) * 45);
  const wbgtFactor = Math.max(0, (wbgt - 28) * 60);
  return Math.min(1400, Math.round(baseline + heatFactor + wbgtFactor));
}

/**
 * Fetch real-time live meteorological telemetry from Open-Meteo API
 */
export async function fetchLiveWeatherFromApi(
  lat: number,
  lng: number,
  fallbackWeather: WeatherTelemetry
): Promise<WeatherTelemetry> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,direct_normal_irradiance&timezone=auto`;

  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`Failed to fetch live weather: ${response.statusText}`);
  }

  const data = await response.json();
  const current = data.current;

  if (!current) {
    throw new Error('No current weather data available in API response');
  }

  const dryBulbTemp = Number(current.temperature_2m.toFixed(1));
  const humidity = Math.round(current.relative_humidity_2m);
  const apparentTemp = Number(current.apparent_temperature.toFixed(1));
  const windSpeed = Number(current.wind_speed_10m.toFixed(1));
  const solarRadiation = current.direct_normal_irradiance 
    ? Math.round(current.direct_normal_irradiance) 
    : fallbackWeather.solarRadiation || 820;

  const wetBulbTemp = calculateWetBulbTemp(dryBulbTemp, humidity);
  const wbgt = calculateWBGT(dryBulbTemp, humidity, windSpeed, solarRadiation);
  const utci = calculateUTCI(dryBulbTemp, humidity, windSpeed);
  const sweatLossRate = calculateSweatLossRate(apparentTemp, wbgt);

  // Determine risk level & GRAP stage
  let riskLevel: 'EXTREME' | 'VERY_HIGH' | 'HIGH' | 'MODERATE' = 'MODERATE';
  let grapStage = 'GRAP STAGE I (ADVISORY)';

  if (wbgt >= 34.0 || apparentTemp >= 48.0) {
    riskLevel = 'EXTREME';
    grapStage = 'GRAP STAGE IV (CRITICAL CURFEW)';
  } else if (wbgt >= 32.0 || apparentTemp >= 44.0) {
    riskLevel = 'VERY_HIGH';
    grapStage = 'GRAP STAGE III (EMERGENCY STANDBY)';
  } else if (wbgt >= 30.0 || apparentTemp >= 40.0) {
    riskLevel = 'HIGH';
    grapStage = 'GRAP STAGE II (YELLOW ALERT)';
  }

  const nowIST = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }) + ' IST';

  return {
    ...fallbackWeather,
    dryBulbTemp,
    wetBulbTemp,
    wbgt,
    heatIndex: apparentTemp,
    utci,
    humidity,
    solarRadiation,
    windSpeed,
    sweatLossRate,
    riskLevel,
    grapStage,
    lastUpdated: `${nowIST} (Live Satellite API)`,
  };
}
