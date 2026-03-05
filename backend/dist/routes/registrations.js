"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const registrations_1 = require("../controllers/registrations");
const router = (0, express_1.Router)({ mergeParams: true });
router.use(auth_1.authMiddleware);
// /api/events/:eventId/registrations
router.get('/', registrations_1.getRegistrations);
router.post('/', registrations_1.createRegistration);
router.put('/:registrationId', registrations_1.updateRegistration);
router.delete('/:registrationId', registrations_1.deleteRegistration);
exports.default = router;
//# sourceMappingURL=registrations.js.map