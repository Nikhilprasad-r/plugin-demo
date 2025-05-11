import WeatherWidgetPlugin from './weather-widget/WeatherWidget';
import TaskManagerPlugin from './task-manager/TaskManager';
import UserProfilePlugin from './user-profile/UserProfile';
import AnalyticsDashboardPlugin from './analytics-dashboard/AnalyticsDashboard';

// Export all plugins
export const plugins = [
  WeatherWidgetPlugin,
  TaskManagerPlugin,
  UserProfilePlugin,
  AnalyticsDashboardPlugin
];

// Export the plugin IDs for easy access
export const pluginIds = {
  weatherWidget: WeatherWidgetPlugin.id,
  taskManager: TaskManagerPlugin.id,
  userProfile: UserProfilePlugin.id,
  analyticsDashboard: AnalyticsDashboardPlugin.id
};