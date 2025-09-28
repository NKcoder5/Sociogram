import React, { useState, useEffect, useRef } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';
import { useNotifications } from '../../context/NotificationContext';
import NotificationPanel from './NotificationPanel';

const NotificationBell = () => {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const bellRef = useRef(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    try {
      setError(null);
      setIsOpen(!isOpen);
    } catch (err) {
      setError('Failed to open notifications');
      console.error('Notification toggle error:', err);
    }
  };

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all duration-200"
      >
        {unreadCount > 0 ? (
          <BellIconSolid className="w-6 h-6 text-purple-600" />
        ) : (
          <BellIcon className="w-6 h-6" />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
};

export default NotificationBell;
