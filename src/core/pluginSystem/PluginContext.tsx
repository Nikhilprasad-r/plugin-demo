'use client'
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { Plugin, PluginContextValue, PluginConfig } from '@/core/pluginSystem/types/pluginTypes'
import { PluginRegistry } from './PluginRegistry'
import { PluginLoader } from './PluginLoader'
import { PluginEventBus } from './PluginEventBus'

// Create context with a default value
const PluginContext = createContext<PluginContextValue | null>(null)

interface PluginProviderProps {
  initialConfig: PluginConfig
  children: React.ReactNode
}

export const PluginProvider: React.FC<PluginProviderProps> = ({ initialConfig, children }) => {
  const [config, setConfig] = useState<PluginConfig>(initialConfig)

  // Create instances of core services
  const registry = useMemo(() => new PluginRegistry(), [])
  const loader = useMemo(() => new PluginLoader(), [])
  const eventBus = useMemo(() => new PluginEventBus(), [])

  // Expose registry methods
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

  // Expose loader methods
  const loadPlugin = useCallback(
    async (path: string) => {
      const plugin = await loader.loadPlugin(path)
      registry.registerPlugin(plugin)
      return plugin
    },
    [loader, registry],
  )

  // Config management
  const getConfig = useCallback(() => config, [config])

  const updateConfig = useCallback(
    (newConfig: PluginConfig) => {
      setConfig(newConfig)
      // Notify subscribers about config change
      eventBus.publish('config:updated', newConfig)
    },
    [eventBus],
  )

  const getAllPlugins = useCallback(() => {
    return registry.getAllPlugins()
  }, [registry])

  // 🔁 Auto-load from config on mount
  useEffect(() => {
    const zoneIds = Object.values(config.zones).flatMap((zone) => zone.pluginIds || [])
    const toPascalCase = (str: string) =>
      str
        .split(/[-_]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
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
      getAllPlugins,
      eventBus,
    }),
    [getPlugin, getPluginsForZone, loadPlugin, registerPlugin, unregisterPlugin, getConfig, updateConfig, getAllPlugins, eventBus],
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
