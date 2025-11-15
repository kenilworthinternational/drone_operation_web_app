import React from 'react';

const PlanWeatherCard = ({ plan }) => {
  if (!plan) return null;

  const weather = plan.weather?.daily;
  const weatherCode = weather?.weather_code?.[0];
  const tempMin = weather?.temperature_2m_min?.[0];
  const tempMax = weather?.temperature_2m_max?.[0];
  const rainSum = weather?.rain_sum?.[0] || 0;
  const showersSum = weather?.showers_sum?.[0] || 0;
  const windSpeed = weather?.wind_speed_10m_max?.[0];
  const windGusts = weather?.wind_gusts_10m_max?.[0];
  const sunrise = weather?.sunrise?.[0];
  const sunset = weather?.sunset?.[0];
  const totalPrecipitation = rainSum + showersSum;

  // Determine weather condition and styling
  const getWeatherCondition = () => {
    if (!weatherCode) return { condition: 'Unknown', icon: '❓', className: 'weather-unknown' };
    
    // WMO Weather codes mapping
    // Clear sky: 0, 1
    // Partly cloudy: 2, 3
    // Cloudy: 45, 48
    // Fog: 45, 48
    // Drizzle: 51-57
    // Rain: 61-67, 80-82
    // Snow: 71-77
    // Thunderstorm: 95-99
    
    if (weatherCode === 0 || weatherCode === 1) {
      return { condition: 'Clear', icon: '☀️', className: 'weather-clear' };
    } else if (weatherCode >= 2 && weatherCode <= 3) {
      return { condition: 'Partly Cloudy', icon: '⛅', className: 'weather-partly-cloudy' };
    } else if (weatherCode === 45 || weatherCode === 48) {
      return { condition: 'Foggy', icon: '🌫️', className: 'weather-foggy' };
    } else if (weatherCode >= 51 && weatherCode <= 57) {
      return { condition: 'Drizzle', icon: '🌦️', className: 'weather-drizzle' };
    } else if (weatherCode >= 61 && weatherCode <= 67 || weatherCode >= 80 && weatherCode <= 82) {
      return { condition: 'Rainy', icon: '🌧️', className: 'weather-rainy' };
    } else if (weatherCode >= 71 && weatherCode <= 77) {
      return { condition: 'Snowy', icon: '❄️', className: 'weather-snowy' };
    } else if (weatherCode >= 95 && weatherCode <= 99) {
      // If thunderstorm but precipitation is low (< 10mm), show as Rainy instead
      if (totalPrecipitation < 10) {
        return { condition: 'Rainy', icon: '🌧️', className: 'weather-rainy' };
      }
      return { condition: 'Thunderstorm', icon: '⛈️', className: 'weather-thunderstorm' };
    }
    
    return { condition: 'Cloudy', icon: '☁️', className: 'weather-cloudy' };
  };

  const weatherInfo = getWeatherCondition();
  const hasPrecipitation = totalPrecipitation > 0;

  // Map type codes to display names
  const getTypeDisplayName = (type) => {
    if (!type) return 'N/A';
    const typeLower = type.toLowerCase();
    if (typeLower === 'spy') return 'Spray';
    if (typeLower === 'spd') return 'Spread';
    return type; // Return original if no mapping found
  };

  // Format time from ISO string
  const formatTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      // API times are in GMT; add +5:30 (19800000 ms) for Sri Lanka time
      const offsetMs = 5.5 * 60 * 60 * 1000;
      const adjustedDate = new Date(date.getTime() + offsetMs);
      return `${adjustedDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })} (GMT+5:30)`;
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className={`plan-weather-card ${weatherInfo.className}`}>
      {/* Card Header */}
      <div className="plan-card-header">
        <div className="plan-card-title-section">
          <h3 className="plan-card-estate">{plan.estate || 'Unknown Estate'}</h3>
          <span className="plan-card-city">{plan.city || 'N/A'}</span>
        </div>
        <div className="plan-card-weather-icon">
          {weatherInfo.icon}
        </div>
      </div>

      {/* Weather Condition */}
      <div className="plan-card-weather-condition">
        <span className="weather-condition-text">{weatherInfo.condition}</span>
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
              {totalPrecipitation.toFixed(1)}mm({rainSum.toFixed(1)}+{showersSum.toFixed(1)})
            </span>
          </div>
        )}

        {/* Wind */}
        {windSpeed !== undefined && (
          <div className="plan-card-detail-item">
            <span className="detail-label">Wind:</span>
            <span className="detail-value">
              <span>{Math.round(windSpeed)} km/h</span>
              {windGusts && (
                <span className="detail-subvalue">Gusts: {Math.round(windGusts)} km/h</span>
              )}
            </span>
          </div>
        )}

        {/* Sunrise/Sunset */}
        {(sunrise || sunset) && (
          <div className="plan-card-detail-item">
            <span className="detail-label">Sun:</span>
            <span className="detail-value">
              {formatTime(sunrise)} / {formatTime(sunset)}
            </span>
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

    </div>
  );
};

export default PlanWeatherCard;

