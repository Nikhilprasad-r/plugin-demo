'use client'
import { PluginConfig } from '@/core/pluginSystem/types/pluginTypes'

export const defaultPluginConfig: PluginConfig = {
  // Keep defaultZones structure for backward compatibility
  // but these won't be used when loading plugins
  defaultZones: {
    header: {
      pluginIds: ['navigation-menu'],
    },
    sidebar: {
      pluginIds: ['user-profile', 'weather-widget'],
     
    },
    content: {
      pluginIds: ['analytics-dashboard', 'task-manager'],
    },
    footer: {
      pluginIds: ['footer-links'],
    },
  },
  
  // We still maintain global configs to be applied to any plugins that match
  globalPluginConfigs: {
    'analytics-dashboard': {
      refreshInterval: 60,
      showDetailedMetrics: false,
    }, 
    'weather-widget': {
      location: 'auto',
      units: 'metric',
    },
  },
  
  // This is where all the actual plugin configurations will be stored
  pageConfigs: [],
  
  // Template for new pages
  defaultPageConfig: {
    zones: {
      header: {
        pluginIds: [],
      },
      sidebar: {
        pluginIds: [],
      },
      content: {
        pluginIds: [],
      },
      footer: {
        pluginIds: [],
      },
    },
  },
}

export default defaultPluginConfig