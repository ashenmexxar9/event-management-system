"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSponsorDeals = exports.deleteSponsor = exports.updateSponsor = exports.createSponsor = exports.getSponsorById = exports.getSponsors = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../database");
const getSponsors = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { q } = req.query;
        let query = 'SELECT * FROM sponsors';
        const params = [];
        const conds = [];
        if (req.user.role !== 'ADMIN') {
            conds.push('owner_id = ?');
            params.push(req.user.id);
        }
        if (q) {
            conds.push('name LIKE ?');
            params.push(`%${q}%`);
        }
        if (conds.length > 0) {
            query += ' WHERE ' + conds.join(' AND ');
        }
        const sponsors = await (0, database_1.allAsync)(query + ' ORDER BY created_at DESC', params);
        res.json(sponsors);
    }
    catch (error) {
        console.error('Get sponsors error:', error);
        res.status(500).json({ error: 'Failed to fetch sponsors' });
    }
};
exports.getSponsors = getSponsors;
const getSponsorById = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { id } = req.params;
        const sponsor = await (0, database_1.getAsync)('SELECT * FROM sponsors WHERE id = ?', [id]);
        if (!sponsor) {
            return res.status(404).json({ error: 'Sponsor not found' });
        }
        if (req.user.role !== 'ADMIN' && sponsor.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json(sponsor);
    }
    catch (error) {
        console.error('Get sponsor error:', error);
        res.status(500).json({ error: 'Failed to fetch sponsor' });
    }
};
exports.getSponsorById = getSponsorById;
const createSponsor = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { name, companyType, company_type, contactPerson, contact_person, contactEmail, contact_email, contactPhone, contact_phone, notes, } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }
        const id = (0, uuid_1.v4)();
        const ownerId = req.user.id;
        await (0, database_1.runAsync)(`INSERT INTO sponsors (id, owner_id, name, company_type, contact_person, contact_email, contact_phone, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
            id,
            ownerId,
            name,
            companyType ?? company_type ?? null,
            contactPerson ?? contact_person ?? null,
            contactEmail ?? contact_email ?? null,
            contactPhone ?? contact_phone ?? null,
            notes || null,
        ]);
        const sponsor = await (0, database_1.getAsync)('SELECT * FROM sponsors WHERE id = ?', [id]);
        res.status(201).json(sponsor);
    }
    catch (error) {
        console.error('Create sponsor error:', error);
        res.status(500).json({ error: 'Failed to create sponsor' });
    }
};
exports.createSponsor = createSponsor;
const updateSponsor = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { id } = req.params;
        const existing = await (0, database_1.getAsync)('SELECT * FROM sponsors WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ error: 'Sponsor not found' });
        }
        if (req.user.role !== 'ADMIN' && existing.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const { name, companyType, company_type, contactPerson, contact_person, contactEmail, contact_email, contactPhone, contact_phone, notes, } = req.body;
        await (0, database_1.runAsync)(`UPDATE sponsors
       SET name = ?, company_type = ?, contact_person = ?, contact_email = ?, contact_phone = ?, notes = ?
       WHERE id = ?`, [
            name || existing.name,
            companyType ?? company_type ?? existing.company_type,
            contactPerson ?? contact_person ?? existing.contact_person,
            contactEmail ?? contact_email ?? existing.contact_email,
            contactPhone ?? contact_phone ?? existing.contact_phone,
            notes !== undefined ? notes : existing.notes,
            id,
        ]);
        const updated = await (0, database_1.getAsync)('SELECT * FROM sponsors WHERE id = ?', [id]);
        res.json(updated);
    }
    catch (error) {
        console.error('Update sponsor error:', error);
        res.status(500).json({ error: 'Failed to update sponsor' });
    }
};
exports.updateSponsor = updateSponsor;
const deleteSponsor = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { id } = req.params;
        const existing = await (0, database_1.getAsync)('SELECT * FROM sponsors WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json({ error: 'Sponsor not found' });
        }
        if (req.user.role !== 'ADMIN' && existing.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        await (0, database_1.runAsync)('DELETE FROM sponsors WHERE id = ?', [id]);
        res.json({ message: 'Sponsor deleted successfully' });
    }
    catch (error) {
        console.error('Delete sponsor error:', error);
        res.status(500).json({ error: 'Failed to delete sponsor' });
    }
};
exports.deleteSponsor = deleteSponsor;
const getSponsorDeals = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { id } = req.params;
        const sponsor = await (0, database_1.getAsync)('SELECT * FROM sponsors WHERE id = ?', [id]);
        if (!sponsor) {
            return res.status(404).json({ error: 'Sponsor not found' });
        }
        if (req.user.role !== 'ADMIN' && sponsor.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const deals = await (0, database_1.allAsync)(`SELECT d.*, e.title as event_title, e.date as event_date
       FROM sponsorship_deals d
       JOIN events e ON d.event_id = e.id
       WHERE d.sponsor_id = ?
       ORDER BY d.created_at DESC`, [id]);
        res.json(deals);
    }
    catch (error) {
        console.error('Get sponsor deals error:', error);
        res.status(500).json({ error: 'Failed to fetch sponsor deals' });
    }
};
exports.getSponsorDeals = getSponsorDeals;
//# sourceMappingURL=sponsors.js.map