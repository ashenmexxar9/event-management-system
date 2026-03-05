"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const sponsors_1 = require("../controllers/sponsors");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get('/', sponsors_1.getSponsors);
router.post('/', sponsors_1.createSponsor);
router.get('/:id', sponsors_1.getSponsorById);
router.put('/:id', sponsors_1.updateSponsor);
router.delete('/:id', sponsors_1.deleteSponsor);
router.get('/:id/deals', sponsors_1.getSponsorDeals);
exports.default = router;
//# sourceMappingURL=sponsors.js.map