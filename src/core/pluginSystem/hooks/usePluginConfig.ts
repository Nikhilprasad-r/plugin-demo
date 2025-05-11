import { useCallback, useMemo } from 'react';
import { usePluginSystem } from '../PluginContext';
import { PluginConfig, UsePluginConfigReturn } from '@/core/pluginSystem/types/pluginTypes';



export const usePluginConfig = (): UsePluginConfigReturn => {
  const { getConfig, updateConfig, getPlugin } = usePluginSystem();
  
  const config = useMemo(() => getConfig(), [getConfig]);
  
  /**
   * Get configuration for a specific plugin, optionally in a specific zone
   */
  const getPluginConfig = useCallback(<T = Record<string, any>>(
    pluginId: string, 
    zoneName?: string
  ): T => {
    const currentConfig = getConfig();
    const plugin = getPlugin(pluginId);
    
    // Start with plugin defaults
    const result = { ...(plugin?.defaultConfig || {}) };
    
    // Apply global plugin config
    if (currentConfig.globalPluginConfigs?.[pluginId]) {
      Object.assign(result, currentConfig.globalPluginConfigs[pluginId]);
    }
    
    // Apply zone-specific config if requested
    if (zoneName && currentConfig.zones[zoneName]?.pluginConfigs?.[pluginId]) {
      Object.assign(result, currentConfig.zones[zoneName].pluginConfigs[pluginId]);
    }
    
    return result as T;
  }, [getConfig, getPlugin]);
  
  /**
   * Update configuration for a specific plugin
   */
  const setPluginConfig = useCallback((
    pluginId: string, 
    config: Record<string, any>, 
    zoneName?: string
  ): void => {
    const currentConfig = getConfig();
    const newConfig: PluginConfig = { ...currentConfig };
    
    if (zoneName) {
      // Update zone-specific config
      if (!newConfig.zones[zoneName]) {
        newConfig.zones[zoneName] = { pluginIds: [] };
      }
      
      if (!newConfig.zones[zoneName].pluginConfigs) {
        newConfig.zones[zoneName].pluginConfigs = {};
      }
      
      newConfig.zones[zoneName].pluginConfigs[pluginId] = {
        ...(newConfig.zones[zoneName].pluginConfigs[pluginId] || {}),
        ...config
      };
    } else {
      // Update global config
      if (!newConfig.globalPluginConfigs) {
        newConfig.globalPluginConfigs = {};
      }
      
      newConfig.globalPluginConfigs[pluginId] = {
        ...(newConfig.globalPluginConfigs[pluginId] || {}),
        ...config
      };
    }
    
    updateConfig(newConfig);
  }, [getConfig, updateConfig]);
  
  /**
   * Move a plugin from one zone to another
   */
  const movePlugin = useCallback((
    pluginId: string,
    fromZone: string,
    toZone: string
  ): void => {
    const currentConfig = getConfig();
    const newConfig: PluginConfig = { ...currentConfig };
    
    // Check if the plugin is in the source zone
    if (
      !newConfig.zones[fromZone] || 
      !newConfig.zones[fromZone].pluginIds.includes(pluginId)
    ) {
      console.warn(`Plugin ${pluginId} is not in zone ${fromZone}`);
      return;
    }
    
    // Check if the destination zone exists
    if (!newConfig.zones[toZone]) {
      newConfig.zones[toZone] = { pluginIds: [] };
    }
    
    // Remove from source zone
    newConfig.zones[fromZone] = {
      ...newConfig.zones[fromZone],
      pluginIds: newConfig.zones[fromZone].pluginIds.filter(id => id !== pluginId)
    };
    
    // Add to destination zone
    newConfig.zones[toZone] = {
      ...newConfig.zones[toZone],
      pluginIds: [...newConfig.zones[toZone].pluginIds, pluginId]
    };
    
    // Move zone-specific config if it exists
    if (
      newConfig.zones[fromZone].pluginConfigs && 
      newConfig.zones[fromZone].pluginConfigs[pluginId]
    ) {
      if (!newConfig.zones[toZone].pluginConfigs) {
        newConfig.zones[toZone].pluginConfigs = {};
      }
      
      newConfig.zones[toZone].pluginConfigs[pluginId] = 
        newConfig.zones[fromZone].pluginConfigs[pluginId];
      
      delete newConfig.zones[fromZone].pluginConfigs[pluginId];
    }
    
    updateConfig(newConfig);
  }, [getConfig, updateConfig]);
  
  /**
   * Add a plugin to a zone
   */
  const addPluginToZone = useCallback((
    pluginId: string,
    zoneName: string
  ): void => {
    const currentConfig = getConfig();
    const newConfig: PluginConfig = { ...currentConfig };
    
    // Check if the plugin exists
    const plugin = getPlugin(pluginId);
    if (!plugin) {
      console.warn(`Plugin ${pluginId} does not exist`);
      return;
    }
    
    // Check if the plugin is allowed in this zone
    if (!plugin.allowedZones.includes(zoneName)) {
      console.warn(`Plugin ${pluginId} is not allowed in zone ${zoneName}`);
      return;
    }
    
    // Initialize zone if it doesn't exist
    if (!newConfig.zones[zoneName]) {
      newConfig.zones[zoneName] = { pluginIds: [] };
    }
    
    // Check if the plugin is already in the zone
    if (newConfig.zones[zoneName].pluginIds.includes(pluginId)) {
      console.warn(`Plugin ${pluginId} is already in zone ${zoneName}`);
      return;
    }
    
    // Add plugin to zone
    newConfig.zones[zoneName] = {
      ...newConfig.zones[zoneName],
      pluginIds: [...newConfig.zones[zoneName].pluginIds, pluginId]
    };
    
    updateConfig(newConfig);
  }, [getConfig, updateConfig, getPlugin]);
  
  /**
   * Remove a plugin from a zone
   */
  const removePluginFromZone = useCallback((
    pluginId: string,
    zoneName: string
  ): void => {
    const currentConfig = getConfig();
    const newConfig: PluginConfig = { ...currentConfig };
    
    // Check if the zone exists
    if (!newConfig.zones[zoneName]) {
      console.warn(`Zone ${zoneName} does not exist`);
      return;
    }
    
    // Check if the plugin is in the zone
    if (!newConfig.zones[zoneName].pluginIds.includes(pluginId)) {
      console.warn(`Plugin ${pluginId} is not in zone ${zoneName}`);
      return;
    }
    
    // Remove plugin from zone
    newConfig.zones[zoneName] = {
      ...newConfig.zones[zoneName],
      pluginIds: newConfig.zones[zoneName].pluginIds.filter(id => id !== pluginId)
    };
    
    // Remove plugin config from zone if it exists
    if (
      newConfig.zones[zoneName].pluginConfigs && 
      newConfig.zones[zoneName].pluginConfigs[pluginId]
    ) {
      delete newConfig.zones[zoneName].pluginConfigs[pluginId];
    }
    
    updateConfig(newConfig);
  }, [getConfig, updateConfig]);

  return {
    config,
    updateConfig,
    getPluginConfig,
    setPluginConfig,
    movePlugin,
    addPluginToZone,
    removePluginFromZone
  };
};