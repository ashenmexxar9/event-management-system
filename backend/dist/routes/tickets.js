"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const tickets_1 = require("../controllers/tickets");
const router = (0, express_1.Router)({ mergeParams: true });
router.use(auth_1.authMiddleware);
// /api/events/:eventId/tickets
router.get('/', tickets_1.getTickets);
router.post('/', tickets_1.createTicket);
router.get('/:ticketId', tickets_1.getTicketById);
router.put('/:ticketId', tickets_1.updateTicket);
router.delete('/:ticketId', tickets_1.deleteTicket);
exports.default = router;
//# sourceMappingURL=tickets.js.map