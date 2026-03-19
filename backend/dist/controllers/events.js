"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventById = exports.deleteEvent = exports.updateEvent = exports.createEvent = exports.getEvents = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../database");
const getEvents = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        // support optional query params: q (search term), status
        const { q, status } = req.query;
        let query = 'SELECT * FROM events';
        const params = [];
        const conditions = [];
        // For non-admins: show Published events from anyone + their own events (all statuses)
        if (req.user.role !== 'ADMIN') {
            conditions.push('(status = ? OR owner_id = ?)');
            params.push('Published', req.user.id);
        }
        if (q) {
            conditions.push('(title LIKE ? OR description LIKE ? OR location LIKE ?)');
            const term = `%${q}%`;
            params.push(term, term, term);
        }
        if (status) {
            conditions.push('status = ?');
            params.push(status);
        }
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        const events = await (0, database_1.allAsync)(query + ' ORDER BY date DESC', params);
        res.json(events);
    }
    catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};
exports.getEvents = getEvents;
const createEvent = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { title, description, date, time, location, status = 'Draft', cover_image, } = req.body;
        if (!title || !date || !time) {
            return res.status(400).json({ error: 'Title, date, and time are required' });
        }
        const id = (0, uuid_1.v4)();
        await (0, database_1.runAsync)(`INSERT INTO events (id, owner_id, title, description, date, time, location, status, cover_image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            id,
            req.user.id,
            title,
            description || null,
            date,
            time,
            location || null,
            status,
            cover_image || null,
        ]);
        const event = await (0, database_1.getAsync)('SELECT * FROM events WHERE id = ?', [id]);
        res.status(201).json(event);
    }
    catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
};
exports.createEvent = createEvent;
const updateEvent = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { id } = req.params;
        const event = await (0, database_1.getAsync)('SELECT * FROM events WHERE id = ?', [id]);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        // Check ownership or admin
        if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const { title, description, date, time, location, status, cover_image, } = req.body;
        await (0, database_1.runAsync)(`UPDATE events SET title = ?, description = ?, date = ?, time = ?, location = ?, status = ?, cover_image = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`, [
            title || event.title,
            description !== undefined ? description : event.description,
            date || event.date,
            time || event.time,
            location !== undefined ? location : event.location,
            status || event.status,
            cover_image !== undefined ? cover_image : event.cover_image,
            id,
        ]);
        const updated = await (0, database_1.getAsync)('SELECT * FROM events WHERE id = ?', [id]);
        res.json(updated);
    }
    catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
};
exports.updateEvent = updateEvent;
const deleteEvent = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { id } = req.params;
        const event = await (0, database_1.getAsync)('SELECT * FROM events WHERE id = ?', [id]);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        // Check ownership or admin
        if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        await (0, database_1.runAsync)('DELETE FROM events WHERE id = ?', [id]);
        res.json({ message: 'Event deleted successfully' });
    }
    catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
};
exports.deleteEvent = deleteEvent;
const getEventById = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { id } = req.params;
        const event = await (0, database_1.getAsync)('SELECT * FROM events WHERE id = ?', [id]);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        // Check access: allow if owner, admin, or if event is published
        if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id && event.status !== 'Published') {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json(event);
    }
    catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({ error: 'Failed to fetch event' });
    }
};
exports.getEventById = getEventById;
//# sourceMappingURL=events.js.map