import express from "express";
import { 
    getNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    getUnreadCount 
} from "../controllers/notification.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Get user notifications
router.get('/', isAuthenticated, getNotifications);

// Get unread count
router.get('/unread-count', isAuthenticated, getUnreadCount);

// Mark notification as read
router.put('/:notificationId/read', isAuthenticated, markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', isAuthenticated, markAllAsRead);

// Delete notification
router.delete('/:notificationId', isAuthenticated, deleteNotification);

export default router;
