'use client';
import React, { useState, useEffect } from 'react';
import { usePluginEvents } from '../../core/pluginSystem';
import { PluginProps } from '@/core/pluginSystem/types/pluginTypes';

interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
  icon: string;
}

interface WeatherWidgetConfig {
  location?: string;
  units?: 'metric' | 'imperial';
  refreshInterval?: number;
}

// Mock API for demo purposes
const fetchWeatherData = async (
  location: string,
  units: 'metric' | 'imperial'
): Promise<WeatherData> => {
  // In a real app, this would be an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        temperature: units === 'metric' ? 22 : 72,
        condition: 'Sunny',
        location: location === 'auto' ? 'New York' : location,
        icon: '☀️',
      });
    }, 500);
  });
};

const WeatherWidget: React.FC<PluginProps & WeatherWidgetConfig> = ({
  zoneName,
  config,
  instanceId,
}) => {
  const { location = 'auto', units = 'metric', refreshInterval = 300 } = config || {};
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { publish } = usePluginEvents();

  useEffect(() => {
    let isMounted = true;

    const loadWeather = async () => {
      try {
        setLoading(true);
        const data = await fetchWeatherData(location, units);
        if (isMounted) {
          setWeather(data);
          setError(null);
          publish('weather:updated', data);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load weather data');
          console.error(err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadWeather();
    
    // Set up refresh interval
    const intervalId = setInterval(loadWeather, refreshInterval * 1000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [location, units, refreshInterval, publish]);

  if (loading && !weather) {
    return (
      <div className="weather-widget loading p-4 text-sm text-gray-500">Loading weather data...</div>
    );
  }

  if (error) {
    return (
      <div className="weather-widget error p-4 bg-red-50 text-red-500 rounded-md flex flex-col gap-2">
        <span className="error-message">{error}</span>
        <button
          className="text-sm text-blue-600 underline"
          onClick={() => {
            setLoading(true);
            setError(null);
            fetchWeatherData(location, units)
              .then((data) => {
                setWeather(data);
                setLoading(false);
              })
              .catch(() => {
                setError('Failed to load weather data');
                setLoading(false);
              });
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="weather-widget p-4 bg-white rounded-md shadow-sm flex items-center gap-4">
      <div className="weather-icon text-4xl">{weather.icon}</div>
      <div className="weather-info flex flex-col text-sm text-gray-800">
        <div className="weather-location font-medium">{weather.location}</div>
        <div className="weather-temperature text-xl font-bold">
          {weather.temperature}°{units === 'metric' ? 'C' : 'F'}
        </div>
        <div className="weather-condition text-gray-500">{weather.condition}</div>
      </div>
      <div className="widget-footer ml-auto text-xs text-gray-300">Zone: {zoneName}</div>
    </div>
  );
};

// Define the plugin metadata
const WeatherWidgetPlugin = {
  id: 'weather-widget',
  name: 'Weather Widget',
  version: '1.0.0',
  description: 'Displays current weather information',
  allowedZones: ['sidebar', 'content', 'header'],
  component: WeatherWidget,
  defaultConfig: {
    location: 'auto',
    units: 'metric',
    refreshInterval: 300,
  },
};

export default WeatherWidgetPlugin;
