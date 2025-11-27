import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppDispatch } from '../../../store/hooks';
import { baseApi } from '../../../api/services/allEndpoints';
import { getWeatherForCity } from '../../../api/services/weatherApi';
import { enrichPlanWithCity } from '../../../utils/estateCityMapping';
import PlanWeatherCard from './PlanWeatherCard';
import '../../../styles/plansWithWeather.css';

const extractWeatherForDate = (weatherData, date) => {
  if (!weatherData?.daily?.time || !date) {
    return weatherData;
  }

  const index = weatherData.daily.time.findIndex((time) => time === date);
  if (index === -1) {
    return weatherData;
  }

  const narrowedDaily = {};
  Object.keys(weatherData.daily).forEach((key) => {
    const values = weatherData.daily[key];
    if (Array.isArray(values)) {
      narrowedDaily[key] = [values[index]];
    } else {
      narrowedDaily[key] = values;
    }
  });

  return {
    ...weatherData,
    daily: narrowedDaily,
  };
};

const PlansWithWeather = () => {
  const dispatch = useAppDispatch();
  
  // Get today's date as default
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  const openNativeDatePicker = (event) => {
    const input = event?.currentTarget;
    if (typeof input?.showPicker === 'function') {
      event.preventDefault();
      input.showPicker();
    }
  };

  // Fetch plans for the selected date
  const { data: plansData, isLoading: plansLoading, error: plansError } = useQuery({
    queryKey: ['plansByDate', selectedDate],
    queryFn: async () => {
      const result = await dispatch(
        baseApi.endpoints.getPlansByDate.initiate(selectedDate)
      );
      return result.data;
    },
    enabled: !!selectedDate,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });

  // Process plans and enrich with city information
  const enrichedPlans = useMemo(() => {
    if (!plansData || plansData.status !== 'true') return [];
    
    const plans = [];
    // Extract plans from the response (plans are indexed as "0", "1", "2", etc.)
    Object.keys(plansData).forEach((key) => {
      if (!isNaN(key) && plansData[key]) {
        plans.push(enrichPlanWithCity(plansData[key]));
      }
    });
    
    return plans;
  }, [plansData]);

  // Get unique cities from plans
  const uniqueCities = useMemo(() => {
    const cities = new Set();
    enrichedPlans.forEach(plan => {
      if (plan.city) {
        cities.add(plan.city);
      }
    });
    return Array.from(cities);
  }, [enrichedPlans]);

  // Fetch weather for each unique city
  const weatherQueries = useQuery({
    queryKey: ['weatherForCities', uniqueCities, selectedDate],
    queryFn: async () => {
      // Fetch weather for all cities in parallel
      const weatherPromises = uniqueCities.map(city => 
        getWeatherForCity(city, 1, selectedDate, selectedDate)
          .then(result => {
            // Narrow the weather response down to the selected date (single-day)
            const narrowedWeather = extractWeatherForDate(result.weather, selectedDate);
            return { ...result, weather: narrowedWeather };
          })
          .catch(error => {
            console.error(`Error fetching weather for ${city}:`, error);
            return { city, error: true };
          })
      );
      
      const weatherResults = await Promise.all(weatherPromises);
      
      // Create a map of city to weather data
      const weatherMap = {};
      weatherResults.forEach(result => {
        if (result && !result.error && result.city && result.weather) {
          weatherMap[result.city] = result.weather;
        }
      });
      
      return weatherMap;
    },
    enabled: uniqueCities.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes - weather doesn't change that often
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const weatherData = weatherQueries.data || {};

  // Combine plans with weather data
  const plansWithWeather = useMemo(() => {
    return enrichedPlans.map(plan => ({
      ...plan,
      weather: weatherData[plan.city] || null,
    }));
  }, [enrichedPlans, weatherData]);

  const isLoading = plansLoading || weatherQueries.isLoading;
  const hasError = plansError || weatherQueries.error;

  // Check if selected date is today
  const isToday = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    return selectedDate === todayStr;
  };

  // Check if selected date is tomorrow
  const isTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    return selectedDate === tomorrowStr;
  };

  // Get formatted date display (always show full date)
  const getFormattedDate = () => {
    const date = new Date(selectedDate);
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
          {!isLoading && !hasError && enrichedPlans.length > 0 && (
            <p className="plans-weather-count">
              {enrichedPlans.length} {enrichedPlans.length === 1 ? 'Plan' : 'Plans'} Scheduled
            </p>
          )}
        </div>
        <div className="plans-weather-date-picker">
          <label htmlFor="plan-date">Select Date:</label>
          <input
            id="plan-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
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

