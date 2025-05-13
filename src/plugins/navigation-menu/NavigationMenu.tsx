import { PluginProps } from '@/pluginSystem/types/pluginTypes';
import React, { useState } from 'react';

interface NavItem {
  label: string;
  emoji: string;
  route: string;
}

interface NavigationMenuConfig {
  highlightColor?: string;
  compact?: boolean;
}

const NavigationMenu: React.FC<PluginProps & NavigationMenuConfig> = ({
  zoneName,
  config,
  instanceId
}) => {
  const {
    highlightColor = 'text-blue-600',
    compact = false
  }: NavigationMenuConfig = config || {};

  const [activeRoute, setActiveRoute] = useState<string>('home');

  const navItems: NavItem[] = [
    { label: 'Home', emoji: '🏠', route: 'home' },
    { label: 'Settings', emoji: '⚙️', route: 'settings' },
    { label: 'Logout', emoji: '🚪', route: 'logout' }
  ];

  return (
    <nav className="navigation-menu flex gap-2 w-full p-4 bg-white rounded-md shadow-sm text-sm">
      {navItems.map((item) => (
        <div
          key={item.route}
          onClick={() => setActiveRoute(item.route)}
          className={`nav-item flex items-center gap-2 cursor-pointer rounded px-3 py-2 ${
            activeRoute === item.route ? `${highlightColor} font-medium bg-gray-100` : 'text-gray-700'
          } ${compact ? 'text-xs' : 'text-sm'}`}
        >
          <span>{item.emoji}</span>
          {!compact && <span>{item.label}</span>}
        </div>
      ))}
      <div className="widget-footer mt-4 text-xs text-gray-300">
        Zone: {zoneName}
      </div>
    </nav>
  );
};

const NavigationMenuPlugin = {
  id: 'navigation-menu',
  name: 'Navigation Menu',
  version: '1.0.0',
  description: 'Simple navigation menu for plugins',
  allowedZones: ['sidebar', 'header'],
  component: NavigationMenu,
  defaultConfig: {
    highlightColor: 'text-blue-600',
    compact: false
  }
};

export default NavigationMenuPlugin;
