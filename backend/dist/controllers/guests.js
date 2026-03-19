"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGuest = exports.updateGuest = exports.createGuest = exports.getGuests = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../database");
const getGuests = async (req, res) => {
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
        // allow search by name/email/phone and filter by rsvp_status or tag
        const { q, rsvp_status, tag } = req.query;
        let base = 'SELECT * FROM guests WHERE event_id = ?';
        const params2 = [eventId];
        if (q) {
            base += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
            const term = `%${q}%`;
            params2.push(term, term, term);
        }
        if (rsvp_status) {
            base += ' AND rsvp_status = ?';
            params2.push(rsvp_status);
        }
        if (tag) {
            base += ' AND tag = ?';
            params2.push(tag);
        }
        base += ' ORDER BY created_at DESC';
        const guests = await (0, database_1.allAsync)(base, params2);
        res.json(guests);
    }
    catch (error) {
        console.error('Get guests error:', error);
        res.status(500).json({ error: 'Failed to fetch guests' });
    }
};
exports.getGuests = getGuests;
const createGuest = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { eventId } = req.params;
        const { name, email, phone, tag, rsvp_status = 'Pending' } = req.body;
        if (!name)
            return res.status(400).json({ error: 'Name is required' });
        const event = await (0, database_1.getAsync)('SELECT * FROM events WHERE id = ?', [eventId]);
        if (!event)
            return res.status(404).json({ error: 'Event not found' });
        if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const id = (0, uuid_1.v4)();
        await (0, database_1.runAsync)(`INSERT INTO guests (id, event_id, name, email, phone, tag, rsvp_status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [id, eventId, name, email || null, phone || null, tag || null, rsvp_status]);
        const guest = await (0, database_1.getAsync)('SELECT * FROM guests WHERE id = ?', [id]);
        res.status(201).json(guest);
    }
    catch (error) {
        console.error('Create guest error:', error);
        res.status(500).json({ error: 'Failed to create guest' });
    }
};
exports.createGuest = createGuest;
const updateGuest = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { eventId, guestId } = req.params;
        const guest = await (0, database_1.getAsync)('SELECT * FROM guests WHERE id = ?', [guestId]);
        if (!guest)
            return res.status(404).json({ error: 'Guest not found' });
        const event = await (0, database_1.getAsync)('SELECT * FROM events WHERE id = ?', [eventId]);
        if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const { name, email, phone, tag, rsvp_status } = req.body;
        await (0, database_1.runAsync)(`UPDATE guests SET name = ?, email = ?, phone = ?, tag = ?, rsvp_status = ?
       WHERE id = ?`, [
            name || guest.name,
            email !== undefined ? email : guest.email,
            phone !== undefined ? phone : guest.phone,
            tag !== undefined ? tag : guest.tag,
            rsvp_status || guest.rsvp_status,
            guestId,
        ]);
        const updated = await (0, database_1.getAsync)('SELECT * FROM guests WHERE id = ?', [guestId]);
        res.json(updated);
    }
    catch (error) {
        console.error('Update guest error:', error);
        res.status(500).json({ error: 'Failed to update guest' });
    }
};
exports.updateGuest = updateGuest;
const deleteGuest = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { eventId, guestId } = req.params;
        const guest = await (0, database_1.getAsync)('SELECT * FROM guests WHERE id = ?', [guestId]);
        if (!guest)
            return res.status(404).json({ error: 'Guest not found' });
        const event = await (0, database_1.getAsync)('SELECT * FROM events WHERE id = ?', [eventId]);
        if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        await (0, database_1.runAsync)('DELETE FROM guests WHERE id = ?', [guestId]);
        res.json({ message: 'Guest deleted successfully' });
    }
    catch (error) {
        console.error('Delete guest error:', error);
        res.status(500).json({ error: 'Failed to delete guest' });
    }
};
exports.deleteGuest = deleteGuest;
//# sourceMappingURL=guests.js.map