// External weather API service (Open-Meteo), called directly with fetch.
const MAX_FORECAST_WINDOW_DAYS = 15;
const DAY_MS = 24 * 60 * 60 * 1000;

function toLocalDateOnly(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseYmdLocal(ymd) {
  if (!ymd) return null;
  const [y, m, d] = String(ymd).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function getTodayYmd() {
  return new Date().toLocaleDateString('en-CA');
}

export function clampDateWithinForecastWindow(selectedDateYmd) {
  const today = toLocalDateOnly(new Date());
  const selected = toLocalDateOnly(parseYmdLocal(selectedDateYmd) || today);
  const minDate = new Date(today);
  minDate.setDate(today.getDate() - MAX_FORECAST_WINDOW_DAYS);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + MAX_FORECAST_WINDOW_DAYS);
  if (selected < minDate) return minDate.toLocaleDateString('en-CA');
  if (selected > maxDate) return maxDate.toLocaleDateString('en-CA');
  return selected.toLocaleDateString('en-CA');
}

function calculatePastAndForecastDays(selectedDateYmd) {
  const today = toLocalDateOnly(new Date());
  const selected = toLocalDateOnly(parseYmdLocal(selectedDateYmd) || today);
  const dayDiff = Math.round((selected.getTime() - today.getTime()) / DAY_MS);
  if (dayDiff >= 0) {
    return { past_days: 0, forecast_days: Math.min(MAX_FORECAST_WINDOW_DAYS, dayDiff + 1) };
  }
  return { past_days: Math.min(MAX_FORECAST_WINDOW_DAYS, Math.abs(dayDiff)), forecast_days: 1 };
}

export function summarizeHourlyWeatherForDate(weatherData, selectedDateYmd) {
  const hourly = weatherData?.hourly;
  if (!hourly?.time || !Array.isArray(hourly.time)) return null;

  const indices = [];
  for (let i = 0; i < hourly.time.length; i += 1) {
    if (String(hourly.time[i]).startsWith(selectedDateYmd)) indices.push(i);
  }
  if (!indices.length) return null;

  const collect = (arr) =>
    indices
      .map((idx) => (Array.isArray(arr) ? Number(arr[idx]) : NaN))
      .filter((n) => Number.isFinite(n));
  const min = (vals) => (vals.length ? Math.min(...vals) : null);
  const max = (vals) => (vals.length ? Math.max(...vals) : null);
  const sum = (vals) => vals.reduce((acc, v) => acc + v, 0);
  const avg = (vals) => (vals.length ? sum(vals) / vals.length : null);

  const temp2m = collect(hourly.temperature_2m);
  const rain = collect(hourly.rain);
  const precipitation = collect(hourly.precipitation);
  const windSpeed = collect(hourly.wind_speed_10m);
  const windDirection = collect(hourly.wind_direction_10m);
  const humidity = collect(hourly.relative_humidity_2m);

  return {
    selectedDate: selectedDateYmd,
    temperatureMin: min(temp2m),
    temperatureMax: max(temp2m),
    rainSum: sum(rain),
    precipitationSum: sum(precipitation),
    windSpeedMin: min(windSpeed),
    windSpeedAvg: avg(windSpeed),
    windSpeedMax: max(windSpeed),
    windDirectionAvg: avg(windDirection),
    humidityAvg: avg(humidity),
  };
}

function extractDailyWeatherForDate(raw, selectedDateYmd) {
  const daily = raw?.daily;
  if (!daily?.time || !Array.isArray(daily.time)) return null;
  const index = daily.time.findIndex((d) => d === selectedDateYmd);
  if (index < 0) return null;
  const valueAt = (arr) => (Array.isArray(arr) && arr[index] != null ? arr[index] : null);
  return {
    date: selectedDateYmd,
    weather_code: valueAt(daily.weather_code),
    temperature_2m_min: valueAt(daily.temperature_2m_min),
    temperature_2m_max: valueAt(daily.temperature_2m_max),
    rain_sum: valueAt(daily.rain_sum),
    precipitation_sum: valueAt(daily.precipitation_sum),
    precipitation_probability_max: valueAt(daily.precipitation_probability_max),
    wind_speed_10m_max: valueAt(daily.wind_speed_10m_max),
    wind_gusts_10m_max: valueAt(daily.wind_gusts_10m_max),
    wind_direction_10m_dominant: valueAt(daily.wind_direction_10m_dominant),
    precipitation_hours: valueAt(daily.precipitation_hours),
  };
}

function extractHourlyWeatherForDate(raw, selectedDateYmd) {
  const hourly = raw?.hourly;
  if (!hourly?.time || !Array.isArray(hourly.time)) return [];
  const rows = [];
  for (let i = 0; i < hourly.time.length; i += 1) {
    const timestamp = String(hourly.time[i]);
    if (!timestamp.startsWith(selectedDateYmd)) continue;
    rows.push({
      time: timestamp,
      temperature_2m: hourly.temperature_2m?.[i] ?? null,
      relative_humidity_2m: hourly.relative_humidity_2m?.[i] ?? null,
      rain: hourly.rain?.[i] ?? null,
      precipitation: hourly.precipitation?.[i] ?? null,
      precipitation_probability: hourly.precipitation_probability?.[i] ?? null,
      wind_speed_10m: hourly.wind_speed_10m?.[i] ?? null,
      wind_direction_10m: hourly.wind_direction_10m?.[i] ?? null,
      temperature_80m: hourly.temperature_80m?.[i] ?? null,
    });
  }
  return rows;
}

export const getWeatherByCoordinates = async (latitude, longitude, selectedDateYmd) => {
  try {
    const safeDate = clampDateWithinForecastWindow(selectedDateYmd);
    const { past_days, forecast_days } = calculatePastAndForecastDays(safeDate);
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      daily:
        'temperature_2m_max,weather_code,rain_sum,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,daylight_duration,temperature_2m_min,precipitation_hours,precipitation_probability_max,precipitation_sum',
      hourly:
        'temperature_2m,relative_humidity_2m,rain,precipitation,precipitation_probability,wind_speed_10m,wind_direction_10m,temperature_80m',
      current: 'precipitation,rain,wind_speed_10m,wind_direction_10m,temperature_2m,is_day',
      timezone: 'auto',
      past_days: String(past_days),
      forecast_days: String(Math.max(1, forecast_days)),
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!response.ok) throw new Error(`Weather API error: ${response.status}`);
    const raw = await response.json();
    const daily = extractDailyWeatherForDate(raw, safeDate);
    const hourlyRows = extractHourlyWeatherForDate(raw, safeDate);
    const hourlySummary = summarizeHourlyWeatherForDate(raw, safeDate);
    return {
      raw,
      selectedDate: safeDate,
      daily,
      current: raw?.current || null,
      hourly: hourlyRows,
      summary: {
        selectedDate: safeDate,
        ...(hourlySummary || {}),
        ...(daily || {}),
      },
      requestedDate: safeDate,
    };
  } catch (error) {
    console.error('Error fetching weather by coordinates:', error);
    throw error;
  }
};

