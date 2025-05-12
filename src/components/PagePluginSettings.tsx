'use client'
import { useState } from 'react'
import { PluginContainer, usePluginSystem } from '@/core/pluginSystem'

export function PagePluginSettings({ pageId }: { pageId: string }) {
  const { 
    getAllPlugins, 
    getConfig,
    updatePageConfig,
    setActivePage,
    activePageId
  } = usePluginSystem()
  
  const [isEditingPage, setIsEditingPage] = useState(false)
  const [draggedPlugin, setDraggedPlugin] = useState<string | null>(null)
  const [dragOverZone, setDragOverZone] = useState<string | null>(null)

  const config = getConfig()
  const allPlugins = getAllPlugins()
  const pageConfig = config.pageConfigs.find(p => p.pageId === pageId) || {
    pageId,
    zones: {}
  }

  const toggleEditingMode = () => {
    if (isEditingPage) {
      setActivePage(null)
    } else {
      setActivePage(pageId)
    }
    setIsEditingPage(!isEditingPage)
  }

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
    const plugin = allPlugins.find(p => p.id === pluginId)
    
    if (plugin && plugin.allowedZones.includes(zoneName)) {
      const currentZoneConfig = pageConfig.zones[zoneName] || { pluginIds: [] }
      
      if (!currentZoneConfig.pluginIds.includes(pluginId)) {
        updatePageConfig(pageId, {
          zones: {
            ...pageConfig.zones,
            [zoneName]: {
              ...currentZoneConfig,
              pluginIds: [...currentZoneConfig.pluginIds, pluginId]
            }
          }
        })
      }
    }
    
    setDragOverZone(null)
    setDraggedPlugin(null)
  }

  const assignedPluginIds = Object.values(pageConfig.zones).flatMap(z => z.pluginIds || [])
  const unassignedPlugins = allPlugins.filter(p => !assignedPluginIds.includes(p.id))

  return (
    <div className="page-plugin-settings space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Page Configuration: {pageId}</h3>
        <button
          onClick={toggleEditingMode}
          className={`px-3 py-1 rounded ${
            isEditingPage 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {isEditingPage ? 'Editing Page' : 'Edit Page Layout'}
        </button>
      </div>

      {isEditingPage && (
        <div className="space-y-6">
          <div className="available-plugins p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Available Plugins</h4>
            {unassignedPlugins.length === 0 ? (
              <p className="text-sm text-gray-500">All plugins are assigned</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {unassignedPlugins.map(plugin => (
                  <div
                    key={plugin.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, plugin.id)}
                    className="px-3 py-2 bg-white border rounded-md shadow-xs cursor-move hover:bg-gray-100"
                  >
                    {plugin.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="zones-config grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(config.defaultZones).map(zone => {
              const isDragOver = dragOverZone === zone
              const canDrop = draggedPlugin 
                ? allPlugins.find(p => p.id === draggedPlugin)?.allowedZones.includes(zone)
                : false
              const zonePlugins = pageConfig.zones[zone]?.pluginIds || []

              return (
                <div
                  key={zone}
                  onDragOver={(e) => handleDragOver(e, zone)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, zone)}
                  className={`zone p-4 rounded-lg border-2 ${
                    isDragOver
                      ? canDrop
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <h4 className="font-medium mb-2">{zone}</h4>
                  <div className="space-y-2">
                    {zonePlugins.map(id => {
                      const plugin = allPlugins.find(p => p.id === id)
                      return (
                        <div
                          key={id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, id)}
                          className="flex items-center justify-between p-2 bg-gray-100 rounded"
                        >
                          <span>{plugin?.name || id}</span>
                          <button
                            onClick={() => {
                              const updatedZone = {
                                ...pageConfig.zones[zone],
                                pluginIds: pageConfig.zones[zone].pluginIds.filter(pid => pid !== id)
                              }
                              updatePageConfig(pageId, {
                                zones: {
                                  ...pageConfig.zones,
                                  [zone]: updatedZone
                                }
                              })
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      )
                    })}
                    {zonePlugins.length === 0 && (
                      <p className="text-sm text-gray-500">
                        {isDragOver && canDrop ? 'Drop here to add' : 'No plugins in this zone'}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="preview border-t pt-4">
        <h4 className="font-medium mb-2">Preview</h4>
        {Object.keys(config.defaultZones).map(zone => (
          <div key={zone} className="mb-6">
            <h5 className="text-sm font-semibold mb-1">{zone}</h5>
            <PluginContainer 
              zoneName={zone} 
              pageId={pageId}
              className="min-h-[80px] bg-gray-50 p-2 rounded"
            />
          </div>
        ))}
      </div>
    </div>
  )
}