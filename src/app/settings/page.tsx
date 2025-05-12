'use client'
import { useState, useEffect } from 'react'
import { usePluginSystem } from '@/core/pluginSystem'
import { PagePluginSettings } from '@/components/PagePluginSettings'

export default function SettingsPage() {
  const { 
    getConfig, 
    getAllPlugins, 
    updatePageConfig, 
    updateConfig, 
    activePageId, 
    setActivePage,
    loadPlugin
  } = usePluginSystem()

  // State management
  const [activeTab, setActiveTab] = useState<'global' | string>('global')
  const [newPageId, setNewPageId] = useState('')
  const [isCreatingPage, setIsCreatingPage] = useState(false)
  const [availablePlugins, setAvailablePlugins] = useState<string[]>([])
  const [selectedPlugin, setSelectedPlugin] = useState<string>('')
  const [selectedZone, setSelectedZone] = useState<string>('')
  const [isApplyingLayout, setIsApplyingLayout] = useState(false)

  // Get configuration data
  const config = getConfig()
  const allPlugins = getAllPlugins()
  const pages = config.pageConfigs

  // Zones available in the system
  const availableZones = [
    'header',
    'sidebar',
    'content',
    'footer'
  ]

  // Load list of available plugins 
  useEffect(() => {
    // This would typically come from an API call or a predefined list
    // For now, we're using a hardcoded list of plugin IDs
    const pluginIds = [
      'navigation-menu',
      'user-profile',
      'weather-widget',
      'analytics-dashboard',
      'task-manager',
      'footer-links',
      'content-editor',
      'search-bar',
      'notification-center'
    ]
    setAvailablePlugins(pluginIds)
  }, [])

  // Add new page with validation
  const addNewPage = () => {
    const trimmedId = newPageId.trim()

    if (!trimmedId) return alert('Please enter a page ID')
    if (pages.some((p) => p.pageId === trimmedId)) return alert('Page already exists')

    updatePageConfig(trimmedId, {
      zones: {},
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
        pageConfigs: config.pageConfigs.filter((p) => p.pageId !== pageId),
      }

      updateConfig(updatedConfig)

      // If deleting the active tab, switch to global
      if (activeTab === pageId) {
        setActiveTab('global')
        setActivePage(null)
      }
    }
  }

  // Add plugin to active page
  const addPluginToPage = async () => {
    if (!activePageId || activeTab === 'global' || !selectedPlugin || !selectedZone) {
      alert('Please select a page, plugin, and zone first')
      return
    }

    // Get current page config
    const pageConfig = config.pageConfigs.find(p => p.pageId === activePageId)
    const zoneConfig = pageConfig?.zones[selectedZone] || { pluginIds: [] }

    // Check if plugin is already in the zone
    if (zoneConfig.pluginIds.includes(selectedPlugin)) {
      alert(`Plugin "${selectedPlugin}" is already in the "${selectedZone}" zone`)
      return
    }

    // Update page config
    const updatedZones = {
      ...pageConfig?.zones,
      [selectedZone]: {
        ...zoneConfig,
        pluginIds: [...zoneConfig.pluginIds, selectedPlugin]
      }
    }

    updatePageConfig(activePageId, {
      zones: updatedZones
    })

    // Try to load the plugin
    try {
      const fileName = `${selectedPlugin.charAt(0).toUpperCase()}${selectedPlugin.slice(1).replace(/[-_](.)/g, (_, c) => c.toUpperCase())}.tsx`
      const pluginPath = `${selectedPlugin}/${fileName}`
      await loadPlugin(pluginPath)
    } catch (error) {
      console.warn(`Plugin ${selectedPlugin} couldn't be loaded automatically`, error)
    }

    // Reset selections
    setSelectedPlugin('')
    setSelectedZone('')
  }

  // Apply current layout to preview
  const applyLayout = () => {
    setIsApplyingLayout(true)
    
    // Simulating the action of applying layout changes
    setTimeout(() => {
      setIsApplyingLayout(false)
      alert('Layout changes applied successfully!')
    }, 1000)
    
    // In a real application, this would trigger a refresh or rerender of the page
    // with the new plugin configuration
  }

  // Global settings UI
  const renderGlobalSettings = () => (
    <div className='global-settings space-y-6'>
      <div className='p-6 bg-white rounded-lg shadow'>
        <h2 className='text-xl font-semibold mb-4'>Global Plugin Configuration</h2>
        <div className='space-y-4'>
          <p className='text-gray-500'>These settings apply to all pages unless overridden by page-specific configurations.</p>
          <div className='p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700'>
            <p><strong>Note:</strong> Default plugins are disabled. Only page-specific plugins will be loaded.</p>
          </div>

          <div className='space-y-4'>
            <h3 className='font-medium'>Available Plugins</h3>
            <div className='grid grid-cols-2 gap-4'>
              {availablePlugins.map(pluginId => (
                <div key={pluginId} className='p-3 bg-gray-50 border border-gray-200 rounded-md'>
                  <div className='font-medium'>{pluginId}</div>
                  <p className='text-sm text-gray-500'>
                    {allPlugins.find(p => p.id === pluginId)?.description || 'Plugin description not available'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Plugin selection UI for page settings
  const renderPluginSelector = () => {
    if (activeTab === 'global') return null

    return (
      <div className='mt-6 p-6 bg-white rounded-lg shadow'>
        <h3 className='text-lg font-medium mb-4'>Add Plugin to Page</h3>
        <div className='flex gap-3 mb-4'>
          <div className='flex-1'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Plugin
            </label>
            <select
              value={selectedPlugin}
              onChange={(e) => setSelectedPlugin(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value="">Select a plugin...</option>
              {availablePlugins.map(pluginId => (
                <option key={pluginId} value={pluginId}>{pluginId}</option>
              ))}
            </select>
          </div>
          <div className='flex-1'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Zone
            </label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value="">Select a zone...</option>
              {availableZones.map(zone => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>
          <div className='flex items-end'>
            <button
              onClick={addPluginToPage}
              disabled={!selectedPlugin || !selectedZone}
              className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition-colors'
            >
              Add Plugin
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='settings-page p-6 space-y-6 max-w-6xl mx-auto'>
      <header className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold text-gray-800'>Plugin Configuration</h1>

        <div className='flex gap-2'>
          {activeTab !== 'global' && (
            <button 
              onClick={applyLayout} 
              disabled={isApplyingLayout}
              className='px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-400 transition-colors flex items-center gap-2'
            >
              {isApplyingLayout ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Applying...
                </>
              ) : (
                <>Apply Layout</>
              )}
            </button>
          )}
          
          {!isCreatingPage && (
            <button onClick={() => setIsCreatingPage(true)} className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'>
              + Create New Page
            </button>
          )}
        </div>
      </header>

      {isCreatingPage && (
        <div className='create-page-form p-4 bg-gray-50 rounded-lg border border-gray-200'>
          <h2 className='text-lg font-semibold mb-3'>Create New Page</h2>
          <div className='flex gap-3'>
            <input
              type='text'
              value={newPageId}
              onChange={(e) => setNewPageId(e.target.value)}
              placeholder="Enter page ID (e.g., 'product-page')"
              className='flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              autoFocus
            />
            <div className='flex gap-2'>
              <button
                onClick={addNewPage}
                disabled={!newPageId.trim()}
                className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition-colors'
              >
                Create
              </button>
              <button
                onClick={() => {
                  setIsCreatingPage(false)
                  setNewPageId('')
                }}
                className='px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='tabs-container border-b border-gray-200'>
        <nav className='flex space-x-4'>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'global' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => {
              setActiveTab('global')
              setActivePage(null)
              setSelectedPlugin('')
              setSelectedZone('')
            }}
          >
            Global Settings
          </button>

          {pages.map((page) => (
            <div key={page.pageId} className='relative group'>
              <button
                className={`px-4 py-2 font-medium text-sm ${activeTab === page.pageId ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => {
                  setActiveTab(page.pageId)
                  setActivePage(page.pageId)
                }}
              >
                {page.pageId}
              </button>
              <button
                onClick={() => deletePage(page.pageId)}
                className='absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 
                  text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center
                  hover:bg-red-600 transition-opacity'
                title='Delete page'
              >
                ×
              </button>
            </div>
          ))}
        </nav>
      </div>

      <div className='tab-content pt-4'>
        {activeTab === 'global' ? (
          renderGlobalSettings()
        ) : (
          <>
            {renderPluginSelector()}
            <PagePluginSettings
              pageId={activeTab}
              key={activeTab} // Force re-render when tab changes
            />
          </>
        )}
      </div>
    </div>
  )
}