"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadCount = exports.createNotification = exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../database");
const getNotifications = async (req, res) => {
    try {
        const user = req.user;
        if (!user || !user.id) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const userId = user.id;
        const notifications = await (0, database_1.allAsync)(`SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`, [userId]);
        res.json(notifications);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!user || !user.id) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const userId = user.id;
        // Verify notification belongs to user
        const notification = await (0, database_1.getAsync)('SELECT * FROM notifications WHERE id = ? AND user_id = ?', [id, userId]);
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        await (0, database_1.runAsync)('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
        res.json({ message: 'Notification marked as read' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res) => {
    try {
        const user = req.user;
        if (!user || !user.id) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const userId = user.id;
        await (0, database_1.runAsync)('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
        res.json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
};
exports.markAllAsRead = markAllAsRead;
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!user || !user.id) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const userId = user.id;
        // Verify notification belongs to user
        const notification = await (0, database_1.getAsync)('SELECT * FROM notifications WHERE id = ? AND user_id = ?', [id, userId]);
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        await (0, database_1.runAsync)('DELETE FROM notifications WHERE id = ?', [id]);
        res.json({ message: 'Notification deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete notification' });
    }
};
exports.deleteNotification = deleteNotification;
const createNotification = async (userId, eventId, type, title, message, reminderTime) => {
    try {
        const notificationId = (0, uuid_1.v4)();
        await (0, database_1.runAsync)(`INSERT INTO notifications (id, user_id, event_id, type, title, message, reminder_time, is_read)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`, [notificationId, userId, eventId, type, title, message, reminderTime || null]);
        return notificationId;
    }
    catch (error) {
        console.error('Failed to create notification:', error);
        throw error;
    }
};
exports.createNotification = createNotification;
const getUnreadCount = async (req, res) => {
    try {
        const user = req.user;
        if (!user || !user.id) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const userId = user.id;
        const result = await (0, database_1.getAsync)('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0', [userId]);
        res.json({ unreadCount: result?.count || 0 });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch unread count' });
    }
};
exports.getUnreadCount = getUnreadCount;
//# sourceMappingURL=notifications.js.map