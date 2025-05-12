'use client'
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { Plugin, PluginContextValue, PluginConfig, PagePluginConfig } from '@/core/pluginSystem/types/pluginTypes'
import { pluginRegistry } from './PluginRegistry'
import { PluginLoader } from './PluginLoader'
import { PluginEventBus } from './PluginEventBus'

const PluginContext = createContext<PluginContextValue | null>(null)

interface PluginProviderProps {
  initialConfig: PluginConfig
  children: React.ReactNode
}

export const PluginProvider: React.FC<PluginProviderProps> = ({ initialConfig, children }) => {
  const [config, setConfig] = useState<PluginConfig>(() => {
    if ('zones' in initialConfig) {
      // Convert legacy config to new format
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

  // Use the singleton instance
  const registry = useMemo(() => pluginRegistry, [])
  const loader = useMemo(() => new PluginLoader(), [])
  const eventBus = useMemo(() => new PluginEventBus(), [])

  const registerPlugin = useCallback(
    (plugin: Plugin) => {
      registry.registerPlugin(plugin)
    },
    [registry],
  )

  const unregisterPlugin = useCallback(
    (pluginId: string) => {
      registry.unregisterPlugin(pluginId)
    },
    [registry],
  )

  const getPlugin = useCallback(
    (pluginId: string) => {
      return registry.getPlugin(pluginId)
    },
    [registry],
  )

  const getPluginsForZone = useCallback(
    (zoneName: string) => {
      return registry.getPluginsForZone(zoneName)
    },
    [registry],
  )

  const loadPlugin = useCallback(
    async (path: string) => {
      const plugin = await loader.loadPlugin(path)
      registry.registerPlugin(plugin)
      return plugin
    },
    [loader, registry],
  )

  const getConfig = useCallback(() => config, [config])

  const updateConfig = useCallback(
    (newConfig: PluginConfig) => {
      setConfig(newConfig)
      eventBus.publish('config:updated', newConfig)
    },
    [eventBus],
  )

  const updatePageConfig = useCallback(
    (pageId: string, newConfig: Partial<PagePluginConfig>) => {
      setConfig(prev => {
        const existingPageIndex = prev.pageConfigs.findIndex(p => p.pageId === pageId)
        
        if (existingPageIndex >= 0) {
          const updated = [...prev.pageConfigs]
          updated[existingPageIndex] = {
            ...updated[existingPageIndex],
            ...newConfig
          }
          return {
            ...prev,
            pageConfigs: updated
          }
        } else {
          return {
            ...prev,
            pageConfigs: [
              ...prev.pageConfigs,
              {
                pageId,
                zones: newConfig.zones || {}
              } as PagePluginConfig
            ]
          }
        }
      })
    },
    []
  )

  const setActivePage = useCallback((pageId: string | null) => {
    setActivePageId(pageId)
  }, [])

  const getAllPlugins = useCallback(() => {
    return registry.getAllPlugins()
  }, [registry])

  // Auto-load from defaultZones on mount
  useEffect(() => {
    const zoneIds = Object.values(config.defaultZones).flatMap(zone => zone.pluginIds || [])
    const toPascalCase = (str: string) =>
      str
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')
    zoneIds.forEach(async (id) => {
      try {
        const fileName = `${toPascalCase(id)}.tsx`
        const pluginPath = `${id}/${fileName}`
        const plugin = await loader.loadPlugin(pluginPath)
        registry.registerPlugin(plugin)
      } catch (err) {
        console.warn(`❌ Failed to load plugin "${id}":`, err)
      }
    })
  }, [config, loader, registry])

  const contextValue = useMemo<PluginContextValue>(
    () => ({
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
    }),
    [
      getPlugin, getPluginsForZone, loadPlugin, registerPlugin, 
      unregisterPlugin, getConfig, updateConfig, updatePageConfig,
      setActivePage, activePageId, getAllPlugins, eventBus
    ],
  )

  return <PluginContext.Provider value={contextValue}>{children}</PluginContext.Provider>
}

export const usePluginSystem = (): PluginContextValue => {
  const context = useContext(PluginContext)

  if (!context) {
    throw new Error('usePluginSystem must be used within a PluginProvider')
  }

  return context
}