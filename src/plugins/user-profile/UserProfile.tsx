import { PluginProps } from '@/pluginSystem/types/pluginTypes';
import React, { useState } from 'react';

interface UserData {
  name: string;
  avatar: string;
  email: string;
  role: string;
}

interface UserProfileConfig {
  showEmail?: boolean;
  showRole?: boolean;
  avatarSize?: 'small' | 'medium' | 'large';
}

const UserProfile: React.FC<PluginProps & UserProfileConfig> = ({
  zoneName,
  config,
  instanceId
}) => {
  const {
    showEmail = true,
    showRole = true,
    avatarSize = 'medium'
  }: UserProfileConfig = config || {};

  const [userData] = useState<UserData>({
    name: 'Jane Smith',
    avatar: 'JS',
    email: 'jane.smith@example.com',
    role: 'Administrator'
  });

  const sizeMap: Record<'small' | 'medium' | 'large', string> = {
    small: 'avatar-sm w-8 h-8 text-sm',
    medium: 'avatar-md w-12 h-12 text-base',
    large: 'avatar-lg w-16 h-16 text-lg'
  };

  const avatarSizeClass = sizeMap[avatarSize];

  return (
    <div className="user-profile flex items-center gap-4 p-4 bg-white rounded-md shadow-sm">
      <div
        className={`user-avatar flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold ${avatarSizeClass}`}
      >
        {userData.avatar}
      </div>

      <div className="user-info flex flex-col text-sm text-gray-800">
        <div className="user-name font-medium text-base">{userData.name}</div>
        {showEmail && <div className="user-email text-gray-500">{userData.email}</div>}
        {showRole && <div className="user-role text-gray-400 italic">{userData.role}</div>}
      </div>

      <div className="widget-footer ml-auto text-xs text-gray-300">
        Zone: {zoneName}
      </div>
    </div>
  );
};

// config meta
const UserProfilePlugin = {
  id: 'user-profile',
  name: 'User Profile',
  version: '1.0.0',
  description: 'Displays user information',
  allowedZones: ['header', 'sidebar'],
  component: UserProfile,
  defaultConfig: {
    showEmail: true,
    showRole: true,
    avatarSize: 'medium'
  }
};

export default UserProfilePlugin;
