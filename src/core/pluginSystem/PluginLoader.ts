import { Plugin, PluginLoaderType  } from '@/core/pluginSystem/types/pluginTypes';

export class PluginLoader implements PluginLoaderType {
  /**
   * Load a plugin dynamically by path
   */
  public async loadPlugin(path: string): Promise<Plugin> {
    try {

      // Dynamic import to load the plugin module
      const module = await import(/* webpackChunkName: "plugin-[request]" */ `../../plugins/${path}`);
      console.log("path",module)
      // Plugin modules should export a default object that implements Plugin interface
      const plugin = module.default as Plugin;
      
      if (!plugin || !plugin.id || !plugin.component) {
        throw new Error(`Invalid plugin format at path: ${path}`);
      }
      
      return plugin;
    } catch (error) {
      console.error(`Failed to load plugin from path: ${path}`, error);
      throw new Error(`Failed to load plugin: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Load multiple plugins by path
   */
  public async loadPlugins(pluginPaths: string[]): Promise<Plugin[]> {
    const loadPromises = pluginPaths.map(path => this.loadPlugin(path));
    return Promise.all(loadPromises);
  }
}