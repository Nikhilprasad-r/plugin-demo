'use client'
import { useState } from 'react'
import { usePluginSystem } from '@/core/pluginSystem'
import { PagePluginSettings } from '@/components/PagePluginSettings'

export default function SettingsPage() {
  const { 
    getConfig, 
    getAllPlugins, 
    updatePageConfig,
    updateConfig,
    activePageId,
    setActivePage
  } = usePluginSystem()

  // State management
  const [activeTab, setActiveTab] = useState<'global' | string>('global')
  const [newPageId, setNewPageId] = useState('')
  const [isCreatingPage, setIsCreatingPage] = useState(false)

  // Get configuration data
  const config = getConfig()
  const allPlugins = getAllPlugins()
  const pages = config.pageConfigs

  // Add new page with validation
  const addNewPage = () => {
    const trimmedId = newPageId.trim()
    
    if (!trimmedId) {
      alert('Please enter a page ID')
      return
    }

    if (pages.some(p => p.pageId === trimmedId)) {
      alert(`Page "${trimmedId}" already exists`)
      return
    }

    updatePageConfig(trimmedId, {
      zones: config.defaultPageConfig?.zones || {}
    })
    
    setActiveTab(trimmedId)
    setActivePage(trimmedId)
    setNewPageId('')
    setIsCreatingPage(false)
  }

  // Delete page with confirmation
  const deletePage = (pageId: string) => {
    if (window.confirm(`Are you sure you want to delete page "${pageId}"?`)) {
      // Create updated config without this page
      const updatedConfig = {
        ...config,
        pageConfigs: config.pageConfigs.filter(p => p.pageId !== pageId)
      }
      
      updateConfig(updatedConfig)
      
      // If deleting the active tab, switch to global
      if (activeTab === pageId) {
        setActiveTab('global')
        setActivePage(null)
      }
    }
  }

  // Global settings UI (previously in separate component)
  const renderGlobalSettings = () => (
    <div className="global-settings space-y-6">
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Global Plugin Configuration</h2>
        <div className="space-y-4">
          <p className="text-gray-500">
            These settings apply to all pages unless overridden by page-specific configurations.
          </p>
          
          <div className="space-y-4">
            <h3 className="font-medium">Default Zones Configuration</h3>
            {Object.entries(config.defaultZones).map(([zoneName, zoneConfig]) => (
              <div key={zoneName} className="p-3 bg-gray-50 rounded">
                <h4 className="font-medium capitalize">{zoneName}</h4>
                {zoneConfig.pluginIds.length > 0 ? (
                  <ul className="mt-2 space-y-1">
                    {zoneConfig.pluginIds.map(pluginId => {
                      const plugin = allPlugins.find(p => p.id === pluginId)
                      return (
                        <li key={pluginId} className="flex justify-between items-center">
                          <span>{plugin?.name || pluginId}</span>
                          <span className="text-sm text-gray-500">{pluginId}</span>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">No plugins in this zone</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="settings-page p-6 space-y-6 max-w-6xl mx-auto">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Plugin Configuration</h1>
        
        {!isCreatingPage && (
          <button
            onClick={() => setIsCreatingPage(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            + Create New Page
          </button>
        )}
      </header>

      {isCreatingPage && (
        <div className="create-page-form p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-3">Create New Page</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={newPageId}
              onChange={(e) => setNewPageId(e.target.value)}
              placeholder="Enter page ID (e.g., 'product-page')"
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={addNewPage}
                disabled={!newPageId.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setIsCreatingPage(false)
                  setNewPageId('')
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="tabs-container border-b border-gray-200">
        <nav className="flex space-x-4">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'global'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => {
              setActiveTab('global')
              setActivePage(null)
            }}
          >
            Global Settings
          </button>
          
          {pages.map(page => (
            <div key={page.pageId} className="relative group">
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === page.pageId
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => {
                  setActiveTab(page.pageId)
                  setActivePage(page.pageId)
                }}
              >
                {page.pageId}
              </button>
              <button
                onClick={() => deletePage(page.pageId)}
                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 
                  text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center
                  hover:bg-red-600 transition-opacity"
                title="Delete page"
              >
                ×
              </button>
            </div>
          ))}
        </nav>
      </div>
      
      <div className="tab-content pt-4">
        {activeTab === 'global' ? (
          renderGlobalSettings()
        ) : (
          <PagePluginSettings 
            pageId={activeTab} 
            key={activeTab} // Force re-render when tab changes
          />
        )}
      </div>
    </div>
  )
}