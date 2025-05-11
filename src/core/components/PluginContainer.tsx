'use client'
import React, { useMemo } from 'react';
import { PluginContainerProps } from '@/core/pluginSystem/types/pluginTypes';
import { usePluginSystem } from '../pluginSystem/PluginContext';

export const PluginContainer: React.FC<PluginContainerProps> = ({
  zoneName,
  pluginIds,
  pluginConfigs,
  className
}) => {
  const { getPluginsForZone, getPlugin, getConfig } = usePluginSystem();
  
  // Get the current configuration
  const appConfig = getConfig();
  
  // Determine which plugins to render in this zone
  const pluginsToRender = useMemo(() => {
    // If specific pluginIds are provided, use those
    if (pluginIds) {
      return pluginIds
        .map(id => getPlugin(id))
        .filter((plugin): plugin is NonNullable<typeof plugin> => 
          !!plugin && plugin.allowedZones.includes(zoneName)
        );
    }
    
    // Otherwise, check the global config
    const zoneConfig = appConfig.zones[zoneName];
    if (zoneConfig && zoneConfig.pluginIds) {
      return zoneConfig.pluginIds
        .map(id => getPlugin(id))
        .filter((plugin): plugin is NonNullable<typeof plugin> => 
          !!plugin && plugin.allowedZones.includes(zoneName)
        );
    }
    
    // Fallback to all plugins that can render in this zone
    return getPluginsForZone(zoneName);
  }, [getPlugin, getPluginsForZone, pluginIds, zoneName, appConfig.zones]);

  // Merge configurations from different sources with proper priority
  const getPluginConfig = (pluginId: string) => {
    // 1. Start with plugin's default config
    const plugin = getPlugin(pluginId);
    const defaultConfig = plugin?.defaultConfig || {};
    
    // 2. Apply global config from app
    const globalConfig = appConfig.globalPluginConfigs?.[pluginId] || {};
    
    // 3. Apply zone-specific config from app
    const zoneConfig = appConfig.zones[zoneName]?.pluginConfigs?.[pluginId] || {};
    
    // 4. Apply direct props config (highest priority)
    const propsConfig = pluginConfigs?.[pluginId] || {};
    
    return {
      ...defaultConfig,
      ...globalConfig,
      ...zoneConfig,
      ...propsConfig
    };
  };

  if (pluginsToRender.length === 0) {
    return null;
  }

  return (
    <div className={`plugin-container plugin-zone-${zoneName} ${className || ''}`}>
      {pluginsToRender.map((plugin) => {
        const PluginComponent = plugin.component;
        const config = getPluginConfig(plugin.id);
        const instanceId = `${plugin.id}-${zoneName}-${Math.random().toString(36).substr(2, 9)}`;
        
        return (
          <div key={instanceId} className="plugin-wrapper">
            <PluginComponent 
              zoneName={zoneName}
              config={config}
              instanceId={instanceId}
            />
          </div>
        );
      })}
    </div>
  );
};