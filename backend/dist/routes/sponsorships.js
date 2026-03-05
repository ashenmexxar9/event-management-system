"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const sponsorships_1 = require("../controllers/sponsorships");
const router = (0, express_1.Router)({ mergeParams: true });
router.use(auth_1.authMiddleware);
// /api/events/:eventId/sponsorships
router.get('/', sponsorships_1.getDealsForEvent);
router.post('/', sponsorships_1.createDeal);
router.put('/:dealId', sponsorships_1.updateDeal);
router.delete('/:dealId', sponsorships_1.deleteDeal);
exports.default = router;
//# sourceMappingURL=sponsorships.js.map