import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { notificationAPI } from '../utils/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Set up socket event listeners for notifications
  useEffect(() => {
    if (socket && user) {
      console.log('🔔 Setting up notification socket listeners');

      const handleNewNotification = (notification) => {
        console.log('📬 New notification received:', notification);
        
        // Prevent duplicate notifications
        setNotifications(prev => {
          const isDuplicate = prev.find(n => 
            n.id === notification.id || 
            (n.type === notification.type && 
             n.senderId === notification.senderId && 
             n.receiverId === notification.receiverId &&
             Math.abs(new Date(n.createdAt) - new Date(notification.createdAt)) < 5000)
          );
          
          if (isDuplicate) {
            console.log('Duplicate notification ignored:', notification.id);
            return prev;
          }
          
          return [notification, ...prev];
        });
        
        setUnreadCount(prev => prev + 1);
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          const title = notification.type === 'message' 
            ? `New message from ${notification.sender?.username || 'Someone'}`
            : notification.message;
          
          const body = notification.type === 'message' 
            ? notification.metadata?.messageText || 'You have a new message'
            : '';
            
          new Notification(title, {
            body,
            icon: notification.sender?.profilePicture || '/favicon.ico',
            badge: '/favicon.ico',
            tag: notification.type === 'message' ? `message-${notification.metadata?.conversationId}` : `notification-${notification.id}`
          });
        }
      };

      socket.on('newNotification', handleNewNotification);

      return () => {
        socket.off('newNotification', handleNewNotification);
      };
    }
  }, [socket, user]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  const fetchNotifications = useCallback(async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      const response = await notificationAPI.getNotifications(page, limit);
      if (page === 1) {
        setNotifications(response.data.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.data.notifications]);
      }
      setLoading(false);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
      return { notifications: [], unreadCount: 0 };
    }
  }, []);

  // Fetch initial notifications and unread count
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user, fetchNotifications]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(notifications.filter(notif => notif.id !== notificationId));
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    socket
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
