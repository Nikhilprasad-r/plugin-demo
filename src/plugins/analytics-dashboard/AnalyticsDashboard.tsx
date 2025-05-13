'use client';

import React, { useState, useEffect } from 'react';
import { usePluginEvents } from '../../pluginSystem';
import { PluginProps } from '@/pluginSystem/types/pluginTypes';

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
}

interface AnalyticsDashboardConfig {
  refreshInterval?: number;
  showDetailedMetrics?: boolean;
  dataRange?: 'today' | 'week' | 'month';
}

// Mock API for demo purposes
const fetchAnalyticsData = async (range: string): Promise<AnalyticsData> => {
  // In a real app, this would be an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate random data based on the range
      let multiplier = 1;
      if (range === 'week') multiplier = 7;
      if (range === 'month') multiplier = 30;
      
      resolve({
        pageViews: Math.floor(Math.random() * 1000) * multiplier,
        uniqueVisitors: Math.floor(Math.random() * 500) * multiplier,
        bounceRate: Math.random() * 100,
        avgSessionDuration: Math.random() * 300
      });
    }, 800);
  });
};

const AnalyticsDashboard: React.FC<PluginProps & AnalyticsDashboardConfig> = ({
  zoneName,
  config,
  instanceId
}) => {
  const {
    refreshInterval = 60,
    showDetailedMetrics = false,
    dataRange = 'today'
  } = config || {};

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { publish, subscribe } = usePluginEvents();

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const data = await fetchAnalyticsData(dataRange);

        if (isMounted) {
          setAnalytics(data);
          setError(null);
          
          // Publish analytics data for other plugins
          publish('analytics:updated', data);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load analytics data');
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();
    
    // Set up refresh interval
    const intervalId = setInterval(loadAnalytics, refreshInterval * 1000);
    
    // Listen for task updates to update visitor count (demo of plugin communication)
    subscribe('tasks:added', () => {
      if (analytics && isMounted) {
        setAnalytics(prev => prev ? {
          ...prev,
          pageViews: prev.pageViews + 1
        } : null);
      }
    });

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [dataRange, refreshInterval, publish, subscribe]);

  // loading
  if (loading && !analytics) {
    return (
      <div className="analytics-dashboard loading p-4 text-gray-500 animate-pulse">Loading analytics data...</div>
    );
  }

  if (error) {
    return (
      <div className="analytics-dashboard error p-4 bg-red-100 border border-red-300 text-red-700 rounded-md">
        <p>{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            fetchAnalyticsData(dataRange)
              .then(data => {
                setAnalytics(data);
                setLoading(false);
              })
              .catch(() => {
                setError('Failed to load analytics data');
                setLoading(false);
              });
          }}
          className="mt-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="analytics-dashboard p-4 bg-white rounded-md shadow-md space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Analytics Dashboard</h3>
        <select
          value={dataRange}
          onChange={(e) => publish('analytics:range-change', e.target.value)}
          className="data-range-selector border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      <div className="metrics-grid grid grid-cols-2 gap-4 md:grid-cols-4 text-center">
        <div className="metric-card p-3 bg-blue-50 rounded">
          <div className="metric-value text-xl font-bold text-blue-600">{analytics.pageViews}</div>
          <div className="metric-label text-sm text-gray-600">Page Views</div>
        </div>

        <div className="metric-card p-3 bg-green-50 rounded">
          <div className="metric-value text-xl font-bold text-green-600">{analytics.uniqueVisitors}</div>
          <div className="metric-label text-sm text-gray-600">Unique Visitors</div>
        </div>

        {showDetailedMetrics && (
          <>
            <div className="metric-card p-3 bg-yellow-50 rounded">
              <div className="metric-value text-xl font-bold text-yellow-600">{analytics.bounceRate.toFixed(1)}%</div>
              <div className="metric-label text-sm text-gray-600">Bounce Rate</div>
            </div>

            <div className="metric-card p-3 bg-purple-50 rounded">
              <div className="metric-value text-xl font-bold text-purple-600">{Math.round(analytics.avgSessionDuration)}s</div>
              <div className="metric-label text-sm text-gray-600">Avg. Session</div>
            </div>
          </>
        )}
      </div>

      <div className="widget-footer text-xs text-gray-400 text-right">
        Zone: {zoneName}
      </div>
    </div>
  );
};

// Define the plugin metadata
const AnalyticsDashboardPlugin = {
  id: 'analytics-dashboard',
  name: 'Analytics Dashboard',
  version: '1.0.0',
  description: 'Displays website analytics data',
  allowedZones: ['content', 'sidebar'],
  component: AnalyticsDashboard,
  defaultConfig: {
    refreshInterval: 60,
    showDetailedMetrics: false,
    dataRange: 'today'
  }
};

export default AnalyticsDashboardPlugin;