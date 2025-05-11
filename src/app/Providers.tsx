'use client';
import { defaultPluginConfig } from '@/config/pluginConfig';
import { PluginProvider } from '../core/pluginSystem';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PluginProvider initialConfig={defaultPluginConfig}>
      {children}
    </PluginProvider>
  );
}
