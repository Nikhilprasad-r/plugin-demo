import './globals.css'
import Link from 'next/link'
import { PluginContainer } from '@/core/components/PluginContainer'
import type { ReactNode } from 'react'
import { Providers } from './Providers'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <Providers>
          <div className='app-layout'>
            <header className='app-header'>
              <div className='header-branding'>
                <h1>Plugin Demo</h1>
              </div>

              <nav className='main-nav'>
                <ul>
                  <li>
                    <Link href='/'>Home</Link>
                  </li>
                  <li>
                    <Link href='/settings'>Settings</Link>
                  </li>
                </ul>
              </nav>

              <div className='header-plugins'>
                <PluginContainer zoneName='header' />
              </div>
            </header>

            <div className='app-content'>
              <div className='sidebar'>
                <PluginContainer zoneName='sidebar' />
              </div>

              <main className='main-content'>{children}</main>
            </div>

            <footer className='app-footer'>
              <PluginContainer zoneName='footer' />
              <div className='footer-copyright'>
                <p>©Nikhil 2025 Plugin Demo</p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  )
}
