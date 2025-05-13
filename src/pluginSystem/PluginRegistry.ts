import { Plugin, PluginRegistryType } from '@/pluginSystem/types/pluginTypes'

interface PluginWithOptions extends Plugin {
  options?: Record<string, any>;
  [key: string]: any;
}

export class PluginRegistry implements PluginRegistryType {
  private static _instance: PluginRegistry;
  private plugins: Map<string, Plugin> = new Map();
  private registrationAttempts: Map<string, number> = new Map();

  private constructor() {}

  public static get instance(): PluginRegistry {
    if (!PluginRegistry._instance) {
      PluginRegistry._instance = new PluginRegistry();
    }
    return PluginRegistry._instance;
  }

  public registerPlugin(plugin: Plugin, force: boolean = false): boolean {
    const attempts = this.registrationAttempts.get(plugin.id) || 0;
    this.registrationAttempts.set(plugin.id, attempts + 1);
    
    if (!plugin.id || !plugin.name || !plugin.version || !plugin.component) {
      throw new Error(`Plugin ${plugin.id || 'unknown'} is missing required fields`);
    }
    
    if (!plugin.allowedZones || plugin.allowedZones.length === 0) {
      throw new Error(`Plugin ${plugin.id} must specify at least one allowed zone`);
    }
    
    const existingPlugin = this.plugins.get(plugin.id);
    
    if (existingPlugin && !force && this.arePluginsEqual(existingPlugin, plugin)) {
      if (attempts === 0) {
        console.debug(`Plugin ${plugin.id} is already registered with identical configuration. Skipping.`);
      }
      return false;
    }
    
    if (existingPlugin && attempts === 0) {
      console.warn(`Plugin with ID ${plugin.id} is already registered. It will be overwritten.`);
    }
    
    this.plugins.set(plugin.id, plugin);
    return true;
  }

  private arePluginsEqual(plugin1: Plugin, plugin2: Plugin): boolean {
    const p1 = plugin1 as PluginWithOptions;
    const p2 = plugin2 as PluginWithOptions;
    
    const basicChecks = 
      p1.name === p2.name &&
      p1.version === p2.version &&
      p1.component === p2.component;
      
    const zonesEqual = 
      p1.allowedZones.length === p2.allowedZones.length &&
      p1.allowedZones.every(zone => p2.allowedZones.includes(zone));
      
    let optionsEqual = true;
    if (p1.options || p2.options) {
      optionsEqual = JSON.stringify(p1.options) === JSON.stringify(p2.options);
    }
    
    return basicChecks && zonesEqual && optionsEqual;
  }

  public unregisterPlugin(pluginId: string): void {
    if (!this.plugins.has(pluginId)) {
      console.warn(`Plugin with ID ${pluginId} is not registered.`);
      return;
    }
    
    this.plugins.delete(pluginId);
    this.registrationAttempts.delete(pluginId);
  }

  public getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  public hasPlugin(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  public getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  public getPluginsForZone(zoneName: string): Plugin[] {
    return this.getAllPlugins().filter(plugin => 
      plugin.allowedZones.includes(zoneName)
    );
  }
  
  public clear(): void {
    this.plugins.clear();
    this.registrationAttempts.clear();
  }
}

export const pluginRegistry = PluginRegistry.instance;