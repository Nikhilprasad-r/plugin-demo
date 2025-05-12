import { useCallback, useMemo } from 'react'
import { usePluginSystem } from '../PluginContext'
import { PluginConfig, PluginZoneConfig, UsePluginConfigReturn } from '@/core/pluginSystem/types/pluginTypes'

export const usePluginConfig = (): UsePluginConfigReturn => {
  const { getConfig, updateConfig, getPlugin } = usePluginSystem()

  const config = useMemo(() => getConfig(), [getConfig])

  const getPluginConfig = useCallback(
    <T = Record<string, any>>(pluginId: string, zoneName?: string, pageId?: string): T => {
      const currentConfig = getConfig()
      const plugin = getPlugin(pluginId)

      // Start with plugin defaults
      const result = { ...(plugin?.defaultConfig || {}) }

      // Apply global config
      if (currentConfig.globalPluginConfigs?.[pluginId]) {
        Object.assign(result, currentConfig.globalPluginConfigs[pluginId])
      }

      // Apply zone-specific config, but ONLY look in page-specific zones, not default zones
      if (zoneName && pageId) {
        const pageConfig = currentConfig.pageConfigs.find((p) => p.pageId === pageId)
        if (pageConfig?.zones[zoneName]?.pluginConfigs?.[pluginId]) {
          Object.assign(result, pageConfig.zones[zoneName].pluginConfigs[pluginId])
        }
      }

      return result as T
    },
    [getConfig, getPlugin],
  )
  const updatePageConfig = useCallback(
    (pageId: string, updatedZones: Record<string, PluginZoneConfig>): void => {
      const currentConfig = getConfig()
      const newConfig: PluginConfig = { ...currentConfig }

      const pageIndex = newConfig.pageConfigs.findIndex((p) => p.pageId === pageId)
      if (pageIndex >= 0) {
        newConfig.pageConfigs[pageIndex] = {
          ...newConfig.pageConfigs[pageIndex],
          zones: {
            ...newConfig.pageConfigs[pageIndex].zones,
            ...updatedZones,
          },
        }
      } else {
        newConfig.pageConfigs.push({ pageId, zones: updatedZones })
      }

      updateConfig(newConfig)
    },
    [getConfig, updateConfig],
  )

  const setPluginConfig = useCallback(
    (pluginId: string, config: Record<string, any>, zoneName?: string, pageId?: string): void => {
      const currentConfig = getConfig()
      const newConfig: PluginConfig = { ...currentConfig }

      if (pageId && zoneName) {
        // Update page-specific zone config
        const pageIndex = newConfig.pageConfigs.findIndex((p) => p.pageId === pageId)
        const pageConfig = pageIndex >= 0 ? newConfig.pageConfigs[pageIndex] : { pageId, zones: {} }

        if (!pageConfig.zones[zoneName]) {
          pageConfig.zones[zoneName] = { pluginIds: [] }
        }

        pageConfig.zones[zoneName].pluginConfigs = {
          ...(pageConfig.zones[zoneName].pluginConfigs || {}),
          [pluginId]: {
            ...(pageConfig.zones[zoneName].pluginConfigs?.[pluginId] || {}),
            ...config,
          },
        }

        if (pageIndex >= 0) {
          newConfig.pageConfigs[pageIndex] = pageConfig
        } else {
          newConfig.pageConfigs.push(pageConfig)
        }
      } else if (zoneName) {
        // When setting config for a zone but no pageId, do nothing
        // This prevents modifying default zones which we don't want to use
        console.warn('Attempted to set zone-specific plugin config without a pageId. Operation skipped.')
        return
      } else {
        // Update global config
        newConfig.globalPluginConfigs = {
          ...(newConfig.globalPluginConfigs || {}),
          [pluginId]: {
            ...(newConfig.globalPluginConfigs?.[pluginId] || {}),
            ...config,
          },
        }
      }

      updateConfig(newConfig)
    },
    [getConfig, updateConfig],
  )

  const movePlugin = useCallback(
    (pluginId: string, fromZone: string, toZone: string, pageId?: string): void => {
      // If no pageId is provided, do nothing as we only work with page-specific plugins
      if (!pageId) {
        console.warn('Attempted to move plugin without specifying a pageId. Operation skipped.')
        return
      }

      const currentConfig = getConfig()
      const newConfig: PluginConfig = { ...currentConfig }

      // Find the page config
      const pageConfigIndex = newConfig.pageConfigs.findIndex((p) => p.pageId === pageId)
      if (pageConfigIndex === -1) {
        console.warn(`Page ${pageId} not found`)
        return
      }

      const pageConfig = newConfig.pageConfigs[pageConfigIndex]

      if (!pageConfig.zones[fromZone]?.pluginIds.includes(pluginId)) {
        console.warn(`Plugin ${pluginId} is not in page zone ${fromZone}`)
        return
      }

      // Initialize toZone if it doesn't exist
      if (!pageConfig.zones[toZone]) {
        pageConfig.zones[toZone] = { pluginIds: [] }
      }

      // Move plugin
      pageConfig.zones[fromZone].pluginIds = pageConfig.zones[fromZone].pluginIds.filter((id) => id !== pluginId)
      pageConfig.zones[toZone].pluginIds = [...pageConfig.zones[toZone].pluginIds, pluginId]

      // Move config if exists
      if (pageConfig.zones[fromZone].pluginConfigs?.[pluginId]) {
        pageConfig.zones[toZone].pluginConfigs = {
          ...(pageConfig.zones[toZone].pluginConfigs || {}),
          [pluginId]: pageConfig.zones[fromZone].pluginConfigs[pluginId],
        }
        delete pageConfig.zones[fromZone].pluginConfigs[pluginId]
      }

      updateConfig(newConfig)
    },
    [getConfig, updateConfig],
  )

  const addPluginToZone = useCallback(
    (pluginId: string, zoneName: string, pageId?: string): void => {
      // If no pageId is provided, do nothing as we only work with page-specific plugins
      if (!pageId) {
        console.warn('Attempted to add plugin to zone without specifying a pageId. Operation skipped.')
        return
      }

      const currentConfig = getConfig()
      const plugin = getPlugin(pluginId)

      if (!plugin) {
        console.warn(`Plugin ${pluginId} does not exist`)
        return
      }

      if (!plugin.allowedZones.includes(zoneName)) {
        console.warn(`Plugin ${pluginId} is not allowed in zone ${zoneName}`)
        return
      }

      const newConfig: PluginConfig = { ...currentConfig }

      const pageIndex = newConfig.pageConfigs.findIndex((p) => p.pageId === pageId)
      const pageConfig = pageIndex >= 0 ? newConfig.pageConfigs[pageIndex] : { pageId, zones: {} }

      if (!pageConfig.zones[zoneName]) {
        pageConfig.zones[zoneName] = { pluginIds: [] }
      }

      if (pageConfig.zones[zoneName].pluginIds.includes(pluginId)) {
        console.warn(`Plugin ${pluginId} already exists in zone ${zoneName} of page ${pageId}`)
        return
      }

      pageConfig.zones[zoneName].pluginIds.push(pluginId)

      if (pageIndex >= 0) {
        newConfig.pageConfigs[pageIndex] = pageConfig
      } else {
        newConfig.pageConfigs.push(pageConfig)
      }

      updateConfig(newConfig)
    },
    [getConfig, updateConfig, getPlugin],
  )

  const removePluginFromZone = useCallback(
    (pluginId: string, zoneName: string, pageId?: string): void => {
      // If no pageId is provided, do nothing as we only work with page-specific plugins
      if (!pageId) {
        console.warn('Attempted to remove plugin from zone without specifying a pageId. Operation skipped.')
        return
      }

      const currentConfig = getConfig()
      const newConfig: PluginConfig = { ...currentConfig }

      const pageConfig = newConfig.pageConfigs.find((p) => p.pageId === pageId)
      if (!pageConfig?.zones[zoneName]) {
        console.warn(`Zone ${zoneName} does not exist in page ${pageId}`)
        return
      }

      if (!pageConfig.zones[zoneName].pluginIds.includes(pluginId)) {
        console.warn(`Plugin ${pluginId} is not in zone ${zoneName} of page ${pageId}`)
        return
      }

      pageConfig.zones[zoneName].pluginIds = pageConfig.zones[zoneName].pluginIds.filter((id) => id !== pluginId)

      if (pageConfig.zones[zoneName].pluginConfigs?.[pluginId]) {
        delete pageConfig.zones[zoneName].pluginConfigs[pluginId]
      }

      updateConfig(newConfig)
    },
    [getConfig, updateConfig],
  )

  return {
    config,
    updateConfig,
    updatePageConfig,
    getPluginConfig,
    setPluginConfig,
    movePlugin,
    addPluginToZone,
    removePluginFromZone,
  }
}
