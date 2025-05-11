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
    <div className="settings-page p-6 bg-white rounded-xl shadow space-y-6">
      <h2 className="text-2xl font-bold">Plugin Settings</h2>
      <p className="text-gray-600">Drag and drop plugins into different zones to configure layout.</p>

      {/* Example UI placeholder for plugin zones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.keys(config.zones).map(zone => (
          <div
            key={zone}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(zone)}
            className="border-2 border-dashed border-gray-300 p-4 rounded-md min-h-[100px]"
          >
            <h3 className="font-semibold mb-2">{zone}</h3>
            <ul className="space-y-1">
              {config.zones[zone].pluginIds.map(id => {
                const plugin = allPlugins.find(p => p.id === id);
                return (
                  <li
                    key={id}
                    draggable
                    onDragStart={() => handleDragStart(id)}
                    className="cursor-move bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 transition"
                  >
                    {plugin?.name || id}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
