import React from 'react'

/**
 * Properties that are passed to all plugin components
 */
export interface PluginProps {
  zoneName: string
  config?: Record<string, any>
  instanceId: string
}
// src/core/pluginSystem/types/pluginTypes.ts

export interface PluginZoneConfig {
  pluginIds: string[]
  pluginConfigs?: Record<string, Record<string, any>>
}

export interface PagePluginConfig {
  pageId: string
  zones: {
    [zoneName: string]: PluginZoneConfig
  }
}

export interface PluginConfig {
  /**
   * Default zone configurations that apply globally
   * unless overridden by page-specific configurations
   */
  defaultZones?: {
    [zoneName: string]: PluginZoneConfig
  }

  /**
   * Global plugin configurations that apply to all instances
   * unless overridden by zone or page-specific configs
   */
  globalPluginConfigs?: Record<string, Record<string, any>>

  /**
   * Page-specific configurations that override the defaults
   */
  pageConfigs: PagePluginConfig[]

  /**
   * Template used when creating new page configurations
   */
  defaultPageConfig?: {
    zones: {
      [zoneName: string]: Omit<PluginZoneConfig, 'pluginConfigs'>
    }
  }
}
/**
 * Interface that all plugins must implement
 */
export interface Plugin<T = Record<string, any>> {
  id: string
  name: string
  version: string
  description?: string
  allowedZones: string[]
  component: React.ComponentType<PluginProps & T>
  defaultConfig?: Record<string, any>
}

/**
 * Properties for the PluginContainer component
 */
export interface PluginContainerProps {
  zoneName: string
  pluginIds?: string[]
  pluginConfigs?: Record<string, Record<string, any>>
  className?: string
  pageId?: string
}

/**
 * Interface for plugin loader service
 */
export interface PluginLoaderType {
  loadPlugin(path: string): Promise<Plugin>
  loadPlugins(pluginPaths: string[]): Promise<Plugin[]>
}

/**
 * Plugin registry interface
 */
export interface PluginRegistryType {
  registerPlugin(plugin: Plugin): void
  unregisterPlugin(pluginId: string): void
  getPlugin(pluginId: string): Plugin | undefined
  getAllPlugins(): Plugin[]
  getPluginsForZone(zoneName: string): Plugin[]
}

/**
 * Plugin event system interface
 */
export interface PluginEventBusType {
  subscribe<T = any>(event: string, callback: (data?: T) => void): () => void
  unsubscribe(event: string, callback: Function): void
  publish<T = any>(event: string, data?: T): void
}

/**
 * Interface for providing plugin context
 */
export interface PluginContextValue {
  getPlugin(pluginId: string): Plugin | undefined
  getPluginsForZone(zoneName: string): Plugin[]
  loadPlugin(path: string): Promise<Plugin>
  registerPlugin(plugin: Plugin): void
  unregisterPlugin(pluginId: string): void
  getConfig(): PluginConfig
  updateConfig(config: PluginConfig): void
  getAllPlugins(): Plugin[]
  activePageId: string | null
  eventBus: IPluginEventBus
  updatePageConfig(pageId: string, newConfig: Partial<PagePluginConfig>): void
  setActivePage(pageId: string | null): void
}

export interface UsePluginConfigReturn {
  config: PluginConfig
  updateConfig: (newConfig: PluginConfig) => void
  updatePageConfig: (pageId: string, updatedZones: Record<string, PluginZoneConfig>) => void
  getPluginConfig: <T = Record<string, any>>(pluginId: string, zoneName?: string) => T
  setPluginConfig: (pluginId: string, config: Record<string, any>, zoneName?: string) => void
  movePlugin: (pluginId: string, fromZone: string, toZone: string) => void
  addPluginToZone: (pluginId: string, zoneName: string) => void
  removePluginFromZone: (pluginId: string, zoneName: string, pageId: string) => void
}

export interface UsePluginEventsReturn {
  subscribe: <T = any>(event: string, callback: (data?: T) => void) => void
  publish: <T = any>(event: string, data?: T) => void
}
