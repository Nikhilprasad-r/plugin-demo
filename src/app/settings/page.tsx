'use client';

import { useState } from 'react';
import { usePluginSystem, usePluginConfig } from '@/core/pluginSystem';

export default function SettingsPage() {
  const { getAllPlugins } = usePluginSystem();
  const { config, movePlugin, addPluginToZone, removePluginFromZone } = usePluginConfig();

  const allPlugins = getAllPlugins();
  const [draggedPlugin, setDraggedPlugin] = useState<string | null>(null);

  const handleDragStart = (pluginId: string) => setDraggedPlugin(pluginId);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (zoneName: string) => {
    if (draggedPlugin) {
      const plugin = allPlugins.find(p => p.id === draggedPlugin);
      if (plugin && plugin.allowedZones.includes(zoneName)) {
        let currentZone: string | null = null;
        for (const [zone, zoneConfig] of Object.entries(config.zones)) {
          if (zoneConfig.pluginIds.includes(draggedPlugin)) {
            currentZone = zone;
            break;
          }
        }
        if (currentZone) {
          movePlugin(draggedPlugin, currentZone, zoneName);
        } else {
          addPluginToZone(draggedPlugin, zoneName);
        }
      }
    }
  };

  return (
    <div className="settings-page">
      <h2>Plugin Settings</h2>
      {/* Render plugin management UI */}
    </div>
  );
}
