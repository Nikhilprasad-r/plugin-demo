import WeatherWidgetPlugin from './weatherWidget/WeatherWidget';
import TaskManagerPlugin from './taskManager/TaskManager';
import UserProfilePlugin from './userProfile/UserProfile';
import AnalyticsDashboardPlugin from './analyticsDashboard/AnalyticsDashboard';

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