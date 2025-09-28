import React, { useState, useEffect } from 'react';
import { HeartIcon, ChatBubbleOvalLeftIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Mock notifications data
    setNotifications([
      {
        id: 1,
        type: 'like',
        user: { username: 'john_doe', profilePicture: null },
        message: 'liked your photo',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        read: false,
        postImage: 'https://picsum.photos/100/100?random=1'
      },
      {
        id: 2,
        type: 'comment',
        user: { username: 'jane_smith', profilePicture: null },
        message: 'commented: "Amazing shot! 📸"',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        read: false,
        postImage: 'https://picsum.photos/100/100?random=2'
      },
      {
        id: 3,
        type: 'follow',
        user: { username: 'alex_wilson', profilePicture: null },
        message: 'started following you',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: true
      },
      {
        id: 4,
        type: 'like',
        user: { username: 'sarah_jones', profilePicture: null },
        message: 'liked your photo',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        read: true,
        postImage: 'https://picsum.photos/100/100?random=3'
      },
      {
        id: 5,
        type: 'comment',
        user: { username: 'mike_brown', profilePicture: null },
        message: 'commented: "Love this! 🔥"',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: true,
        postImage: 'https://picsum.photos/100/100?random=4'
      }
    ]);
  }, []);

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <HeartSolidIcon className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <ChatBubbleOvalLeftIcon className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlusIcon className="w-5 h-5 text-green-500" />;
      default:
        return <HeartIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    return notification.type === activeTab;
  });

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  return (
    <div className="max-w-md mx-auto bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Notifications</h1>
          <button
            onClick={markAllAsRead}
            className="text-instagram-blue text-sm font-medium hover:text-blue-700"
          >
            Mark all read
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6">
          {['all', 'unread', 'like', 'comment', 'follow'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm font-medium capitalize ${
                activeTab === tab
                  ? 'text-black border-b-2 border-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-100">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <HeartIcon className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => !notification.read && markAsRead(notification.id)}
              className={`p-4 cursor-pointer hover:bg-gray-50 ${
                !notification.read ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* User Avatar */}
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold">
                      {notification.user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{notification.user.username}</span>
                        {' '}
                        <span className="text-gray-600">{notification.message}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>

                    {/* Post thumbnail */}
                    {notification.postImage && (
                      <div className="ml-3">
                        <img
                          src={notification.postImage}
                          alt="Post"
                          className="w-10 h-10 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Unread indicator */}
                {!notification.read && (
                  <div className="w-2 h-2 bg-instagram-blue rounded-full"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
