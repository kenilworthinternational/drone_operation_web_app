import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAppDispatch } from '../../../store/hooks';
import { baseApi } from '../../../api/services/allEndpoints';
import {
  clampDateWithinForecastWindow,
  getTodayYmd,
  getWeatherByCoordinates,
} from '../../../api/services/weatherApi';
import { useGetMappingEstatesQuery } from '../../../api/services NodeJs/mappingHierarchyApi';
import PlanWeatherCard from './PlanWeatherCard';
import { useNavbarPermissions } from '../../../hooks/useNavbarPermissions';
import {
  FORECAST_PATH,
  isForecastAllowedWing,
  normalizeWingTitle,
} from '../../../config/wingHubDisplay';
import '../../../styles/plansWithWeather.css';

const MAX_WINDOW_DAYS = 15;
const DAY_MS = 24 * 60 * 60 * 1000;
const dateFromYmd = (ymd) => {
  const [y, m, d] = String(ymd).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
const toYmd = (date) => date.toLocaleDateString('en-CA');

const PlansWithWeather = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { allowedPaths, loadingPermissions } = useNavbarPermissions();
  const searchParams = new URLSearchParams(location.search);
  const wingParam = searchParams.get('wing');
  const tabParam = searchParams.get('tab');

  useEffect(() => {
    if (tabParam === 'activate-requests') {
      const params = new URLSearchParams(location.search);
      params.delete('tab');
      navigate(
        {
          pathname: '/home/planActivateRequests',
          search: params.toString() ? `?${params.toString()}` : '',
        },
        { replace: true }
      );
    }
  }, [tabParam, location.search, navigate]);

  useEffect(() => {
    if (loadingPermissions) return;
    if (!allowedPaths.includes(FORECAST_PATH)) {
      navigate('/home', { replace: true });
      return;
    }
    const normalized = normalizeWingTitle(wingParam ? decodeURIComponent(wingParam) : null);
    if (normalized && !isForecastAllowedWing(normalized)) {
      navigate('/home', { replace: true });
    }
  }, [wingParam, allowedPaths, loadingPermissions, navigate]);

  const todayYmd = getTodayYmd();
  const todayDate = dateFromYmd(todayYmd);
  const minDate = useMemo(() => {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - MAX_WINDOW_DAYS);
    return toYmd(d);
  }, [todayYmd]);
  const maxDate = useMemo(() => {
    const d = new Date(todayDate);
    d.setDate(d.getDate() + MAX_WINDOW_DAYS);
    return toYmd(d);
  }, [todayYmd]);
  const [selectedDate, setSelectedDate] = useState(todayYmd);
  const safeSelectedDate = clampDateWithinForecastWindow(selectedDate);
  const { data: estatesResponse = {} } = useGetMappingEstatesQuery({});
  const estates = estatesResponse?.data || [];

  const openNativeDatePicker = (event) => {
    const input = event?.currentTarget;
    if (typeof input?.showPicker === 'function') {
      event.preventDefault();
      input.showPicker();
    }
  };

  useEffect(() => {
    if (selectedDate !== safeSelectedDate) {
      setSelectedDate(safeSelectedDate);
    }
  }, [selectedDate, safeSelectedDate]);

  // Fetch plans for the selected date
  const { data: plansData, isLoading: plansLoading, error: plansError } = useQuery({
    queryKey: ['plansByDate', safeSelectedDate],
    queryFn: async () => {
      const result = await dispatch(
        baseApi.endpoints.getPlansByDate.initiate(safeSelectedDate)
      );
      return result.data;
    },
    enabled: !!safeSelectedDate,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });

  const estatesById = useMemo(() => {
    const map = {};
    estates.forEach((estate) => {
      map[Number(estate.id)] = estate;
    });
    return map;
  }, [estates]);

  // Process plans and enrich with estate coordinates
  const plansWithEstateCoordinates = useMemo(() => {
    if (!plansData || plansData.status !== 'true') return [];
    const plans = [];
    Object.keys(plansData).forEach((key) => {
      if (!isNaN(key) && plansData[key]) {
        const plan = plansData[key];
        const estate = estatesById[Number(plan.estate_id)];
        const latitude = estate?.latitude != null && estate?.latitude !== '' ? Number(estate.latitude) : null;
        const longitude = estate?.longitude != null && estate?.longitude !== '' ? Number(estate.longitude) : null;
        const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
        plans.push({
          ...plan,
          latitude: hasCoordinates ? latitude : null,
          longitude: hasCoordinates ? longitude : null,
          hasCoordinates,
          coordinateKey: hasCoordinates ? `${latitude.toFixed(6)},${longitude.toFixed(6)}` : null,
        });
      }
    });
    return plans;
  }, [plansData, estatesById]);

  const uniqueCoordinateEntries = useMemo(() => {
    const map = new Map();
    plansWithEstateCoordinates.forEach((plan) => {
      if (plan.hasCoordinates && plan.coordinateKey && !map.has(plan.coordinateKey)) {
        map.set(plan.coordinateKey, {
          key: plan.coordinateKey,
          latitude: plan.latitude,
          longitude: plan.longitude,
        });
      }
    });
    return Array.from(map.values());
  }, [plansWithEstateCoordinates]);

  // Fetch weather for each unique coordinate pair
  const weatherQueries = useQuery({
    queryKey: ['weatherByCoordinates', uniqueCoordinateEntries, safeSelectedDate],
    queryFn: async () => {
      const weatherPromises = uniqueCoordinateEntries.map((entry) =>
        getWeatherByCoordinates(entry.latitude, entry.longitude, safeSelectedDate)
          .then((result) => ({ ...entry, weather: result }))
          .catch((error) => {
            console.error(`Error fetching weather for ${entry.key}:`, error);
            return { ...entry, error: true };
          })
      );
      const weatherResults = await Promise.all(weatherPromises);
      const weatherMap = {};
      weatherResults.forEach((result) => {
        if (result && !result.error && result.key && result.weather) {
          weatherMap[result.key] = result.weather;
        }
      });
      return weatherMap;
    },
    enabled: uniqueCoordinateEntries.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes - weather doesn't change that often
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const weatherData = weatherQueries.data || {};

  // Combine plans with weather data
  const plansWithWeather = useMemo(() => {
    return plansWithEstateCoordinates.map((plan) => ({
      ...plan,
      weather: plan.coordinateKey ? weatherData[plan.coordinateKey] || null : null,
      weatherUnavailableReason: plan.hasCoordinates ? null : 'Weather unavailable until coordinates are set',
    }));
  }, [plansWithEstateCoordinates, weatherData]);

  const isLoading = plansLoading || weatherQueries.isLoading;
  const hasError = plansError || weatherQueries.error;

  // Check if selected date is today
  const isToday = () => {
    return safeSelectedDate === todayYmd;
  };

  // Check if selected date is tomorrow
  const isTomorrow = () => {
    const tomorrow = new Date(todayDate.getTime() + DAY_MS);
    return safeSelectedDate === toYmd(tomorrow);
  };

  // Get formatted date display (always show full date)
  const getFormattedDate = () => {
    const date = dateFromYmd(safeSelectedDate);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Get header title based on date selection
  const getHeaderTitle = () => {
    if (isToday()) {
      return 'Today\'s Forecast';
    } else if (isTomorrow()) {
      return 'Tomorrow\'s Forecast';
    } else {
      return 'Plans Forecast';
    }
  };

  return (
    <div className="plans-with-weather-container">
      <ToastContainer position="top-right" autoClose={4000} />
      {/* Header with Date Picker */}
      {/* Header dimensions: width: 100% (full container width minus 40px padding), height: auto (min ~80px with padding) */}
      <div 
        className="plans-weather-header"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url(${process.env.PUBLIC_URL}/assets/images/cover.png)`
        }}
      >
        <div className="plans-weather-header-left">
          <h1 className="plans-weather-title">{getHeaderTitle()}</h1>
          <p className="plans-weather-date-display">{getFormattedDate()}</p>
          {!isLoading && !hasError && plansWithEstateCoordinates.length > 0 && (
            <p className="plans-weather-count">
              {plansWithEstateCoordinates.length} {plansWithEstateCoordinates.length === 1 ? 'Plan' : 'Plans'} Scheduled
            </p>
          )}
        </div>
        <div className="plans-weather-date-picker">
          <label htmlFor="plan-date">Select Date:</label>
          <input
            id="plan-date"
            type="date"
            value={safeSelectedDate}
            min={minDate}
            max={maxDate}
            onChange={(e) => setSelectedDate(clampDateWithinForecastWindow(e.target.value))}
            onClick={openNativeDatePicker}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                openNativeDatePicker(event);
              }
            }}
            className="plans-weather-date-input"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="plans-weather-loading">
          <div className="loading-spinner"></div>
          <p>Loading plans and weather data...</p>
        </div>
      )}

      {/* Error State */}
      {hasError && !isLoading && (
        <div className="plans-weather-error">
          <p>Error loading data. Please try again.</p>
          {plansError && <p className="error-detail">{plansError.message}</p>}
          {weatherQueries.error && <p className="error-detail">{weatherQueries.error.message}</p>}
        </div>
      )}

      {/* Plans Grid */}
      {!isLoading && !hasError && (
        <div className="plans-weather-content">
          {plansWithWeather.length === 0 ? (
            <div className="plans-weather-empty">
              <p>No plans found for the selected date.</p>
            </div>
          ) : (
            <div className="plans-weather-grid">
              {plansWithWeather.map((plan) => (
                <PlanWeatherCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlansWithWeather;

