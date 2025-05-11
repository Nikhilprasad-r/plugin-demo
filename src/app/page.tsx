'use client';

import { PluginContainer } from '@/core/components/PluginContainer';

export default function HomePage() {
  return (
    <div className="home-page">
      <h2>Dashboard</h2>
      <p>Welcome to the plugin architecture demo.</p>

      <div className="content-plugins">
        <PluginContainer zoneName="content" />
      </div>
    </div>
  );
}
