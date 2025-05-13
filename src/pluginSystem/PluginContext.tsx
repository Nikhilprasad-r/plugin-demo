'use client'
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { Plugin, PluginContextValue, PluginConfig, PagePluginConfig } from '@/pluginSystem/types/pluginTypes'
import { pluginRegistry } from './PluginRegistry'
import { PluginLoader } from './PluginLoader'
import { PluginEventBus } from './PluginEventBus'

const PluginContext = createContext<PluginContextValue | null>(null)

interface PluginProviderProps {
  initialConfig: PluginConfig
  children: React.ReactNode
}

export const PluginProvider: React.FC<PluginProviderProps> = ({ 
  initialConfig, 
  children 
}) => {
  // Normalize config and handle legacy format
  const [config, setConfig] = useState<PluginConfig>(() => {
    // Type guard for legacy config
    const isLegacyConfig = (config: any): config is { zones: any } => 
      'zones' in config && !('defaultZones' in config)
    
    if (isLegacyConfig(initialConfig)) {
      console.warn('Legacy config format detected. Migrating to new format.')
      return {
        defaultZones: initialConfig.zones,
        globalPluginConfigs: initialConfig.globalPluginConfigs,
        pageConfigs: [],
        defaultPageConfig: undefined
      }
    }
    return initialConfig
  })

  const [activePageId, setActivePageId] = useState<string | null>(null)

  // System instances
  const registry = useMemo(() => pluginRegistry, [])
  const loader = useMemo(() => new PluginLoader(), [])
  const eventBus = useMemo(() => new PluginEventBus(), [])

  // Plugin management
  const registerPlugin = useCallback((plugin: Plugin) => {
    try {
      registry.registerPlugin(plugin)
    } catch (error) {
      console.error(`Failed to register plugin ${plugin.id}:`, error)
      throw error
    }
  }, [registry])

  const unregisterPlugin = useCallback((pluginId: string) => {
    if (!registry.hasPlugin(pluginId)) {
      console.warn(`Plugin ${pluginId} not found in registry`)
      return
    }
    registry.unregisterPlugin(pluginId)
  }, [registry])

  const getPlugin = useCallback((pluginId: string) => {
    const plugin = registry.getPlugin(pluginId)
    if (!plugin) {
      console.warn(`Plugin ${pluginId} not found`)
    }
    return plugin
  }, [registry])

  const getPluginsForZone = useCallback((zoneName: string) => {
    const plugins = registry.getPluginsForZone(zoneName)
    if (plugins.length === 0) {
      console.debug(`No plugins found for zone ${zoneName}`)
    }
    return plugins
  }, [registry])

  const loadPlugin = useCallback(async (path: string) => {
    try {
      const plugin = await loader.loadPlugin(path)
      registry.registerPlugin(plugin)
      return plugin
    } catch (error) {
      console.error(`Failed to load plugin from ${path}:`, error)
      throw error
    }
  }, [loader, registry])

  // Config management - MODIFIED to only use page-specific plugins
  const getConfig = useCallback(() => {
    // Return only page-specific config when a page is active, without merging default zones
    if (activePageId) {
      const pageConfig = config.pageConfigs.find(p => p.pageId === activePageId)
      if (pageConfig) {
        return {
          ...config,
          zones: pageConfig.zones
        }
      }
      // If no page config found, return empty zones (don't use defaults)
      return {
        ...config,
        zones: {}
      }
    }
    // When no page is active, return the config as is
    return config
  }, [config, activePageId])

  const updateConfig = useCallback((newConfig: PluginConfig) => {
    try {
      setConfig(newConfig)
      eventBus.publish('config:updated', newConfig)
    } catch (error) {
      console.error('Failed to update config:', error)
      throw error
    }
  }, [eventBus])

  const updatePageConfig = useCallback((
    pageId: string, 
    newConfig: Partial<PagePluginConfig>
  ) => {
    setConfig(prev => {
      // Create a deep clone of the existing page config if it exists
      const existingPageIndex = prev.pageConfigs.findIndex(p => p.pageId === pageId)
      const existingPage = existingPageIndex >= 0 
        ? JSON.parse(JSON.stringify(prev.pageConfigs[existingPageIndex]))
        : null

      // Merge new config while preserving existing zone configurations
      const updatedPage = {
        ...(existingPage || { pageId, zones: {} }),
        ...newConfig,
        zones: {
          ...(existingPage?.zones || {}),
          ...(newConfig.zones || {})
        }
      }

      // Update or add the page config
      if (existingPageIndex >= 0) {
        const updated = [...prev.pageConfigs]
        updated[existingPageIndex] = updatedPage
        return { ...prev, pageConfigs: updated }
      }
      
      return {
        ...prev,
        pageConfigs: [...prev.pageConfigs, updatedPage]
      }
    })
  }, [])

  const setActivePage = useCallback((pageId: string | null) => {
    setActivePageId(pageId)
    eventBus.publish('page:changed', pageId)
  }, [eventBus])

  const getAllPlugins = useCallback(() => {
    return registry.getAllPlugins()
  }, [registry])

  // MODIFIED: Load only page-specific plugins when page changes
  useEffect(() => {
    const loadPlugins = async () => {
      if (!activePageId) return;
      
      // Find the active page config
      const pageConfig = config.pageConfigs.find(p => p.pageId === activePageId);
      if (!pageConfig) return;
      
      // Get all plugin IDs from all zones in the page config
      const zoneIds: string[] = [];
      Object.values(pageConfig.zones).forEach(zone => {
        if (zone.pluginIds) {
          zoneIds.push(...zone.pluginIds.filter(id => !registry.hasPlugin(id)));
        }
      });
      
      // Load each plugin
      await Promise.allSettled(zoneIds.map(async (id) => {
        try {
          const fileName = `${id.charAt(0).toUpperCase()}${id.slice(1).replace(/[-_](.)/g, (_, c) => c.toUpperCase())}.tsx`
          const pluginPath = `${id}/${fileName}`
          const plugin = await loader.loadPlugin(pluginPath)
          registry.registerPlugin(plugin)
        } catch (error) {
          console.warn(`Failed to load plugin "${id}":`, error)
        }
      }))
    }

    loadPlugins()
  }, [activePageId, config.pageConfigs, loader, registry])

  const contextValue = useMemo<PluginContextValue>(() => ({
    getPlugin,
    getPluginsForZone,
    loadPlugin,
    registerPlugin,
    unregisterPlugin,
    getConfig,
    updateConfig,
    updatePageConfig,
    setActivePage,
    activePageId,
    getAllPlugins,
    eventBus,
  }), [
    getPlugin, getPluginsForZone, loadPlugin, registerPlugin, 
    unregisterPlugin, getConfig, updateConfig, updatePageConfig,
    setActivePage, activePageId, getAllPlugins, eventBus
  ])

  return (
    <PluginContext.Provider value={contextValue}>
      {children}
    </PluginContext.Provider>
  )
}

export const usePluginSystem = (): PluginContextValue => {
  const context = useContext(PluginContext)
  if (!context) {
    throw new Error('usePluginSystem must be used within a PluginProvider')
  }
  return context
}