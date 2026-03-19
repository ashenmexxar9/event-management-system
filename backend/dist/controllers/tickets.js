"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTicketStatus = exports.deleteTicket = exports.updateTicket = exports.createTicket = exports.getTicketById = exports.getTickets = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../database");
const getTickets = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { q, status } = req.query;
        let sql = 'SELECT * FROM tickets WHERE event_id = ?';
        const params2 = [eventId];
        if (q) {
            sql += ' AND name LIKE ?';
            params2.push(`%${q}%`);
        }
        if (status) {
            sql += ' AND status = ?';
            params2.push(status);
        }
        sql += ' ORDER BY created_at DESC';
        const tickets = await (0, database_1.allAsync)(sql, params2);
        res.json(tickets);
    }
    catch (error) {
        console.error('Get tickets error:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
};
exports.getTickets = getTickets;
const getTicketById = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const ticket = await (0, database_1.getAsync)('SELECT * FROM tickets WHERE id = ?', [ticketId]);
        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        res.json(ticket);
    }
    catch (error) {
        console.error('Get ticket error:', error);
        res.status(500).json({ error: 'Failed to fetch ticket' });
    }
};
exports.getTicketById = getTicketById;
const createTicket = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { name, price, totalQuantity, total_quantity, saleStartDate, sale_start_date, saleEndDate, sale_end_date, status = 'Active', } = req.body;
        const resolvedTotalQuantity = totalQuantity ?? total_quantity;
        const resolvedSaleStartDate = saleStartDate ?? sale_start_date;
        const resolvedSaleEndDate = saleEndDate ?? sale_end_date;
        if (!name || price === undefined || resolvedTotalQuantity === undefined) {
            return res
                .status(400)
                .json({ error: 'Name, price and totalQuantity are required' });
        }
        const id = (0, uuid_1.v4)();
        await (0, database_1.runAsync)(`INSERT INTO tickets (id, event_id, name, price, total_quantity, sold_quantity, sale_start_date, sale_end_date, status)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`, [
            id,
            eventId,
            name,
            price,
            resolvedTotalQuantity,
            resolvedSaleStartDate || null,
            resolvedSaleEndDate || null,
            status,
        ]);
        const ticket = await (0, database_1.getAsync)('SELECT * FROM tickets WHERE id = ?', [id]);
        res.status(201).json(ticket);
    }
    catch (error) {
        console.error('Create ticket error:', error);
        res.status(500).json({ error: 'Failed to create ticket' });
    }
};
exports.createTicket = createTicket;
const updateTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const existing = await (0, database_1.getAsync)('SELECT * FROM tickets WHERE id = ?', [ticketId]);
        if (!existing) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        const { name, price, totalQuantity, total_quantity, saleStartDate, sale_start_date, saleEndDate, sale_end_date, status, } = req.body;
        const resolvedTotalQuantity = totalQuantity ?? total_quantity;
        const resolvedSaleStartDate = saleStartDate ?? sale_start_date;
        const resolvedSaleEndDate = saleEndDate ?? sale_end_date;
        await (0, database_1.runAsync)(`UPDATE tickets
       SET name = ?, price = ?, total_quantity = ?, sale_start_date = ?, sale_end_date = ?, status = ?
       WHERE id = ?`, [
            name || existing.name,
            price !== undefined ? price : existing.price,
            resolvedTotalQuantity !== undefined ? resolvedTotalQuantity : existing.total_quantity,
            resolvedSaleStartDate !== undefined ? resolvedSaleStartDate : existing.sale_start_date,
            resolvedSaleEndDate !== undefined ? resolvedSaleEndDate : existing.sale_end_date,
            status || existing.status,
            ticketId,
        ]);
        const updated = await (0, database_1.getAsync)('SELECT * FROM tickets WHERE id = ?', [ticketId]);
        res.json(updated);
    }
    catch (error) {
        console.error('Update ticket error:', error);
        res.status(500).json({ error: 'Failed to update ticket' });
    }
};
exports.updateTicket = updateTicket;
const deleteTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const existing = await (0, database_1.getAsync)('SELECT * FROM tickets WHERE id = ?', [ticketId]);
        if (!existing) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        await (0, database_1.runAsync)('DELETE FROM tickets WHERE id = ?', [ticketId]);
        res.json({ message: 'Ticket deleted successfully' });
    }
    catch (error) {
        console.error('Delete ticket error:', error);
        res.status(500).json({ error: 'Failed to delete ticket' });
    }
};
exports.deleteTicket = deleteTicket;
// Helper to update ticket status based on quantity and sale dates
const refreshTicketStatus = async (ticketId) => {
    const ticket = await (0, database_1.getAsync)('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    if (!ticket)
        return;
    const now = new Date();
    const saleEnd = ticket.sale_end_date ? new Date(ticket.sale_end_date) : null;
    let newStatus = ticket.status;
    if (ticket.sold_quantity >= ticket.total_quantity) {
        newStatus = 'SoldOut';
    }
    else if (saleEnd && now > saleEnd) {
        newStatus = 'Closed';
    }
    else {
        newStatus = 'Active';
    }
    if (newStatus !== ticket.status) {
        await (0, database_1.runAsync)('UPDATE tickets SET status = ? WHERE id = ?', [newStatus, ticketId]);
    }
};
exports.refreshTicketStatus = refreshTicketStatus;
//# sourceMappingURL=tickets.js.map