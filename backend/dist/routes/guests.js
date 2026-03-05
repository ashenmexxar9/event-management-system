"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const guests_1 = require("../controllers/guests");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get('/:eventId/guests', guests_1.getGuests);
router.post('/:eventId/guests', guests_1.createGuest);
router.put('/:eventId/guests/:guestId', guests_1.updateGuest);
router.delete('/:eventId/guests/:guestId', guests_1.deleteGuest);
exports.default = router;
//# sourceMappingURL=guests.js.map