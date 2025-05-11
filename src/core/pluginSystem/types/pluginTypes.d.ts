import React from 'react';

/**
 * Properties that are passed to all plugin components
 */
export interface PluginProps {
  zoneName: string;
  config?: Record<string, any>;
  instanceId: string;
}

/**
 * Interface that all plugins must implement
 */
export interface Plugin<T = Record<string, any>> {
  id: string;
  name: string;
  version: string;
  description?: string;
  allowedZones: string[];
  component: React.ComponentType<PluginProps & T>;
  defaultConfig?: Record<string, any>;
}

/**
 * Configuration for where plugins are rendered
 */
export interface PluginConfig {
  zones: {
    [zoneName: string]: {
      pluginIds: string[];
      pluginConfigs?: Record<string, Record<string, any>>;
    };
  };
  globalPluginConfigs?: Record<string, Record<string, any>>;
}

/**
 * Properties for the PluginContainer component
 */
export interface PluginContainerProps {
  zoneName: string;
  pluginIds?: string[];
  pluginConfigs?: Record<string, Record<string, any>>;
  className?: string;
}

/**
 * Interface for plugin loader service
 */
export interface PluginLoaderType {
  loadPlugin(path: string): Promise<Plugin>;
  loadPlugins(pluginPaths: string[]): Promise<Plugin[]>;
}

/**
 * Plugin registry interface
 */
export interface PluginRegistryType {
  registerPlugin(plugin: Plugin): void;
  unregisterPlugin(pluginId: string): void;
  getPlugin(pluginId: string): Plugin | undefined;
  getAllPlugins(): Plugin[];
  getPluginsForZone(zoneName: string): Plugin[];
}

/**
 * Plugin event system interface
 */
export interface PluginEventBusType {
  subscribe<T = any>(event: string, callback: (data?: T) => void): () => void;
  unsubscribe(event: string, callback: Function): void;
  publish<T = any>(event: string, data?: T): void;
}

/**
 * Interface for providing plugin context
 */
export interface PluginContextValue {
  getPlugin(pluginId: string): Plugin | undefined;
  getPluginsForZone(zoneName: string): Plugin[];
  loadPlugin(path: string): Promise<Plugin>;
  registerPlugin(plugin: Plugin): void;
  unregisterPlugin(pluginId: string): void;
  getConfig(): PluginConfig;
  updateConfig(config: PluginConfig): void;
  getAllPlugins: () => Plugin[]; 
  eventBus: IPluginEventBus;
}

export interface UsePluginConfigReturn {
  config: PluginConfig;
  updateConfig: (newConfig: PluginConfig) => void;
  getPluginConfig: <T = Record<string, any>>(pluginId: string, zoneName?: string) => T;
  setPluginConfig: (pluginId: string, config: Record<string, any>, zoneName?: string) => void;
  movePlugin: (pluginId: string, fromZone: string, toZone: string) => void;
  addPluginToZone: (pluginId: string, zoneName: string) => void;
  removePluginFromZone: (pluginId: string, zoneName: string) => void;
}

export interface UsePluginEventsReturn {
  subscribe: <T = any>(event: string, callback: (data?: T) => void) => void;
  publish: <T = any>(event: string, data?: T) => void;
}