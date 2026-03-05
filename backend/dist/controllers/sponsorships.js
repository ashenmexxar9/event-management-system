"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDeal = exports.updateDeal = exports.createDeal = exports.getDealsForEvent = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../database");
const getDealsForEvent = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { eventId } = req.params;
        const event = await (0, database_1.getAsync)('SELECT * FROM events WHERE id = ?', [eventId]);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const deals = await (0, database_1.allAsync)(`SELECT d.*, s.name as sponsor_name
       FROM sponsorship_deals d
       JOIN sponsors s ON d.sponsor_id = s.id
       WHERE d.event_id = ?
       ORDER BY d.created_at DESC`, [eventId]);
        res.json(deals);
    }
    catch (error) {
        console.error('Get sponsorship deals error:', error);
        res.status(500).json({ error: 'Failed to fetch sponsorship deals' });
    }
};
exports.getDealsForEvent = getDealsForEvent;
const createDeal = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { eventId } = req.params;
        const { sponsorId, sponsor_id, amount, package: pkg, benefits, dealStatus, deal_status, paymentStatus, payment_status, } = req.body;
        const resolvedSponsorId = sponsorId ?? sponsor_id;
        const resolvedDealStatus = dealStatus ?? deal_status ?? 'Proposed';
        const resolvedPaymentStatus = paymentStatus ?? payment_status ?? 'Pending';
        if (!resolvedSponsorId) {
            return res.status(400).json({ error: 'Sponsor is required' });
        }
        const event = await (0, database_1.getAsync)('SELECT * FROM events WHERE id = ?', [eventId]);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const sponsor = await (0, database_1.getAsync)('SELECT * FROM sponsors WHERE id = ?', [
            resolvedSponsorId,
        ]);
        if (!sponsor) {
            return res.status(404).json({ error: 'Sponsor not found' });
        }
        if (req.user.role !== 'ADMIN' && sponsor.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied for this sponsor' });
        }
        const id = (0, uuid_1.v4)();
        await (0, database_1.runAsync)(`INSERT INTO sponsorship_deals (id, sponsor_id, event_id, amount, package, benefits, deal_status, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
            id,
            resolvedSponsorId,
            eventId,
            amount ?? null,
            pkg ?? null,
            benefits ?? null,
            resolvedDealStatus,
            resolvedPaymentStatus,
        ]);
        const deal = await (0, database_1.getAsync)('SELECT * FROM sponsorship_deals WHERE id = ?', [id]);
        res.status(201).json(deal);
    }
    catch (error) {
        console.error('Create sponsorship deal error:', error);
        res.status(500).json({ error: 'Failed to create sponsorship deal' });
    }
};
exports.createDeal = createDeal;
const updateDeal = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { eventId, dealId } = req.params;
        const deal = await (0, database_1.getAsync)('SELECT * FROM sponsorship_deals WHERE id = ?', [
            dealId,
        ]);
        if (!deal || deal.event_id !== eventId) {
            return res.status(404).json({ error: 'Sponsorship deal not found' });
        }
        const event = await (0, database_1.getAsync)('SELECT * FROM events WHERE id = ?', [eventId]);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const { amount, package: pkg, benefits, dealStatus, deal_status, paymentStatus, payment_status, } = req.body;
        const resolvedDealStatus = dealStatus ?? deal_status;
        const resolvedPaymentStatus = paymentStatus ?? payment_status;
        await (0, database_1.runAsync)(`UPDATE sponsorship_deals
       SET amount = ?, package = ?, benefits = ?, deal_status = ?, payment_status = ?
       WHERE id = ?`, [
            amount !== undefined ? amount : deal.amount,
            pkg !== undefined ? pkg : deal.package,
            benefits !== undefined ? benefits : deal.benefits,
            resolvedDealStatus || deal.deal_status,
            resolvedPaymentStatus || deal.payment_status,
            dealId,
        ]);
        const updated = await (0, database_1.getAsync)('SELECT * FROM sponsorship_deals WHERE id = ?', [
            dealId,
        ]);
        res.json(updated);
    }
    catch (error) {
        console.error('Update sponsorship deal error:', error);
        res.status(500).json({ error: 'Failed to update sponsorship deal' });
    }
};
exports.updateDeal = updateDeal;
const deleteDeal = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { eventId, dealId } = req.params;
        const deal = await (0, database_1.getAsync)('SELECT * FROM sponsorship_deals WHERE id = ?', [
            dealId,
        ]);
        if (!deal || deal.event_id !== eventId) {
            return res.status(404).json({ error: 'Sponsorship deal not found' });
        }
        const event = await (0, database_1.getAsync)('SELECT * FROM events WHERE id = ?', [eventId]);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        await (0, database_1.runAsync)('DELETE FROM sponsorship_deals WHERE id = ?', [dealId]);
        res.json({ message: 'Sponsorship deal deleted successfully' });
    }
    catch (error) {
        console.error('Delete sponsorship deal error:', error);
        res.status(500).json({ error: 'Failed to delete sponsorship deal' });
    }
};
exports.deleteDeal = deleteDeal;
//# sourceMappingURL=sponsorships.js.map