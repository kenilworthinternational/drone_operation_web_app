import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaCloudSunRain,
  FaMapMarkerAlt,
  FaSpinner,
  FaSync,
} from 'react-icons/fa';
import {
  useGetMappingEstatesQuery,
  useGetMappingDivisionsByEstateQuery,
} from '../../../api/services NodeJs/mappingHierarchyApi';
import {
  clampDateWithinForecastWindow,
  clampDateRangeWithinForecastWindow,
  extractHourlyWeatherForDate,
  getTodayYmd,
  getWeatherByCoordinates,
  getWeatherByCoordinatesForRange,
  summarizeHourlyWeatherForDate,
} from '../../../api/services/weatherApi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DivisionCoordinateModal from '../shared/DivisionCoordinateModal';
import EstateCoordinateModal from '../shared/EstateCoordinateModal';
import { hasCoordinates } from '../shared/coordinateUtils';
import './weatherPrediction.css';

const MAX_FORECAST_WINDOW_DAYS = 15;

function getForecastWindowBounds() {
  const today = new Date();
  const min = new Date(today);
  min.setDate(today.getDate() - MAX_FORECAST_WINDOW_DAYS);
  const max = new Date(today);
  max.setDate(today.getDate() + MAX_FORECAST_WINDOW_DAYS);
  return {
    min: min.toLocaleDateString('en-CA'),
    max: max.toLocaleDateString('en-CA'),
  };
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function formatCoord(value) {
  const n = toNumber(value);
  return n == null ? null : n.toFixed(5);
}

function divisionHasCoordinates(division) {
  return hasCoordinates(division);
}

function classifyHourlyRain(rainMm) {
  const rain = toNumber(rainMm);
  if (rain == null || rain <= 0) return 'No rain';
  if (rain < 2.5) return 'Slight / Light Rain';
  if (rain <= 7.5) return 'Moderate Rain';
  if (rain <= 50) return 'Heavy Rain';
  return 'Violent / Torrential Rain';
}

function formatHour(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDateLabel(ymd) {
  if (!ymd) return '—';
  const d = new Date(`${ymd}T12:00:00`);
  if (Number.isNaN(d.getTime())) return ymd;
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function ymdToLocalDate(ymd) {
  if (!ymd) return new Date();
  const [y, m, d] = String(ymd).split('-').map(Number);
  return new Date(y, m - 1, d);
}

function localDateToYmd(date) {
  if (!date) return getTodayYmd();
  return date.toLocaleDateString('en-CA');
}

function clampLocalDate(date, minDateObj, maxDateObj) {
  if (!date) return null;
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (d < minDateObj) return new Date(minDateObj);
  if (d > maxDateObj) return new Date(maxDateObj);
  return d;
}

const WeatherPredictionPage = () => {
  const todayYmd = getTodayYmd();
  const { min: minDate, max: maxDate } = useMemo(() => getForecastWindowBounds(), []);
  const minDateObj = useMemo(() => ymdToLocalDate(minDate), [minDate]);
  const maxDateObj = useMemo(() => ymdToLocalDate(maxDate), [maxDate]);
  const todayDateObj = useMemo(() => ymdToLocalDate(todayYmd), [todayYmd]);

  const [selectedEstateId, setSelectedEstateId] = useState('');
  const [selectedDivisionId, setSelectedDivisionId] = useState('');
  const [dateMode, setDateMode] = useState('single');
  const [singleDate, setSingleDate] = useState(todayYmd);
  const [dateRange, setDateRange] = useState([todayDateObj, todayDateObj]);
  const [rangeStartDate, rangeEndDate] = dateRange;
  const [hourlySelectedDate, setHourlySelectedDate] = useState(todayYmd);
  const [weatherResult, setWeatherResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coordinateModalDivision, setCoordinateModalDivision] = useState(null);
  const [coordinateModalEstate, setCoordinateModalEstate] = useState(null);

  const { data: estatesResponse = [], isLoading: estatesLoading } = useGetMappingEstatesQuery({});
  const estates = useMemo(() => estatesResponse?.data || [], [estatesResponse]);

  const estateIdNum = selectedEstateId ? Number(selectedEstateId) : null;
  const { data: divisionsResponse = [], isLoading: divisionsLoading } = useGetMappingDivisionsByEstateQuery(
    estateIdNum,
    { skip: !estateIdNum }
  );
  const divisions = useMemo(() => divisionsResponse?.data || [], [divisionsResponse]);

  const selectedDivision = useMemo(
    () => divisions.find((d) => String(d.id) === String(selectedDivisionId)) || null,
    [divisions, selectedDivisionId]
  );

  const selectedEstate = useMemo(
    () => estates.find((e) => String(e.id) === String(selectedEstateId)) || null,
    [estates, selectedEstateId]
  );

  const activeDates = useMemo(() => {
    if (dateMode === 'single') {
      const d = clampDateWithinForecastWindow(singleDate);
      return { startDate: d, endDate: d, single: d, complete: true };
    }
    const start = clampDateWithinForecastWindow(localDateToYmd(rangeStartDate));
    if (!rangeEndDate) {
      return { startDate: start, endDate: start, single: null, complete: false };
    }
    const { startDate, endDate } = clampDateRangeWithinForecastWindow(
      localDateToYmd(rangeStartDate),
      localDateToYmd(rangeEndDate)
    );
    return { startDate, endDate, single: null, complete: true };
  }, [dateMode, singleDate, rangeStartDate, rangeEndDate]);

  const fetchWeather = useCallback(async () => {
    if (!selectedDivision || !divisionHasCoordinates(selectedDivision)) return;
    const lat = toNumber(selectedDivision.latitude);
    const lon = toNumber(selectedDivision.longitude);
    if (lat == null || lon == null) return;

    setLoading(true);
    setError(null);
    try {
      if (dateMode === 'single') {
        const result = await getWeatherByCoordinates(lat, lon, activeDates.startDate);
        setWeatherResult({ mode: 'single', ...result });
        setHourlySelectedDate(result.selectedDate);
      } else {
        const result = await getWeatherByCoordinatesForRange(lat, lon, activeDates.startDate, activeDates.endDate);
        setWeatherResult({ mode: 'range', ...result });
        const defaultHourly =
          result.startDate <= todayYmd && todayYmd <= result.endDate
            ? todayYmd
            : result.startDate;
        setHourlySelectedDate(defaultHourly);
      }
    } catch (err) {
      setWeatherResult(null);
      setError(err?.message || 'Failed to load weather data');
    } finally {
      setLoading(false);
    }
  }, [selectedDivision, dateMode, activeDates.startDate, activeDates.endDate, todayYmd]);

  useEffect(() => {
    if (!selectedDivisionId || !divisionHasCoordinates(selectedDivision)) {
      setWeatherResult(null);
      return;
    }
    if (dateMode === 'range' && !activeDates.complete) return;
    fetchWeather();
  }, [
    selectedDivisionId,
    selectedDivision,
    dateMode,
    activeDates.startDate,
    activeDates.endDate,
    activeDates.complete,
    fetchWeather,
  ]);

  const hourlyRows = useMemo(() => {
    if (!weatherResult?.raw || !hourlySelectedDate) return [];
    return extractHourlyWeatherForDate(weatherResult.raw, hourlySelectedDate);
  }, [weatherResult, hourlySelectedDate]);

  const dailyRows = useMemo(() => {
    if (!weatherResult) return [];
    if (weatherResult.mode === 'range') return weatherResult.daily || [];
    if (weatherResult.daily) return [weatherResult.daily];
    return [];
  }, [weatherResult]);

  const showCurrent = useMemo(() => {
    if (!weatherResult?.current) return false;
    if (weatherResult.mode === 'single') return activeDates.startDate === todayYmd;
    return activeDates.startDate <= todayYmd && activeDates.endDate >= todayYmd;
  }, [weatherResult, activeDates, todayYmd]);

  const handleSingleDateChange = (value) => {
    setSingleDate(clampDateWithinForecastWindow(value));
  };

  const handleDateRangeChange = (update) => {
    const [start, end] = update;
    if (!start) {
      setDateRange(update);
      return;
    }
    const clampedStart = clampLocalDate(start, minDateObj, maxDateObj);
    const clampedEnd = end ? clampLocalDate(end, minDateObj, maxDateObj) : null;
    if (clampedEnd && clampedEnd < clampedStart) {
      setDateRange([clampedStart, clampedStart]);
      return;
    }
    setDateRange([clampedStart, clampedEnd]);
  };

  const openCoordinateModal = (division, event) => {
    event?.stopPropagation();
    event?.preventDefault();
    setCoordinateModalDivision(division);
  };

  const openEstateCoordinateModal = () => {
    if (selectedEstate) setCoordinateModalEstate(selectedEstate);
  };

  const renderLocationPanel = () => (
    <aside className="weather-pred-panel weather-pred-sidebar">
      <h2 className="weather-pred-panel-title">Location</h2>
      <label className="weather-pred-date-field" htmlFor="wp-estate-select">
        <span style={{ display: 'none' }}>Estate</span>
      </label>
      <select
        id="wp-estate-select"
        className="weather-pred-select"
        value={selectedEstateId}
        onChange={(e) => {
          setSelectedEstateId(e.target.value);
          setSelectedDivisionId('');
          setWeatherResult(null);
        }}
        disabled={estatesLoading}
      >
        <option value="">Select estate…</option>
        {estates.map((estate) => (
          <option key={estate.id} value={estate.id}>
            {estate.estate}
          </option>
        ))}
      </select>

      {selectedEstate && !hasCoordinates(selectedEstate) ? (
        <div className="weather-pred-estate-missing">
          <button type="button" className="weather-pred-map-link" onClick={openEstateCoordinateModal}>
            Set Estate Coordinates
          </button>
        </div>
      ) : selectedEstate && hasCoordinates(selectedEstate) ? (
        <div className="weather-pred-estate-coords">
          <p className="weather-pred-division-coords">
            Lat {formatCoord(selectedEstate.latitude)} · Lon {formatCoord(selectedEstate.longitude)}
          </p>
          <button type="button" className="weather-pred-map-link" onClick={openEstateCoordinateModal}>
            View on map
          </button>
        </div>
      ) : null}

      {!selectedEstateId ? (
        <p className="weather-pred-division-meta weather-pred-sidebar-hint">
          Choose an estate to list its divisions.
        </p>
      ) : divisionsLoading ? (
        <div className="weather-pred-loading weather-pred-loading--compact">
          <FaSpinner className="spin" /> Loading divisions…
        </div>
      ) : divisions.length === 0 ? (
        <p className="weather-pred-division-meta weather-pred-sidebar-hint">
          No divisions found for this estate.
        </p>
      ) : (
        <>
          <p className="weather-pred-division-count">
            {divisions.length} division{divisions.length !== 1 ? 's' : ''}
          </p>
          <div className="weather-pred-division-grid">
          {divisions.map((division) => {
            const hasCoords = divisionHasCoordinates(division);
            const lat = formatCoord(division.latitude);
            const lon = formatCoord(division.longitude);
            const isSelected = String(division.id) === String(selectedDivisionId);
            return (
              <div
                key={division.id}
                role="button"
                tabIndex={0}
                className={`weather-pred-division-card${isSelected ? ' is-selected' : ''}${!hasCoords ? ' is-missing-coords' : ''}`}
                onClick={() => setSelectedDivisionId(String(division.id))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedDivisionId(String(division.id));
                  }
                }}
              >
                <div className="weather-pred-division-card-top">
                  <span className="weather-pred-division-name">{division.division}</span>
                  {hasCoords ? (
                    <button
                      type="button"
                      className="weather-pred-coords-ready"
                      title="View on map"
                      aria-label="View on map"
                      onClick={(e) => openCoordinateModal(division, e)}
                    >
                      <FaMapMarkerAlt />
                    </button>
                  ) : (
                    <span className="weather-pred-badge-missing">Missing</span>
                  )}
                </div>
                {hasCoords ? (
                  <>
                    <p className="weather-pred-division-coords">
                      Lat {lat} · Lon {lon}
                    </p>
                    <button
                      type="button"
                      className="weather-pred-map-link"
                      onClick={(e) => openCoordinateModal(division, e)}
                    >
                      View on map
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="weather-pred-map-link"
                    onClick={(e) => openCoordinateModal(division, e)}
                  >
                    Set coordinates
                  </button>
                )}
              </div>
            );
          })}
        </div>
        </>
      )}
    </aside>
  );

  const renderReport = () => {
    if (!selectedEstateId) {
      return (
        <div className="weather-pred-empty">
          Select an estate and division to view weather for that location.
        </div>
      );
    }
    if (!selectedDivisionId) {
      return (
        <div className="weather-pred-empty">
          Select a division to load weather using its coordinates.
        </div>
      );
    }
    if (!divisionHasCoordinates(selectedDivision)) {
      return (
        <div className="weather-pred-empty">
          <strong>Coordinates required</strong>
          <p className="weather-pred-empty-note">
            This division has no latitude / longitude. Set coordinates to load weather for this location.
          </p>
          <button
            type="button"
            className="weather-pred-map-link weather-pred-empty-action"
            onClick={() => openCoordinateModal(selectedDivision)}
          >
            Set coordinates
          </button>
        </div>
      );
    }
    if (error) {
      return (
        <div className="weather-pred-error">
          <strong>Could not load weather</strong>
          <p className="weather-pred-empty-note">{error}</p>
          <button type="button" onClick={fetchWeather}>
            Retry
          </button>
        </div>
      );
    }
    if (loading && !weatherResult) {
      return (
        <div className="weather-pred-loading">
          <FaSpinner className="spin" /> Loading forecast…
        </div>
      );
    }
    if (!weatherResult) {
      return (
        <div className="weather-pred-empty">
          No weather data available for the selected period.
        </div>
      );
    }

    const current = weatherResult.current;

    return (
      <div className="weather-pred-report-content">
        {showCurrent && current ? (
          <section className="weather-pred-section">
            <div className="weather-pred-section-header">Current conditions</div>
            <div className="weather-pred-report-grid weather-pred-report-grid--inset">
              <div className="weather-pred-stat-card">
                <div className="weather-pred-stat-label">Temperature</div>
                <div className="weather-pred-stat-value">
                  {toNumber(current.temperature_2m) != null ? `${toNumber(current.temperature_2m).toFixed(1)} °C` : '—'}
                </div>
              </div>
              <div className="weather-pred-stat-card">
                <div className="weather-pred-stat-label">Wind</div>
                <div className="weather-pred-stat-value">
                  {toNumber(current.wind_speed_10m) != null
                    ? `${toNumber(current.wind_speed_10m).toFixed(1)} km/h`
                    : '—'}
                </div>
              </div>
              <div className="weather-pred-stat-card">
                <div className="weather-pred-stat-label">Rain</div>
                <div className="weather-pred-stat-value">
                  {toNumber(current.rain) != null ? `${toNumber(current.rain).toFixed(1)} mm` : '—'}
                </div>
              </div>
              <div className="weather-pred-stat-card">
                <div className="weather-pred-stat-label">Precipitation</div>
                <div className="weather-pred-stat-value">
                  {toNumber(current.precipitation) != null
                    ? `${toNumber(current.precipitation).toFixed(1)} mm`
                    : '—'}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section
          className={`weather-pred-section${dailyRows.length > 6 ? ' weather-pred-section--daily-scroll' : ''}`}
        >
          <div className="weather-pred-section-header">
            {dateMode === 'single' ? 'Daily summary' : 'Daily range'}
          </div>
          <div className="weather-pred-table-wrap">
            <table className="weather-pred-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Min / Max °C (06–18h)</th>
                  <th>Rain (mm)</th>
                  <th>Precip chance</th>
                  <th>Wind min / avg / max (06–18h)</th>
                </tr>
              </thead>
              <tbody>
                {dailyRows.map((row) => {
                  const summary = weatherResult.raw
                    ? summarizeHourlyWeatherForDate(weatherResult.raw, row.date)
                    : null;
                  const windMin = toNumber(summary?.windSpeedMin);
                  const windAvg = toNumber(summary?.windSpeedAvg);
                  const windMax = toNumber(summary?.windSpeedMax);
                  const tempMin = toNumber(summary?.temperatureMin ?? row.temperature_2m_min);
                  const tempMax = toNumber(summary?.temperatureMax ?? row.temperature_2m_max);
                  const isClickable = dateMode === 'range' && dailyRows.length > 1;
                  const isSelectedRow = row.date === hourlySelectedDate;
                  return (
                    <tr
                      key={row.date}
                      className={`${isClickable ? 'is-clickable' : ''}${isSelectedRow ? ' is-selected-row' : ''}`}
                      onClick={isClickable ? () => setHourlySelectedDate(row.date) : undefined}
                    >
                      <td>{formatDateLabel(row.date)}</td>
                      <td>
                        {tempMin != null && tempMax != null
                          ? `${tempMin.toFixed(1)} / ${tempMax.toFixed(1)}`
                          : '—'}
                      </td>
                      <td>{toNumber(row.rain_sum) != null ? toNumber(row.rain_sum).toFixed(1) : '—'}</td>
                      <td>
                        {toNumber(row.precipitation_probability_max) != null
                          ? `${toNumber(row.precipitation_probability_max).toFixed(0)}%`
                          : '—'}
                      </td>
                      <td>
                        {windMin != null || windAvg != null || windMax != null
                          ? `${windMin != null ? windMin.toFixed(1) : '—'} / ${windAvg != null ? windAvg.toFixed(1) : '—'} / ${windMax != null ? windMax.toFixed(1) : '—'} km/h`
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="weather-pred-section weather-pred-section--hourly">
          <div className="weather-pred-section-header">
            Hourly (06:00–18:00) — {formatDateLabel(hourlySelectedDate)}
            {dateMode === 'range' ? (
              <span className="weather-pred-section-header-note">
                (click a daily row to change day)
              </span>
            ) : null}
          </div>
          <div className="weather-pred-table-wrap weather-pred-table-wrap--scroll">
            <table className="weather-pred-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Temp °C</th>
                  <th>Humidity</th>
                  <th>Rain (mm)</th>
                  <th>Precip chance</th>
                  <th>Wind km/h</th>
                  <th>Rain level</th>
                </tr>
              </thead>
              <tbody>
                {hourlyRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="weather-pred-table-empty">
                      No hourly data for 06:00–18:00 on this day.
                    </td>
                  </tr>
                ) : (
                  hourlyRows.map((row) => (
                    <tr key={row.time}>
                      <td>{formatHour(row.time)}</td>
                      <td>{toNumber(row.temperature_2m) != null ? toNumber(row.temperature_2m).toFixed(1) : '—'}</td>
                      <td>
                        {toNumber(row.relative_humidity_2m) != null
                          ? `${toNumber(row.relative_humidity_2m).toFixed(0)}%`
                          : '—'}
                      </td>
                      <td>{toNumber(row.rain) != null ? toNumber(row.rain).toFixed(1) : '—'}</td>
                      <td>
                        {toNumber(row.precipitation_probability) != null
                          ? `${toNumber(row.precipitation_probability).toFixed(0)}%`
                          : '—'}
                      </td>
                      <td>{toNumber(row.wind_speed_10m) != null ? toNumber(row.wind_speed_10m).toFixed(1) : '—'}</td>
                      <td>{classifyHourlyRain(row.rain)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  };

  return (
    <div className="weather-pred-page">
      <header className="weather-pred-header">
        <div>
          <p className="weather-pred-eyebrow">Geo Spatial Management</p>
          <h1>
            <FaCloudSunRain style={{ marginRight: '0.5rem', verticalAlign: '-0.15em' }} />
            Weather Prediction
          </h1>
          <p className="weather-pred-subtitle">
            Division-level forecast from Open-Meteo using each division&apos;s coordinates. Dates are limited to ±
            {MAX_FORECAST_WINDOW_DAYS} days from today.
          </p>
        </div>
      </header>

      <div className="weather-pred-layout">
        {renderLocationPanel()}
        <div className="weather-pred-main">
          <div className="weather-pred-date-bar">
            <div className="weather-pred-mode-toggle">
              <button
                type="button"
                className={`weather-pred-mode-btn${dateMode === 'single' ? ' is-active' : ''}`}
                onClick={() => setDateMode('single')}
              >
                Single date
              </button>
              <button
                type="button"
                className={`weather-pred-mode-btn${dateMode === 'range' ? ' is-active' : ''}`}
                onClick={() => setDateMode('range')}
              >
                Date range
              </button>
            </div>
            {dateMode === 'single' ? (
              <div className="weather-pred-date-field">
                <label htmlFor="wp-single-date">Date</label>
                <input
                  id="wp-single-date"
                  type="date"
                  min={minDate}
                  max={maxDate}
                  value={singleDate}
                  onChange={(e) => handleSingleDateChange(e.target.value)}
                />
              </div>
            ) : (
              <div className="weather-pred-range-wrap">
                <div className="weather-pred-date-field">
                  <label htmlFor="wp-date-range">Date range</label>
                  <DatePicker
                    id="wp-date-range"
                    selectsRange
                    startDate={rangeStartDate}
                    endDate={rangeEndDate}
                    onChange={handleDateRangeChange}
                    dateFormat="dd/MM/yyyy"
                    minDate={minDateObj}
                    maxDate={maxDateObj}
                    isClearable={false}
                    className="weather-pred-range-input"
                    disabled={loading}
                  />
                </div>
              </div>
            )}
            <button
              type="button"
              className="weather-pred-fetch-btn"
              onClick={fetchWeather}
              disabled={
                loading ||
                !selectedDivisionId ||
                !divisionHasCoordinates(selectedDivision) ||
                (dateMode === 'range' && !activeDates.complete)
              }
            >
              {loading ? <FaSpinner className="spin" /> : <FaSync />}
              {loading ? 'Fetching…' : 'Fetch'}
            </button>
          </div>
          <div className="weather-pred-report">{renderReport()}</div>
        </div>
      </div>

      <DivisionCoordinateModal
        division={coordinateModalDivision}
        onClose={() => setCoordinateModalDivision(null)}
        onSaved={() => {
          if (coordinateModalDivision?.id) {
            setSelectedDivisionId(String(coordinateModalDivision.id));
          }
        }}
      />
      <EstateCoordinateModal
        estate={coordinateModalEstate}
        onClose={() => setCoordinateModalEstate(null)}
      />
    </div>
  );
};

export default WeatherPredictionPage;
