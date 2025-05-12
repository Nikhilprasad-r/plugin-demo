'use client'
import { useState } from 'react'
import { usePluginSystem } from '@/core/pluginSystem'
import { usePluginConfig } from '@/core/pluginSystem/hooks/usePluginConfig'

interface PagePluginSettingsProps {
  pageId: string
}

export const PagePluginSettings: React.FC<PagePluginSettingsProps> = ({ pageId }) => {
  const { getConfig, getAllPlugins, getPluginsForZone } = usePluginSystem()
  const { removePluginFromZone, updatePageConfig } = usePluginConfig()

  const [expandedPluginId, setExpandedPluginId] = useState<string | null>(null)

  const config = getConfig()
  const allPlugins = getAllPlugins()

  // Get page config or create an empty one
  const pageConfig = config.pageConfigs.find((p) => p.pageId === pageId) || { pageId, zones: {} }

  // Available zones
  const zones = ['header', 'sidebar', 'content', 'footer']

  // Get plugins for a specific zone
  const getZonePlugins = (zoneName: string) => {
    const zoneConfig = pageConfig.zones[zoneName] || { pluginIds: [] }
    return zoneConfig.pluginIds || []
  }

  // Remove plugin with confirmation
  const handleRemovePlugin = (zoneName: string, pluginId: string) => {
    if (window.confirm(`Remove ${pluginId} from ${zoneName} zone?`)) {
      removePluginFromZone(pluginId, zoneName, pageId)
    }
  }

  // Toggle plugin configuration panel
  const togglePluginExpand = (pluginId: string) => {
    setExpandedPluginId(expandedPluginId === pluginId ? null : pluginId)
  }

  // Reorder plugins in a zone
  const movePluginInPage = (pageId: string, zoneName: string, pluginId: string, direction: 'up' | 'down') => {
    const page = config.pageConfigs.find((p) => p.pageId === pageId)
    if (!page) return

    const zoneConfig = page.zones?.[zoneName] ?? { pluginIds: [] }
    const pluginIds: string[] = [...zoneConfig.pluginIds]
    const currentIndex = pluginIds.indexOf(pluginId)

    if (currentIndex < 0) return

    let newIndex = currentIndex
    if (direction === 'up' && currentIndex > 0) {
      newIndex--
    } else if (direction === 'down' && currentIndex < pluginIds.length - 1) {
      newIndex++
    } else {
      return // Can't move
    }

    // Swap the plugin positions
    ;[pluginIds[currentIndex], pluginIds[newIndex]] = [pluginIds[newIndex], pluginIds[currentIndex]]

    updatePageConfig(pageId, {
      [zoneName]: {
        ...zoneConfig,
        pluginIds,
      },
    })
  }

  return (
    <div className='page-plugin-settings space-y-8'>
      <div className='p-6 bg-white rounded-lg shadow'>
        <h2 className='text-xl font-semibold mb-4'>
          Page Configuration: <span className='text-blue-600'>{pageId}</span>
        </h2>

        <div className='space-y-6'>
          {zones.map((zoneName) => {
            const zonePlugins = getZonePlugins(zoneName)

            return (
              <div key={zoneName} className='zone-config'>
                <h3 className='text-lg font-medium capitalize mb-2 flex items-center'>
                  <span className='w-2 h-6 bg-blue-500 rounded mr-2'></span>
                  {zoneName} Zone
                </h3>

                {zonePlugins.length > 0 ? (
                  <div className='space-y-3'>
                    {zonePlugins.map((pluginId, index) => {
                      const plugin = allPlugins.find((p) => p.id === pluginId)
                      const isExpanded = expandedPluginId === pluginId

                      return (
                        <div key={pluginId} className='plugin-item border border-gray-200 rounded-md overflow-hidden'>
                          <div className='flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100'>
                            <div className='flex items-center space-x-2'>
                              <span className='font-medium'>{plugin?.name || pluginId}</span>
                              <span className='text-xs text-gray-500'>{pluginId}</span>
                            </div>

                            <div className='flex items-center space-x-1'>
                              <button
                                onClick={() => movePluginInPage(pageId, zoneName, pluginId, 'up')}
                                disabled={index === 0}
                                className='p-1 text-gray-500 hover:text-gray-700 disabled:text-gray-300'
                                title='Move up'
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => movePluginInPage(pageId, zoneName, pluginId, 'down')}
                                disabled={index === zonePlugins.length - 1}
                                className='p-1 text-gray-500 hover:text-gray-700 disabled:text-gray-300'
                                title='Move down'
                              >
                                ↓
                              </button>
                              <button onClick={() => togglePluginExpand(pluginId)} className='p-1 text-gray-500 hover:text-gray-700' title='Toggle configuration'>
                                {isExpanded ? '▼' : '▶'}
                              </button>
                              <button onClick={() => handleRemovePlugin(zoneName, pluginId)} className='p-1 text-red-500 hover:text-red-700' title='Remove plugin'>
                                ×
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className='p-3 border-t border-gray-200 bg-white'>
                              <div className='text-sm text-gray-700'>
                                <p className='mb-2'>
                                  <strong>Description:</strong> {plugin?.description || 'No description available'}
                                </p>
                                {plugin?.version && <p className='text-xs text-gray-500'>Version: {plugin.version}</p>}
                              </div>

                              {/* Plugin configuration panel could go here */}
                              <div className='mt-3 pt-3 border-t border-gray-200'>
                                <div className='text-sm text-blue-600'>Configuration options would appear here</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className='p-4 bg-gray-50 border border-dashed border-gray-300 rounded-md'>
                    <p className='text-gray-500 text-center'>No plugins configured for this zone.</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
