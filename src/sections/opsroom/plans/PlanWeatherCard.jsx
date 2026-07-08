import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

const PlanWeatherCard = ({ plan }) => {
  const safePlan = plan || {};

  const weather = safePlan.weather || {};
  const daily = weather?.daily || {};
  const current = weather?.current || null;
  const hourlyRows = Array.isArray(weather?.hourly) ? weather.hourly : [];
  const tempMin = daily?.temperature_2m_min;
  const tempMax = daily?.temperature_2m_max;
  const rainSum = Number(daily?.rain_sum || 0);
  const precipitationSum = Number(daily?.precipitation_sum || 0);
  const windSpeed = daily?.wind_speed_10m_max;
  const windDirection = daily?.wind_direction_10m_dominant;
  const humidity = weather?.summary?.humidityAvg;
  const weatherCode = daily?.weather_code;
  const hasWeatherData = Boolean(daily && daily.date);
  const [showDetails, setShowDetails] = useState(false);

  const toNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const formatHour = (iso) => {
    if (!iso) return 'N/A';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const classifyHourlyRain = (rainMm) => {
    const rain = toNumber(rainMm);
    if (rain == null || rain <= 0) return 'No rain';
    if (rain < 2.5) return 'Slight / Light Rain';
    if (rain <= 7.5) return 'Moderate Rain';
    if (rain <= 50) return 'Heavy Rain';
    return 'Violent / Torrential Rain';
  };

  const classifyDailyRain = (dailyMm) => {
    const rain = toNumber(dailyMm);
    if (rain == null || rain <= 0) return 'Minimal';
    if (rain <= 2) return 'Minimal';
    if (rain <= 5) return 'Steady light drizzle';
    if (rain <= 15) return 'Moderate rainfall';
    if (rain <= 30) return 'Strong, heavy rain';
    return 'Intense rainfall';
  };

  // Determine weather condition and styling
  const getWeatherCondition = () => {
    if (!hasWeatherData) {
      return { condition: 'No Weather Data', icon: '⚪', className: 'weather-unknown' };
    }
    if (weatherCode === 0 || weatherCode === 1) {
      return { condition: 'Clear', icon: '☀️', className: 'weather-clear' };
    }
    if (weatherCode >= 2 && weatherCode <= 3) {
      return { condition: 'Partly Cloudy', icon: '⛅', className: 'weather-partly-cloudy' };
    }
    if (weatherCode === 45 || weatherCode === 48) {
      return { condition: 'Foggy', icon: '🌫️', className: 'weather-foggy' };
    }
    if (weatherCode >= 51 && weatherCode <= 57) {
      return { condition: 'Drizzle', icon: '🌦️', className: 'weather-drizzle' };
    }
    if ((weatherCode >= 61 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
      return { condition: 'Rainy', icon: '🌧️', className: 'weather-rainy' };
    }
    if (weatherCode >= 95 && weatherCode <= 99) {
      return { condition: 'Thunderstorm', icon: '⛈️', className: 'weather-thunderstorm' };
    }
    if (precipitationSum > 0) return { condition: 'Rainy', icon: '🌦️', className: 'weather-rainy' };
    return { condition: 'Cloudy', icon: '☁️', className: 'weather-cloudy' };
  };

  const weatherInfo = getWeatherCondition();
  const hasPrecipitation = precipitationSum > 0;
  const dailyRainLabel = classifyDailyRain(precipitationSum);

  const detailRows = useMemo(
    () =>
      hourlyRows.map((row) => ({
        ...row,
        rainLevel: classifyHourlyRain(row.rain),
      })),
    [hourlyRows]
  );

  // Map type codes to display names
  const getTypeDisplayName = (type) => {
    if (!type) return 'N/A';
    const typeLower = type.toLowerCase();
    if (typeLower === 'spy') return 'Spray';
    if (typeLower === 'spd') return 'Spread';
    return type; // Return original if no mapping found
  };

  if (!plan) return null;

  const detailsModal = showDetails ? (
    <div className="plan-weather-detail-overlay" onClick={() => setShowDetails(false)}>
      <div className="plan-weather-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="plan-weather-detail-header">
          <h4>{plan.estate || 'Estate'} — Weather Details</h4>
          <button type="button" onClick={() => setShowDetails(false)} className="plan-weather-detail-close">
            ×
          </button>
        </div>

        <div className="plan-weather-detail-sections">
          <div className="plan-weather-detail-card">
            <h5>Current</h5>
            {current ? (
              <div className="plan-weather-kv-grid">
                <div><strong>Temp:</strong> {toNumber(current.temperature_2m)?.toFixed(1)}°C</div>
                <div><strong>Wind:</strong> {toNumber(current.wind_speed_10m)?.toFixed(1)} km/h</div>
                <div><strong>Direction:</strong> {toNumber(current.wind_direction_10m)?.toFixed(0)}°</div>
                <div><strong>Rain:</strong> {toNumber(current.rain)?.toFixed(1)} mm</div>
                <div><strong>Precip:</strong> {toNumber(current.precipitation)?.toFixed(1)} mm</div>
                <div><strong>Day/Night:</strong> {Number(current.is_day) === 1 ? 'Day' : 'Night'}</div>
              </div>
            ) : (
              <p>No current weather data.</p>
            )}
          </div>

          <div className="plan-weather-detail-card">
            <h5>Daily Summary</h5>
            {daily ? (
              <div className="plan-weather-kv-grid">
                <div><strong>Date:</strong> {daily.date}</div>
                <div><strong>Temp:</strong> {toNumber(daily.temperature_2m_min)?.toFixed(1)}°C - {toNumber(daily.temperature_2m_max)?.toFixed(1)}°C</div>
                <div><strong>Rain sum:</strong> {toNumber(daily.rain_sum)?.toFixed(1)} mm</div>
                <div><strong>Precip sum:</strong> {toNumber(daily.precipitation_sum)?.toFixed(1)} mm</div>
                <div><strong>Rain level:</strong> {dailyRainLabel}</div>
                <div><strong>Precip chance max:</strong> {toNumber(daily.precipitation_probability_max)?.toFixed(0)}%</div>
                <div><strong>Wind max:</strong> {toNumber(daily.wind_speed_10m_max)?.toFixed(1)} km/h</div>
                <div><strong>Gust max:</strong> {toNumber(daily.wind_gusts_10m_max)?.toFixed(1)} km/h</div>
              </div>
            ) : (
              <p>No daily data.</p>
            )}
          </div>
        </div>

        <div className="plan-weather-detail-hourly">
          <h5>Hourly (Selected Day)</h5>
          <div className="plan-weather-hourly-table-wrap">
            <table className="plan-weather-hourly-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Temp (°C)</th>
                  <th>Rain (mm)</th>
                  <th>Rain Level</th>
                  <th>Precip (%)</th>
                  <th>Wind (km/h)</th>
                </tr>
              </thead>
              <tbody>
                {detailRows.map((row, idx) => (
                  <tr key={`${row.time}-${idx}`}>
                    <td>{formatHour(row.time)}</td>
                    <td>{toNumber(row.temperature_2m)?.toFixed(1) ?? '—'}</td>
                    <td>{toNumber(row.rain)?.toFixed(1) ?? '0.0'}</td>
                    <td>{row.rainLevel}</td>
                    <td>{toNumber(row.precipitation_probability)?.toFixed(0) ?? '—'}</td>
                    <td>{toNumber(row.wind_speed_10m)?.toFixed(1) ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className={`plan-weather-card ${weatherInfo.className}`}>
      {/* Card Header */}
      <div className="plan-card-header">
        <div className="plan-card-title-section">
          <h3 className="plan-card-estate">{plan.estate || 'Unknown Estate'}</h3>
          <span className="plan-card-city">
            {plan.latitude != null && plan.longitude != null
              ? `Lat ${Number(plan.latitude).toFixed(5)} · Lon ${Number(plan.longitude).toFixed(5)}`
              : 'Coordinates not set'}
          </span>
        </div>
        <div className="plan-card-weather-icon">
          {weatherInfo.icon}
        </div>
      </div>

      {/* Weather Condition */}
      <div className="plan-card-weather-condition">
        <span className="weather-condition-text">{weatherInfo.condition}</span>
        {!hasWeatherData && plan.weatherUnavailableReason ? (
          <span className="weather-condition-text">{plan.weatherUnavailableReason}</span>
        ) : null}
      </div>

      {/* Temperature */}
      {tempMin !== undefined && tempMax !== undefined && (
        <div className="plan-card-temperature">
          <span className="temp-min">{Math.round(tempMin)}°C</span>
          <span className="temp-separator">/</span>
          <span className="temp-max">{Math.round(tempMax)}°C</span>
        </div>
      )}

      {/* Weather Details Grid */}
      <div className="plan-card-details">
        {/* Precipitation */}
        {hasPrecipitation && (
          <div className="plan-card-detail-item">
            <span className="detail-label">Rain:</span>
            <span className="detail-value">
              {precipitationSum.toFixed(1)} mm ({dailyRainLabel})
            </span>
          </div>
        )}

        {/* Wind */}
        {windSpeed !== undefined && (
          <div className="plan-card-detail-item">
            <span className="detail-label">Wind:</span>
            <span className="detail-value">
              <span>{Math.round(windSpeed)} km/h</span>
              {windDirection != null && (
                <span className="detail-subvalue">Dir: {Math.round(windDirection)}°</span>
              )}
            </span>
          </div>
        )}

        {/* Humidity */}
        {humidity != null && (
          <div className="plan-card-detail-item">
            <span className="detail-label">Humidity:</span>
            <span className="detail-value">{Math.round(humidity)}%</span>
          </div>
        )}
      </div>

      {/* Plan Information */}
      <div className="plan-card-plan-info">
        <div className="plan-info-row">
          <span className="plan-info-label">Area:</span>
          <span className="plan-info-value">{plan.area || 0} ha</span>
        </div>
        <div className="plan-info-row">
          <span className="plan-info-label">Type:</span>
          <span className="plan-info-value">{getTypeDisplayName(plan.type)}</span>
        </div>
        <div className="plan-info-row">
          <span className="plan-info-label">Manager:</span>
          <span className="plan-info-value">{plan.manager_name || 'N/A'}</span>
        </div>
        <div className="plan-info-row">
          <span className="plan-info-label">Operator:</span>
          <span className="plan-info-value">{plan.operator_name || 'N/A'}</span>
        </div>
        {plan.manager_approval !== undefined && (
          <div className="plan-info-row">
            <span className="plan-info-label">Approval:</span>
            <span className={`plan-info-value ${plan.manager_approval === 1 ? 'approved' : 'pending'}`}>
              {plan.manager_approval === 1 ? '✓ Approved' : '⏳ Pending'}
            </span>
          </div>
        )}
      </div>

      <div className="plan-card-actions">
        <button type="button" className="plan-card-more-btn" onClick={() => setShowDetails(true)}>
          More details
        </button>
      </div>
      {typeof document !== 'undefined' ? createPortal(detailsModal, document.body) : null}

    </div>
  );
};

export default PlanWeatherCard;

