import { PluginProps } from '@/core/pluginSystem/types/pluginTypes';
import React from 'react';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterLinksConfig {
  links?: FooterLink[];
  align?: 'left' | 'center' | 'right';
  muted?: boolean;
}

const FooterLinks: React.FC<PluginProps & FooterLinksConfig> = ({
  zoneName,
  config,
  instanceId
}) => {
  const {
    links = [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Contact', href: '#' }
    ],
    align = 'center',
    muted = true
  }: FooterLinksConfig = config || {};

  const alignmentMap: Record<'left' | 'center' | 'right', string> = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  return (
    <div
      className={`footer-links w-full px-4 py-3 flex ${alignmentMap[align]} flex-wrap gap-4 text-sm ${
        muted ? 'text-gray-400' : 'text-gray-700'
      }`}
    >
      {links.map((link, idx) => (
        <a
          key={idx}
          href={link.href}
          className="hover:text-blue-600 transition-colors"
        >
          {link.label}
        </a>
      ))}
      <div className="widget-footer ml-auto text-xs text-gray-300">
        Zone: {zoneName}
      </div>
    </div>
  );
};

const FooterLinksPlugin = {
  id: 'footer-links',
  name: 'Footer Links',
  version: '1.0.0',
  description: 'Displays a row of footer links',
  allowedZones: ['footer'],
  component: FooterLinks,
  defaultConfig: {
    align: 'center',
    muted: true,
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Contact', href: '#' }
    ]
  }
};

export default FooterLinksPlugin;
