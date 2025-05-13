# Plugin System Documentation

## Architecture Overview

The plugin system consists of several core components that work together to provide a flexible, dynamic plugin infrastructure for React applications:

1. **Plugin Registry**: Manages the registration, storage, and retrieval of plugins
2. **Plugin Loader**: Handles dynamic importing of plugin modules
3. **Plugin Event Bus**: Implements publish-subscribe pattern for cross-plugin communication
4. **Plugin Context**: Provides a React context for plugin system access
5. **Plugin Container**: Renders plugins in specified zones
6. **Utility Hooks**: Helper hooks for plugin interactions

## Core Components

### Plugin Registry

The `PluginRegistry` class implements a singleton pattern for plugin management:

```typescript
class PluginRegistry implements PluginRegistryType {
  // Singleton instance management
  private static _instance: PluginRegistry;
  public static get instance(): PluginRegistry {...}
  
  // Core functionality
  public registerPlugin(plugin: Plugin, force: boolean = false): boolean {...}
  public unregisterPlugin(pluginId: string): void {...}
  public getPlugin(pluginId: string): Plugin | undefined {...}
  public hasPlugin(pluginId: string): boolean {...}
  public getAllPlugins(): Plugin[] {...}
  public getPluginsForZone(zoneName: string): Plugin[] {...}
  public clear(): void {...}
}
```

Key features:
- Plugin registration with validation and conflict resolution
- Equality checking to prevent duplicate registrations
- Plugin retrieval by ID and zone filtering
- Plugin unregistration and registry clearing

### Plugin Loader

The `PluginLoader` class dynamically loads plugin modules:

```typescript
class PluginLoader implements PluginLoaderType {
  public async loadPlugin(path: string): Promise<Plugin> {...}
  public async loadPlugins(pluginPaths: string[]): Promise<Plugin[]> {...}
}
```

Key features:
- Dynamic import of plugin modules using webpack chunking
- Validation of loaded plugins
- Support for batch loading multiple plugins

### Plugin Event Bus

The `PluginEventBus` enables inter-plugin communication through a publish-subscribe pattern:

```typescript
class PluginEventBus implements PluginEventBusType {
  public subscribe<T = any>(event: string, callback: (data?: T) => void): () => void {...}
  public unsubscribe(event: string, callback: Function): void {...}
  public publish<T = any>(event: string, data?: T): void {...}
}
```

Features:
- Type-safe event subscriptions and publications
- Automatic cleanup of empty event sets
- Error handling in event callbacks

### Plugin Context

The `PluginProvider` component establishes the plugin system context and manages state:

```typescript
export const PluginProvider: React.FC<PluginProviderProps> = ({
  initialConfig,
  children
}) => {
  // State management for plugin configuration
  const [config, setConfig] = useState<PluginConfig>(() => {...});
  const [activePageId, setActivePageId] = useState<string | null>(null);
  
  // System instances
  const registry = useMemo(() => pluginRegistry, []);
  const loader = useMemo(() => new PluginLoader(), []);
  const eventBus = useMemo(() => new PluginEventBus(), []);
  
  // Plugin management methods
  const registerPlugin = useCallback((plugin: Plugin) => {...}, [registry]);
  const unregisterPlugin = useCallback((pluginId: string) => {...}, [registry]);
  // ... additional methods ...
  
  return (
    <PluginContext.Provider value={contextValue}>
      {children}
    </PluginContext.Provider>
  );
}
```

Key features:
- Page-specific plugin configuration management
- Dynamic plugin loading when active page changes
- Automatic plugin registration/unregistration
- Legacy configuration support

### Plugin Container

The `PluginContainer` component renders plugins for a specific zone:

```typescript
export const PluginContainer: React.FC<PluginContainerProps> = ({
  zoneName,
  pluginIds,
  pluginConfigs,
  className,
  pageId
}) => {
  // Render plugins for a specific zone with proper configuration
}
```

Features:
- Zone-specific layout classes
- Plugin filtering by page and zone
- Configuration resolution with proper inheritance
- Unique instance ID generation for each plugin

## Utility Hooks

### usePluginEvents

Manages event subscriptions with automatic cleanup:

