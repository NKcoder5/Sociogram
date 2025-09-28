import prisma from "../utils/prisma.js";
import { getSocketInstance } from "../config/socket.js";

// Create a notification
export const createNotification = async (senderId, receiverId, type, message, postId = null) => {
    try {
        // Don't create notification if sender and receiver are the same
        if (senderId === receiverId) return null;

        const notification = await prisma.notification.create({
            data: {
                senderId,
                receiverId,
                type,
                message,
                postId
            },
            include: {
                sender: {
                    select: { id: true, username: true, profilePicture: true }
                },
                post: postId ? {
                    select: { id: true, caption: true, image: true }
                } : false
            }
        });

        // Emit real-time notification
        const io = getSocketInstance();
        if (io) {
            io.to(`user_${receiverId}`).emit('newNotification', notification);
        }

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};

// Get user notifications
export const getNotifications = async (req, res) => {
    try {
        const userId = req.id;
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const notifications = await prisma.notification.findMany({
            where: { receiverId: userId },
            include: {
                sender: {
                    select: { id: true, username: true, profilePicture: true }
                },
                post: {
                    select: { id: true, caption: true, image: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: parseInt(skip),
            take: parseInt(limit)
        });

        const unreadCount = await prisma.notification.count({
            where: { receiverId: userId, isRead: false }
        });

        return res.status(200).json({
            success: true,
            notifications,
            unreadCount,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: notifications.length
            }
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
    try {
        const userId = req.id;
        const { notificationId } = req.params;

        const notification = await prisma.notification.update({
            where: {
                id: notificationId,
                receiverId: userId // Ensure user can only mark their own notifications
            },
            data: { isRead: true }
        });

        return res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            notification
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.id;

        await prisma.notification.updateMany({
            where: {
                receiverId: userId,
                isRead: false
            },
            data: { isRead: true }
        });

        return res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Delete notification
export const deleteNotification = async (req, res) => {
    try {
        const userId = req.id;
        const { notificationId } = req.params;

        await prisma.notification.delete({
            where: {
                id: notificationId,
                receiverId: userId // Ensure user can only delete their own notifications
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.id;

        const unreadCount = await prisma.notification.count({
            where: { receiverId: userId, isRead: false }
        });

        return res.status(200).json({
            success: true,
            unreadCount
        });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
