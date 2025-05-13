import { PluginProps } from '@/pluginSystem/types/pluginTypes'
import React, { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface BlogWidgetConfig {
  title?: string
  imageUrl?: string
  chartData?: { name: string; value: number; color: string }[]
}

const BlogWidget: React.FC<PluginProps & BlogWidgetConfig> = ({ zoneName, config, instanceId }) => {
  const {
    title = 'Sample Blog Title',
    imageUrl = 'https://via.placeholder.com/400',
    chartData = [
      { name: 'React', value: 40, color: '#61dafb' },
      { name: 'Next.js', value: 30, color: '#000' },
      { name: 'NestJS', value: 30, color: '#ea2845' },
    ],
  } = config || {}

  const [search, setSearch] = useState('')

  return (
    <div className='p-4 bg-white rounded-md shadow-md w-full space-y-4'>
      {/* Title Card */}
      <div className='text-xl font-semibold text-gray-800'>{title}</div>

      {/* Search Box */}
      <input type='text' value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Search...' className='w-full p-2 border rounded-md' />

      {/* Blog Text */}
      <div className='text-gray-600 text-sm'>This is a sample blog text. It supports rich features and components like image viewers and charts.</div>

      {/* Image Viewer */}
      <div className='w-full'>
        <img src={imageUrl} alt='Blog visual' className='w-full h-auto rounded-md object-cover' />
      </div>

      {/* Pie Chart */}
      <div className='h-64 w-full'>
        <ResponsiveContainer>
          <PieChart>
            <Pie dataKey='value' data={chartData} outerRadius={80} label>
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className='text-xs text-gray-400'>Zone: {zoneName}</div>
    </div>
  )
}

const BlogWidgetPlugin = {
  id: 'blog-widget',
  name: 'Blog Widget',
  version: '1.0.0',
  description: 'Displays a blog view with text, image, search box, and pie chart.',
  allowedZones: ['main', 'sidebar'],
  component: BlogWidget,
  defaultConfig: {
    title: 'Sample Blog Title',
    imageUrl: 'https://via.placeholder.com/400',
    chartData: [
      { name: 'React', value: 40, color: '#61dafb' },
      { name: 'Next.js', value: 30, color: '#000' },
      { name: 'NestJS', value: 30, color: '#ea2845' },
    ],
  },
}

export default BlogWidgetPlugin
