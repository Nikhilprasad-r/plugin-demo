'use client'
import { useState } from 'react'
import { usePluginSystem, usePluginConfig } from '@/core/pluginSystem'

export default function SettingsPage() {
  const { getAllPlugins } = usePluginSystem()
  const { config, movePlugin, addPluginToZone, removePluginFromZone } = usePluginConfig()

  const allPlugins = getAllPlugins()
  const [draggedPlugin, setDraggedPlugin] = useState<string | null>(null)
  const [dragOverZone, setDragOverZone] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, pluginId: string) => {
    e.dataTransfer.setData('text/plain', pluginId)
    setDraggedPlugin(pluginId)
  }

  const handleDragOver = (e: React.DragEvent, zoneName: string) => {
    e.preventDefault()
    setDragOverZone(zoneName)
  }

  const handleDragLeave = () => {
    setDragOverZone(null)
  }

  const handleDrop = (e: React.DragEvent, zoneName: string) => {
    e.preventDefault()
    const pluginId = e.dataTransfer.getData('text/plain')
    const plugin = allPlugins.find((p) => p.id === pluginId)
    
    if (plugin && plugin.allowedZones.includes(zoneName)) {
      let currentZone: string | null = null
      for (const [zone, zoneConfig] of Object.entries(config.zones)) {
        if (zoneConfig.pluginIds.includes(pluginId)) {
          currentZone = zone
          break
        }
      }
      
      if (currentZone) {
        movePlugin(pluginId, currentZone, zoneName)
      } else {
        addPluginToZone(pluginId, zoneName)
      }
    }
    
    setDragOverZone(null)
    setDraggedPlugin(null)
  }

  // 🔍 Get plugins that are NOT in any zone
  const assignedPluginIds = Object.values(config.zones).flatMap(z => z.pluginIds)
  const unassignedPlugins = allPlugins.filter(p => !assignedPluginIds.includes(p.id))

  return (
    <div className='settings-page p-6 bg-white rounded-xl shadow space-y-6'>
      <h2 className='text-2xl font-bold'>Plugin Settings</h2>
      <p className='text-gray-600'>Drag and drop plugins into different zones to configure layout.</p>

      {/* 🔌 Available Plugins Section */}
      <div>
        <h3 className='text-lg font-semibold mb-2'>Available Plugins</h3>
        {unassignedPlugins.length === 0 ? (
          <p className='text-sm text-gray-500'>All plugins are assigned.</p>
        ) : (
          <ul className='flex flex-wrap gap-3'>
            {unassignedPlugins.map((plugin) => (
              <li
                key={plugin.id}
                draggable
                onDragStart={(e) => handleDragStart(e, plugin.id)}
                className='plugin-item cursor-move bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 transition flex items-center space-x-2'
              >
                <span>{plugin.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 🧩 Zones */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {Object.keys(config.zones).map((zone) => {
          const isDragOver = dragOverZone === zone
          const canDrop = draggedPlugin
            ? allPlugins.find(p => p.id === draggedPlugin)?.allowedZones.includes(zone)
            : false

          return (
            <div
              key={zone}
              onDragOver={(e) => handleDragOver(e, zone)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, zone)}
              className={`zone-config border-2 p-4 rounded-md min-h-[100px] transition-colors ${
                isDragOver
                  ? canDrop
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-red-500 bg-red-50'
                  : 'border-dashed border-gray-300'
              }`}
            >
              <h3 className='font-semibold mb-2'>{zone}</h3>
              <ul className='space-y-1'>
                {config.zones[zone].pluginIds.map((id) => {
                  const plugin = allPlugins.find((p) => p.id === id)
                  return (
                    <li
                      key={id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, id)}
                      className='plugin-item cursor-move bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 transition flex items-center justify-between space-x-2'
                    >
                      <span className='truncate'>{plugin?.name || id}</span>
                      <button
                        onClick={() => removePluginFromZone(id, zone)}
                        className='ml-2 text-red-500 hover:text-red-700 text-sm font-bold px-2 py-0.5 rounded-full transition'
                        title='Remove plugin'
                      >
                        &times;
                      </button>
                    </li>
                  )
                })}
              </ul>
              {isDragOver && !canDrop && (
                <div className="text-red-500 text-sm mt-2">
                  This plugin cannot be placed in this zone
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
