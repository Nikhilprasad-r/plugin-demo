'use client'

import React from 'react'
import Link from 'next/link'
import { PluginContainer } from '../pluginSystem'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className='app-layout flex flex-col min-h-screen'>
      <header className='app-header bg-white shadow p-4 flex items-center justify-between'>
        <div className='header-branding text-xl font-bold'>Plugin Demo</div>

        <nav className='main-nav'>
          <ul className='flex gap-6'>
            <li>
              <Link href='/' className='hover:text-blue-600 transition'>
                Dashboard
              </Link>
            </li>
            <li>
              <Link href='/user' className='hover:text-blue-600 transition'>
                User
              </Link>
            </li>
            <li>
              <Link href='/settings' className='hover:text-blue-600 transition'>
                Settings
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <div className='app-content flex flex-1'>
        <main className='main-content flex-1 p-6 bg-gray-50'>{children}</main>
      </div>

      <footer className='app-footer bg-white border-t p-4 text-center text-sm'>
        <p className='footer-copyright text-gray-500 mt-2'>©Nikhil 2025 Plugin Demo</p>
      </footer>
    </div>
  )
}

export default Layout
