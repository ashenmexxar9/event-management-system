"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const budget_1 = require("../controllers/budget");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
// Vendors routes
router.get('/:eventId/vendors', budget_1.getVendors);
router.post('/:eventId/vendors', budget_1.createVendor);
router.put('/:eventId/vendors/:vendorId', budget_1.updateVendor);
router.delete('/:eventId/vendors/:vendorId', budget_1.deleteVendor);
// Expenses routes
router.get('/:eventId/expenses', budget_1.getExpenses);
router.post('/:eventId/expenses', budget_1.createExpense);
router.put('/:eventId/expenses/:expenseId', budget_1.updateExpense);
router.delete('/:eventId/expenses/:expenseId', budget_1.deleteExpense);
exports.default = router;
//# sourceMappingURL=budget.js.map