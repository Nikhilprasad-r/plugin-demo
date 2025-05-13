# Plugin System Documentation: Setting Up Page Layouts with New Plugins

This guide explains how to configure and manage plugins within your application's layout system.

## Table of Contents
1. [System Overview](#system-overview)
2. [Plugin Configuration Structure](#plugin-configuration-structure)
3. [Adding Page-Specific Plugins](#adding-page-specific-plugins)
4. [Available Plugins](#available-plugins)
5. [Page Zones](#page-zones)
6. [Example Configurations](#example-configurations)
7. [Applying Layout Changes](#applying-layout-changes)

## System Overview

The plugin system allows you to configure different components (plugins) that can be placed in specific zones on your pages. Each page can have its own unique layout configuration, while maintaining a consistent structure.

The system consists of:
- **Pages**: Individual routes in your application (like "dashboard", "user", etc.)
- **Zones**: Predefined areas on each page (header, sidebar, content, footer)
- **Plugins**: UI components that can be added to any zone

## Plugin Configuration Structure

The plugin configuration is maintained through the `defaultPluginConfig` object:

```javascript
export const defaultPluginConfig: PluginConfig = {
  // Legacy structure (not actively used)
  defaultZones: {
    header: { pluginIds: ['navigation-menu'] },
    sidebar: { pluginIds: ['user-profile', 'weather-widget'] },
    content: { pluginIds: ['analytics-dashboard', 'task-manager', 'blog-widget'] },
    footer: { pluginIds: ['footer-links'] },
  },
  
  // Global plugin configuration (applied to all instances of a plugin)
  globalPluginConfigs: {
    'analytics-dashboard': {
      refreshInterval: 60,
      showDetailedMetrics: false,
    },
    'weather-widget': {
      location: 'auto',
      units: 'metric',
    },
  },
  
  // Page-specific configurations (this is where your layouts are stored)
  pageConfigs: [],
  
  // Template for new pages
  defaultPageConfig: {
    zones: {
      header: { pluginIds: [] },
      sidebar: { pluginIds: [] },
      content: { pluginIds: [] },
      footer: { pluginIds: [] },
    },
  },
}
```

## Adding Page-Specific Plugins

To set up a new page layout with plugins:

1. Navigate to the Plugin Configuration page
2. Click the "+ Edit Page" button
3. Select a page from the dropdown (e.g., "dashboard" or "user")
4. Click "Edit" to begin configuring the page
5. The page will appear as a tab next to "Global Settings"

Once you've created/selected a page:

1. Use the "Add Plugin to Page" section to:
   - Select a plugin from the dropdown
   - Choose which zone to place it in
   - Click "Add Plugin"
2. Repeat for each plugin you want to add to the page
3. Click "Apply Layout" to save and activate your changes

### Behind the scenes

When you add a plugin to a page, the system:
1. Updates the `pageConfigs` array with your configuration
2. Attempts to load the plugin component dynamically
3. Renders the plugin in the specified zone when the page is visited

## Available Plugins

The system comes with several built-in plugins:

| Plugin ID | Description |
|-----------|-------------|
| navigation-menu | Main navigation links |
| user-profile | User account information and settings |
| weather-widget | Displays local weather information |
| analytics-dashboard | Shows key metrics and data visualizations |
| blog-widget | Displays blog posts or news updates |
| task-manager | Task tracking and management interface |
| footer-links | Footer navigation and info links |

## Page Zones

Each page has four predefined zones where plugins can be placed:

1. **header**: Top section, typically for navigation and global UI elements
2. **sidebar**: Left-side panel (30% width), often used for secondary navigation or tools
3. **content**: Main content area (70% width), primary page content
4. **footer**: Bottom section, usually for secondary links and information

## Example Configurations

### Dashboard Page Configuration

```javascript
{
  pageId: 'dashboard',
  zones: {
    header: {
      pluginIds: ['navigation-menu']
    },
    sidebar: {
      pluginIds: ['user-profile', 'weather-widget']
    },
    content: {
      pluginIds: ['analytics-dashboard', 'task-manager']
    },
    footer: {
      pluginIds: ['footer-links']
    }
  }
}
```

### User Page Configuration

```javascript
{
  pageId: 'user',
  zones: {
    header: {
      pluginIds: ['navigation-menu']
    },
    sidebar: {
      pluginIds: ['user-profile']
    },
    content: {
      pluginIds: ['blog-widget']
    },
    footer: {
      pluginIds: ['footer-links']
    }
  }
}
```

## Applying Layout Changes

After configuring your page layout:

1. Click the "Apply Layout" button at the top right of the settings page
2. The system will apply your changes and refresh the view
3. Navigate to the configured page to see your changes in action

## Advanced Usage

### Plugin Loading

The system automatically attempts to load plugins based on naming conventions:
- Plugin files should be named with PascalCase
- Example: `navigation-menu` plugin should be in a file `NavigationMenu.tsx`
- Located in a folder with the plugin's kebab-case name

### Page Identification

Pages are identified based on the URL path:
- Root path (`/`) is identified as 'home'
- Other paths are converted to kebab-case IDs (e.g., `/user/profile` becomes `user-profile`)
- These IDs are used to match with your page configurations

### Global vs. Page-Specific Settings

- Global settings apply to all instances of a plugin across pages
- Page-specific configurations take precedence over global settings
- You can override global settings on a per-page basis if needed
