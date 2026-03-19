"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const users_1 = require("../controllers/users");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
// Get all users (admin only)
router.get('/', users_1.getAllUsers);
// Search users (admin only)
router.get('/search', users_1.searchUsers);
// Update user role (admin only)
router.put('/:userId/role', users_1.updateUserRole);
// Delete user (admin only)
router.delete('/:userId', users_1.deleteUser);
exports.default = router;
//# sourceMappingURL=users.js.map