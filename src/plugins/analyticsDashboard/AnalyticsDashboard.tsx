import React, { useState, useEffect } from 'react';
import { PluginProps } from '../../core/pluginSystem';
import { usePluginEvents } from '../../core/pluginSystem';

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

  if (loading && !analytics) {
    return (
      <div className="analytics-dashboard">
        <div className="loading">Loading analytics data...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="analytics-dashboard error">
        <div className="error-message">{error}</div>
        <button onClick={() => {
          setLoading(true);
          setError(null);
          fetchAnalyticsData(dataRange)
            .then(data => {
              setAnalytics(data);
              setLoading(false);
            })
            .catch(err => {
              setError('Failed to load analytics data');
              setLoading(false);
            });
        }}>
          Retry
        </button>
      </div>
    );
  }
  
  if (!analytics) {
    return null;
  }

  return (
    <div className="analytics-dashboard">
      <h3>Analytics Dashboard</h3>
      
      <div className="data-range-selector">
        <select 
          value={dataRange} 
          onChange={(e) => {
            publish('analytics:range-change', e.target.value);
          }}
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{analytics.pageViews}</div>
          <div className="metric-label">Page Views</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-value">{analytics.uniqueVisitors}</div>
          <div className="metric-label">Unique Visitors</div>
        </div>
        
        {showDetailedMetrics && (
          <>
            <div className="metric-card">
              <div className="metric-value">{analytics.bounceRate.toFixed(1)}%</div>
              <div className="metric-label">Bounce Rate</div>
            </div>
            
            <div className="metric-card">
              <div className="metric-value">{Math.round(analytics.avgSessionDuration)}s</div>
              <div className="metric-label">Avg. Session</div>
            </div>
          </>
        )}
      </div>
      
      <div className="widget-footer">
        <small>Zone: {zoneName}</small>
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