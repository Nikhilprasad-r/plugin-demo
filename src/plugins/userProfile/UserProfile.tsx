import React, { useState } from 'react';
import { PluginProps } from '../../core/pluginSystem';

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

  const avatarSizeMap: Record<'small' | 'medium' | 'large', string> = {
    small: 'avatar-sm',
    medium: 'avatar-md',
    large: 'avatar-lg'
  };

  const avatarSizeClass = avatarSizeMap[avatarSize];

  return (
    <div className="user-profile">
      <div className={`user-avatar ${avatarSizeClass}`}>
        {userData.avatar}
      </div>

      <div className="user-info">
        <div className="user-name">{userData.name}</div>

        {showEmail && <div className="user-email">{userData.email}</div>}

        {showRole && <div className="user-role">{userData.role}</div>}
      </div>

      <div className="widget-footer">
        <small>Zone: {zoneName}</small>
      </div>
    </div>
  );
};

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
