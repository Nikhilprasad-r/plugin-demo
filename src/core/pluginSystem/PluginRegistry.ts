import { Plugin, PluginRegistryType } from '@/core/pluginSystem/types/pluginTypes';

export class PluginRegistry implements PluginRegistryType {
  private plugins: Map<string, Plugin> = new Map();

  /**
   * Register a plugin with the system
   */
  public registerPlugin(plugin: Plugin): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin with ID ${plugin.id} is already registered. It will be overwritten.`);
    }
    
    // Validate plugin
    if (!plugin.id || !plugin.name || !plugin.version || !plugin.component) {
      throw new Error(`Plugin ${plugin.id || 'unknown'} is missing required fields`);
    }
    
    if (!plugin.allowedZones || plugin.allowedZones.length === 0) {
      throw new Error(`Plugin ${plugin.id} must specify at least one allowed zone`);
    }
    
    this.plugins.set(plugin.id, plugin);
  }

  /**
   * Unregister a plugin from the system
   */
  public unregisterPlugin(pluginId: string): void {
    if (!this.plugins.has(pluginId)) {
      console.warn(`Plugin with ID ${pluginId} is not registered.`);
      return;
    }
    
    this.plugins.delete(pluginId);
  }

  /**
   * Get a plugin by ID
   */
  public getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all registered plugins
   */
  public getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get all plugins that can render in a specific zone
   */
  public getPluginsForZone(zoneName: string): Plugin[] {
    return this.getAllPlugins().filter(plugin => 
      plugin.allowedZones.includes(zoneName)
    );
  }
}