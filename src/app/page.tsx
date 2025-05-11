'use client';

import { PluginContainer } from '@/core/components/PluginContainer';

export default function HomePage() {
  return (
    <div className="home-page p-6 bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      <p className="text-gray-600">Welcome to the plugin architecture demo.</p>

      <div className="content-plugins mt-4 border-t pt-4">
        <PluginContainer zoneName="content" />
      </div>
    </div>
  );
}
