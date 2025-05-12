'use client'
import React, { useMemo } from 'react'
import { PluginContainerProps } from '@/core/pluginSystem/types/pluginTypes'
import { usePluginSystem } from '../pluginSystem/PluginContext'

export const PluginContainer: React.FC<PluginContainerProps> = ({
  zoneName,
  pluginIds,
  pluginConfigs,
  className,
  pageId
}) => {
  const { getPluginsForZone, getPlugin, getConfig, activePageId } = usePluginSystem()
  
  const getLayoutClasses = () => {
    switch (zoneName) {
      case 'header': return 'flex flex-row gap-4'
      case 'sidebar':
      case 'footer': return 'flex flex-col gap-4'
      case 'content': return 'grid gap-4 auto-cols-max grid-flow-row-dense'
      default: return 'flex gap-4'
    }
  }

  const pluginsToRender = useMemo(() => {
    const config = getConfig()
    const usePageConfig = pageId && activePageId === pageId
    
    // Highest priority: explicitly passed pluginIds
    if (pluginIds) {
      return pluginIds
        .map(id => getPlugin(id))
        .filter((plugin): plugin is NonNullable<typeof plugin> =>
          !!plugin && plugin.allowedZones.includes(zoneName)
        )
    }
    
    // Page-specific config
    if (usePageConfig) {
      const pageConfig = config.pageConfigs.find(p => p.pageId === pageId)
      if (pageConfig?.zones[zoneName]?.pluginIds) {
        return pageConfig.zones[zoneName].pluginIds
          .map(id => getPlugin(id))
          .filter((plugin): plugin is NonNullable<typeof plugin> =>
            !!plugin && plugin.allowedZones.includes(zoneName)
          )
      }
    }
    
    // Global default zones
    if (config.defaultZones[zoneName]?.pluginIds) {
      return config.defaultZones[zoneName].pluginIds
        .map(id => getPlugin(id))
        .filter((plugin): plugin is NonNullable<typeof plugin> =>
          !!plugin && plugin.allowedZones.includes(zoneName)
        )
    }
    
    // Fallback to all plugins for zone
    return getPluginsForZone(zoneName)
  }, [getPlugin, getPluginsForZone, pluginIds, zoneName, getConfig, pageId, activePageId])

  const getPluginConfig = (pluginId: string) => {
    const config = getConfig()
    const plugin = getPlugin(pluginId)
    
    // Start with plugin defaults
    const result = { ...(plugin?.defaultConfig || {}) }
    
    // Apply global config
    if (config.globalPluginConfigs?.[pluginId]) {
      Object.assign(result, config.globalPluginConfigs[pluginId])
    }
    
    // Apply zone-specific config from default zones
    if (config.defaultZones[zoneName]?.pluginConfigs?.[pluginId]) {
      Object.assign(result, config.defaultZones[zoneName].pluginConfigs[pluginId])
    }
    
    // Apply page-specific zone config if applicable
    if (pageId && activePageId === pageId) {
      const pageConfig = config.pageConfigs.find(p => p.pageId === pageId)
      if (pageConfig?.zones[zoneName]?.pluginConfigs?.[pluginId]) {
        Object.assign(result, pageConfig.zones[zoneName].pluginConfigs[pluginId])
      }
    }
    
    // Apply direct props config (highest priority)
    if (pluginConfigs?.[pluginId]) {
      Object.assign(result, pluginConfigs[pluginId])
    }
    
    return result
  }

  if (pluginsToRender.length === 0) return null

  return (
    <div className={`plugin-container ${getLayoutClasses()} plugin-zone-${zoneName} ${className || ''}`}>
      {pluginsToRender.map((plugin) => {
        const PluginComponent = plugin.component
        const config = getPluginConfig(plugin.id)
        const instanceId = `${plugin.id}-${zoneName}-${Math.random().toString(36).substr(2, 9)}`

        return (
          <div key={instanceId} className="plugin-wrapper p-4 bg-gray-100 rounded-md shadow-sm">
            <PluginComponent
              zoneName={zoneName}
              config={config}
              instanceId={instanceId}
            />
          </div>
        )
      })}
    </div>
  )
}