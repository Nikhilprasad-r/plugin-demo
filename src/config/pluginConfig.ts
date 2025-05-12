import { PluginConfig } from '@/core/pluginSystem/types/pluginTypes'

export const defaultPluginConfig: PluginConfig = {
  defaultZones: {
    header: {
      pluginIds: ['navigation-menu'],
    },
    sidebar: {
      pluginIds: ['user-profile', 'weather-widget'],
      pluginConfigs: {
        'weather-widget': {
          location: 'auto',
          units: 'metric',
        },
      },
    },
    content: {
      pluginIds: ['analytics-dashboard', 'task-manager'],
    },
    footer: {
      pluginIds: ['footer-links'],
    },
  },
  globalPluginConfigs: {
    'analytics-dashboard': {
      refreshInterval: 60,
      showDetailedMetrics: false,
    },
  },
  pageConfigs: [],
  defaultPageConfig: {
    zones: {
      // Default zones for new pages
      header: {
        pluginIds: [], // Empty by default
      },
      sidebar: {
        pluginIds: [], // Empty by default
      },
      content: {
        pluginIds: [], // Empty by default
      },
      footer: {
        pluginIds: [], // Empty by default
      },
    },
  },
}

export default defaultPluginConfig
