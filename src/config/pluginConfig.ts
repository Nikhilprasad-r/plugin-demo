import { PluginConfig } from '../core/pluginSystem';

export const defaultPluginConfig: PluginConfig = {
  zones: {
    header: {
      pluginIds: ['navigation-menu']
    },
    sidebar: {
      pluginIds: ['user-profile', 'weather-widget'],
      pluginConfigs: {
        'weather-widget': {
          location: 'auto',
          units: 'metric'
        }
      }
    },
    content: {
      pluginIds: ['analytics-dashboard', 'task-manager']
    },
    footer: {
      pluginIds: ['footer-links']
    }
  },
  globalPluginConfigs: {
    'analytics-dashboard': {
      refreshInterval: 60,
      showDetailedMetrics: false
    }
  }
};