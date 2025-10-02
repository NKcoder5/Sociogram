import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProfilePicture from '../profile/ProfilePicture';
import { 
  HomeIcon, 
  PlusIcon, 
  ChatBubbleLeftIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
  PlayIcon,
  HeartIcon,
  BellIcon,
  ChevronRightIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { Users } from 'lucide-react';
import { 
  HomeIcon as HomeIconSolid,
  ChatBubbleLeftIcon as MessageIconSolid,
  UserIcon as UserIconSolid,
  GlobeAltIcon as GlobeAltIconSolid,
  PlayIcon as PlayIconSolid,
  HeartIcon as HeartIconSolid,
  BellIcon as BellIconSolid
} from '@heroicons/react/24/solid';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    {
      name: 'Feed',
      path: '/feed',
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
    },
    {
      name: 'Explore',
      path: '/explore',
      icon: GlobeAltIcon,
      activeIcon: GlobeAltIconSolid,
    },
    {
      name: 'Reels',
      path: '/reels',
      icon: PlayIcon,
      activeIcon: PlayIconSolid,
    },
    {
      name: 'Messages',
      path: '/messages',
      icon: ChatBubbleLeftIcon,
      activeIcon: MessageIconSolid,
    },
    {
      name: 'Activity',
      path: '/activity',
      icon: HeartIcon,
      activeIcon: HeartIconSolid,
    },
    {
      name: 'Create',
      path: '/create',
      icon: PlusIcon,
      activeIcon: PlusIcon,
    },
    {
      name: 'Profile',
      path: `/profile/${user?.username}`,
      icon: UserIcon,
      activeIcon: UserIconSolid,
    },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-80 bg-white/80 backdrop-blur-lg border-r border-gray-200 z-50 shadow-xl">
      <div className="flex flex-col h-full">
        {/* Logo and User Section */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <img 
                src="/logo.png" 
                alt="Sociogram Logo" 
                className="w-14 h-11 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 object-contain border-2 border-violet-200 hover:border-violet-300"
              />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight mb-0.5">
                  Sociogram
                </h1>
                <p className="text-xs text-gray-500 font-medium">Social Platform</p>
              </div>
            </div>
            
            {/* Sign Out Button - Compact */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 hover:bg-red-50 group ml-3"
              title="Sign Out"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-600 group-hover:text-red-600 transition-colors duration-200" />
            </button>
          </div>
          
          {/* User Info */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4">
            <div className="flex items-center space-x-3">
              <ProfilePicture user={user} size="medium" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{user?.username}</p>
                <p className="text-xs text-gray-600">@{user?.username}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const Icon = isActive ? item.activeIcon : item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-[1.02]' 
                    : 'hover:bg-gray-50 hover:scale-[1.02]'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <Icon className={`h-6 w-6 transition-all duration-200 ${
                    isActive ? 'text-white' : 'text-gray-600 group-hover:text-purple-600'
                  }`} />
                  <span className={`font-medium transition-all duration-200 ${
                    isActive ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'
                  }`}>
                    {item.name}
                  </span>
                </div>
                {hoveredItem === index && !isActive && (
                  <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-all duration-200" />
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Settings Section */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl transition-all duration-200 hover:bg-gray-50 group"
          >
            <div className="flex items-center space-x-3">
              <Cog6ToothIcon className="h-5 w-5 text-gray-600 group-hover:text-purple-600 transition-colors duration-200" />
              <span className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200 text-sm">
                Settings
              </span>
            </div>
            <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors duration-200" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;