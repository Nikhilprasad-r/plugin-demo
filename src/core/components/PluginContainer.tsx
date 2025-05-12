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
  const { 
    getPluginsForZone, 
    getConfig, 
    activePageId, 
    eventBus 
  } = usePluginSystem()
  
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
    // Use the context method specifically designed for zone plugins
    const zonePlugins = getPluginsForZone(zoneName)
    
    // Filter by page if specified
    if (pageId) {
      const config = getConfig()
      const pageConfig = config.pageConfigs.find(p => p.pageId === pageId)
      const pageZonePlugins = pageConfig?.zones?.[zoneName]?.pluginIds || []
      
      return zonePlugins.filter(plugin => 
        pageZonePlugins.includes(plugin.id) ||
        (pluginIds?.includes(plugin.id))
      )
    }
    
    // Include any plugins passed directly via props
    return pluginIds 
      ? zonePlugins.filter(plugin => pluginIds.includes(plugin.id))
      : zonePlugins
  }, [getPluginsForZone, zoneName, pageId, getConfig, pluginIds])
  const getPluginConfig = (pluginId: string) => {
    const config = getConfig()
    const plugin = pluginsToRender.find(p => p.id === pluginId)
    if (!plugin) return {}
    
    const result = { ...(plugin.defaultConfig || {}) }
    
    // Apply config in order of increasing specificity
    const configLayers = [
      config.globalPluginConfigs?.[pluginId],
      pageId && config.pageConfigs
        .find(p => p.pageId === pageId)
        ?.zones?.[zoneName]?.pluginConfigs?.[pluginId],
      activePageId && !pageId && config.pageConfigs
        .find(p => p.pageId === activePageId)
        ?.zones?.[zoneName]?.pluginConfigs?.[pluginId],
      pluginConfigs?.[pluginId]
    ].filter(Boolean)

    configLayers.forEach(layer => Object.assign(result, layer))
    
    return result
  }

  if (pluginsToRender.length === 0) return null

  return (
    <div className={`plugin-container ${getLayoutClasses()} plugin-zone-${zoneName} ${className || ''}`}>
      {pluginsToRender.map((plugin) => {
        const PluginComponent = plugin.component
        const config = getPluginConfig(plugin.id)
        const instanceId = `${plugin.id}-${zoneName}-${Math.random().toString(36).slice(2, 11)}`

        return (
          <div key={instanceId} className="plugin-wrapper p-4 bg-gray-100 rounded-md shadow-sm">
            <PluginComponent
              zoneName={zoneName}
              config={config}
              instanceId={instanceId}
              eventBus={eventBus}
            />
            </div>
        )
      })}
    </div>
  )
}