```typescript
export const usePluginEvents = (): UsePluginEventsReturn => {
  const { eventBus } = usePluginSystem();
  const subscriptionsRef = useRef<Array<() => void>>([]);
  
  const subscribe = useCallback<T = any>(...) => {...}, [eventBus]);
  const publish = useCallback<T = any>(...) => {...}, [eventBus]);
  
  // Automatic cleanup on unmount
  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
      subscriptionsRef.current = [];
    };
  }, []);
  
  return { subscribe, publish };
};
```

### usePluginConfig

Provides configuration management capabilities:

```typescript
export const usePluginConfig = (): UsePluginConfigReturn => {
  // Configuration management methods
  const getPluginConfig = useCallback<T = Record<string, any>>(...) => {...});
  const updatePageConfig = useCallback(...) => {...});
  const setPluginConfig = useCallback(...) => {...});
  const movePlugin = useCallback(...) => {...});
  const addPluginToZone = useCallback(...) => {...});
  const removePluginFromZone = useCallback(...) => {...});
  
  return {
    config,
    updateConfig,
    updatePageConfig,
    getPluginConfig,
    setPluginConfig,
    movePlugin,
    addPluginToZone,
    removePluginFromZone,
  };
}
```

## Configuration System

The plugin system uses a hierarchy of configurations:

1. **Default plugin configuration**: Defined in the plugin itself
2. **Global plugin configuration**: Applies to all instances of a plugin
3. **Page-specific zone configuration**: Applies to plugins in specific zones on a page

Configuration structure:

```typescript
interface PluginConfig {
  defaultZones: Record<string, PluginZoneConfig>;
  globalPluginConfigs?: Record<string, Record<string, any>>;
  pageConfigs: PagePluginConfig[];
  defaultPageConfig?: PagePluginConfig;
}

interface PagePluginConfig {
  pageId: string;
  zones: Record<string, PluginZoneConfig>;
}

interface PluginZoneConfig {
  pluginIds: string[];
  pluginConfigs?: Record<string, Record<string, any>>;
}
```

## Key Implementation Details

1. **Page-centric design**: The system focuses on loading and managing plugins on a per-page basis
2. **Lazy loading**: Plugins are loaded dynamically when a page becomes active
3. **Config inheritance**: Configurations cascade from plugin defaults to global configs to page-specific settings
4. **Name-based path resolution**: Plugins are loaded based on a convention of `${id}/${PascalCasedId}.tsx`
5. **Zone-based layout**: Different zones (header, sidebar, content, footer) have specific layout behavior

## Usage Example

```typescript
// Set up the plugin system
const App = () => (
  <PluginProvider initialConfig={defaultPluginConfig}>
    <Layout>
      <PluginContainer zoneName="header" pageId="dashboard" />
      <PluginContainer zoneName="sidebar" pageId="dashboard" />
      <PluginContainer zoneName="content" pageId="dashboard" />
      <PluginContainer zoneName="footer" pageId="dashboard" />
    </Layout>
  </PluginProvider>
);

// Access plugin system from components
const MyComponent = () => {
  const { setActivePage, loadPlugin } = usePluginSystem();
  const { addPluginToZone } = usePluginConfig();
  const { publish } = usePluginEvents();
  
  // Example usage
  useEffect(() => {
    setActivePage('dashboard');
    
    const loadNewPlugin = async () => {
      const plugin = await loadPlugin('new-plugin/NewPlugin');
      addPluginToZone(plugin.id, 'content', 'dashboard');
    };
    
    loadNewPlugin();
  }, []);
  
  return <button onClick={() => publish('custom:event', { data: 'value' })}>Trigger Event</button>;
};
```

## Plugin Development Guidelines

To create a plugin compatible with this system:

1. Create a folder with the plugin ID (e.g., `my-plugin`)
2. Create the main plugin file with PascalCase naming (e.g., `MyPlugin.tsx`)
3. Export a default object with the Plugin interface:

```typescript
import { Plugin } from '@/core/pluginSystem/types/pluginTypes';

const MyPlugin: React.FC<PluginProps> = ({ zoneName, config, instanceId, eventBus }) => {
  // Plugin implementation
};

export default {
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',
  component: MyPlugin,
  allowedZones: ['content', 'sidebar'],
  defaultConfig: {
    // Default configuration
  }
} as Plugin;
```