"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const events_1 = require("../controllers/events");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get('/', events_1.getEvents);
router.post('/', events_1.createEvent);
router.get('/:id', events_1.getEventById);
router.put('/:id', events_1.updateEvent);
router.delete('/:id', events_1.deleteEvent);
exports.default = router;
//# sourceMappingURL=events.js.map