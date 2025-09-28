import React, { useEffect } from 'react';
import { 
  BellIcon, 
  HeartIcon, 
  ChatBubbleOvalLeftIcon, 
  UserPlusIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';
import { useNotifications } from '../../context/NotificationContext';

const NotificationPanel = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    unreadCount, 
    loading,
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDeleteNotification = (notificationId) => {
    deleteNotification(notificationId);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <HeartIcon className="w-4 h-4 text-red-500" />;
      case 'comment':
        return <ChatBubbleOvalLeftIcon className="w-4 h-4 text-blue-500" />;
      case 'follow':
        return <UserPlusIcon className="w-4 h-4 text-green-500" />;
      case 'message':
        return <ChatBubbleOvalLeftIcon className="w-4 h-4 text-purple-500" />;
      default:
        return <BellIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-16 right-0 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <BellIconSolid className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BellIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.filter(notification => notification && notification.id).map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.isRead ? 'bg-purple-50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {notification.sender?.username?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {getNotificationIcon(notification.type)}
                      <span className="text-sm font-medium text-gray-900">
                        {notification.sender?.username || 'Unknown User'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {notification.message}
                    </p>
                    {notification.type === 'message' && notification.metadata?.messageText && (
                      <div className="bg-gray-100 rounded-lg p-2 text-xs text-gray-600 italic">
                        "{notification.metadata.messageText}"
                      </div>
                    )}
                    {notification.post && (
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        {notification.post.image && (
                          <img
                            src={notification.post.image}
                            alt="Post"
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <span>on your post</span>
                        <span className="truncate">
                          {notification.post.caption || 'Post'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        title="Mark as read"
                      >
                        <CheckIcon className="w-4 h-4 text-green-500" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                      title="Delete notification"
                    >
                      <XMarkIcon className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
