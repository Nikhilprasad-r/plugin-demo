'use client'

import { PluginContainer } from '@/core/components/PluginContainer'

export default function LoginPage() {
  return (
    <div className='min-h-screen bg-gray-100 flex flex-col'>
      {/* Header */}
      <header className='w-full bg-white shadow p-4'>
        <PluginContainer zoneName='header' pageId='user' />
      </header>

      {/* Main content area */}
      <main className='flex flex-row w-full py-6 gap-6'>
        {/* Sidebar - 30% */}
        <aside className='w-[30%] bg-white p-4 rounded-lg shadow space-y-4'>
          <PluginContainer zoneName='sidebar' pageId='user'/>
        </aside>
        {/* Content - 70% */}
        <section className='w-[70%] bg-white p-4 rounded-lg shadow space-y-4'>
          <PluginContainer zoneName='content' pageId='user'/>
        </section>
      </main>

      {/* Footer */}
      <footer className='w-full bg-white shadow p-4 mt-auto'>
        <PluginContainer zoneName='footer' pageId='user'/>
      </footer>
    </div>
  )
}
