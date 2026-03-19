"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeedbackStats = exports.deleteFeedback = exports.updateFeedback = exports.createFeedback = exports.getFeedbacksByUser = exports.getFeedbacksForEvent = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../database");
const getFeedbacksForEvent = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { eventId } = req.params;
        // Verify event exists and check access
        const event = await (0, database_1.getAsync)('SELECT * FROM events WHERE id = ?', [eventId]);
        if (!event)
            return res.status(404).json({ error: 'Event not found' });
        // Only allow admins or event owner to see feedback
        if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        // Get all feedbacks for the event
        const feedbacks = await (0, database_1.allAsync)(`SELECT f.*, u.name as user_name, u.email as user_email
       FROM feedbacks f
       JOIN users u ON f.user_id = u.id
       WHERE f.event_id = ?
       ORDER BY f.created_at DESC`, [eventId]);
        res.json(feedbacks);
    }
    catch (error) {
        console.error('Get feedbacks error:', error);
        res.status(500).json({ error: 'Failed to fetch feedbacks' });
    }
};
exports.getFeedbacksForEvent = getFeedbacksForEvent;
const getFeedbacksByUser = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { eventId } = req.params;
        // Verify event exists
        const event = await (0, database_1.getAsync)('SELECT * FROM events WHERE id = ?', [eventId]);
        if (!event)
            return res.status(404).json({ error: 'Event not found' });
        // Get feedback submitted by the current user for this event
        const feedback = await (0, database_1.getAsync)('SELECT * FROM feedbacks WHERE event_id = ? AND user_id = ?', [eventId, req.user.id]);
        res.json(feedback || null);
    }
    catch (error) {
        console.error('Get user feedback error:', error);
        res.status(500).json({ error: 'Failed to fetch feedback' });
    }
};
exports.getFeedbacksByUser = getFeedbacksByUser;
const createFeedback = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { eventId } = req.params;
        const { rating, comment } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        const event = await (0, database_1.getAsync)('SELECT * FROM events WHERE id = ?', [eventId]);
        if (!event)
            return res.status(404).json({ error: 'Event not found' });
        // Check if user already submitted feedback for this event
        const existing = await (0, database_1.getAsync)('SELECT id FROM feedbacks WHERE event_id = ? AND user_id = ?', [eventId, req.user.id]);
        if (existing) {
            return res.status(400).json({ error: 'You have already submitted feedback for this event' });
        }
        const id = (0, uuid_1.v4)();
        await (0, database_1.runAsync)(`INSERT INTO feedbacks (id, event_id, user_id, rating, comment)
       VALUES (?, ?, ?, ?, ?)`, [id, eventId, req.user.id, rating, comment || null]);
        const feedback = await (0, database_1.getAsync)('SELECT * FROM feedbacks WHERE id = ?', [id]);
        res.status(201).json(feedback);
    }
    catch (error) {
        console.error('Create feedback error:', error);
        res.status(500).json({ error: 'Failed to create feedback' });
    }
};
exports.createFeedback = createFeedback;
const updateFeedback = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { eventId, feedbackId } = req.params;
        const { rating, comment } = req.body;
        const feedback = await (0, database_1.getAsync)('SELECT * FROM feedbacks WHERE id = ?', [feedbackId]);
        if (!feedback)
            return res.status(404).json({ error: 'Feedback not found' });
        // Only allow the user who submitted the feedback to edit it
        if (feedback.user_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only edit your own feedback' });
        }
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        await (0, database_1.runAsync)(`UPDATE feedbacks SET rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`, [rating || feedback.rating, comment !== undefined ? comment : feedback.comment, feedbackId]);
        const updated = await (0, database_1.getAsync)('SELECT * FROM feedbacks WHERE id = ?', [feedbackId]);
        res.json(updated);
    }
    catch (error) {
        console.error('Update feedback error:', error);
        res.status(500).json({ error: 'Failed to update feedback' });
    }
};
exports.updateFeedback = updateFeedback;
const deleteFeedback = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { eventId, feedbackId } = req.params;
        const feedback = await (0, database_1.getAsync)('SELECT * FROM feedbacks WHERE id = ?', [feedbackId]);
        if (!feedback)
            return res.status(404).json({ error: 'Feedback not found' });
        const event = await (0, database_1.getAsync)('SELECT * FROM events WHERE id = ?', [eventId]);
        // Allow user to delete their own feedback, or admin/event owner to delete any
        if (feedback.user_id !== req.user.id && event.owner_id !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'You can only delete your own feedback' });
        }
        await (0, database_1.runAsync)('DELETE FROM feedbacks WHERE id = ?', [feedbackId]);
        res.json({ message: 'Feedback deleted successfully' });
    }
    catch (error) {
        console.error('Delete feedback error:', error);
        res.status(500).json({ error: 'Failed to delete feedback' });
    }
};
exports.deleteFeedback = deleteFeedback;
const getFeedbackStats = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { eventId } = req.params;
        // Verify event exists and check access
        const event = await (0, database_1.getAsync)('SELECT * FROM events WHERE id = ?', [eventId]);
        if (!event)
            return res.status(404).json({ error: 'Event not found' });
        if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        // Get feedback statistics
        const stats = await (0, database_1.getAsync)(`SELECT
        COUNT(*) as total_feedbacks,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
       FROM feedbacks WHERE event_id = ?`, [eventId]);
        res.json(stats);
    }
    catch (error) {
        console.error('Get feedback stats error:', error);
        res.status(500).json({ error: 'Failed to fetch feedback stats' });
    }
};
exports.getFeedbackStats = getFeedbackStats;
//# sourceMappingURL=feedbacks.js.map