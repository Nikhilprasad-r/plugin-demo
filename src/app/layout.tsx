import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { PluginProvider } from '@/pluginSystem/PluginContext';
import { defaultPluginConfig } from '@/config/pluginConfig';
import Layout from '@/components/Layout';
import './globals.css';

export const metadata: Metadata = {
  title: 'Plugin System Demo',
  description: 'Next.js application with plugin architecture',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PluginProvider initialConfig={defaultPluginConfig}>
          <Layout>{children}</Layout>
        </PluginProvider>
      </body>
    </html>
  );
}