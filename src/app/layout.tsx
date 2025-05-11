import './globals.css'
import Link from 'next/link'
import { PluginContainer } from '@/core/components/PluginContainer'
import type { ReactNode } from 'react'
import { Providers } from './Providers'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900 min-h-screen flex flex-col">
        <Providers>
          <div className="app-layout flex flex-col min-h-screen">
            <header className="app-header bg-white shadow p-4 flex items-center justify-between">
              <div className="header-branding text-xl font-bold">Plugin Demo</div>

              <nav className='main-nav'>
                <ul className="flex gap-6">
                  <li>
                    <Link href="/" className="hover:text-blue-600 transition">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/settings" className="hover:text-blue-600 transition">
                      Settings
                    </Link>
                  </li>
                </ul>
              </nav>

              <div className='header-plugins'>
                <PluginContainer zoneName='header' />
              </div>
            </header>

            <div className="app-content flex flex-1">
              <aside className="sidebar w-64 bg-white border-r p-4">
                <PluginContainer zoneName="sidebar" />
              </aside>

              <main className="main-content flex-1 p-6 bg-gray-50">
                {children}
              </main>
            </div>

            <footer className="app-footer bg-white border-t p-4 text-center text-sm">
              <PluginContainer zoneName="footer" />
              <p className="footer-copyright text-gray-500 mt-2">©Nikhil 2025 Plugin Demo</p>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  )
}
