"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notifications_1 = require("../controllers/notifications");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authMiddleware);
// GET all notifications for user
router.get('/', notifications_1.getNotifications);
// GET unread count
router.get('/unread/count', notifications_1.getUnreadCount);
// PATCH mark notification as read
router.patch('/:id/read', notifications_1.markAsRead);
// PATCH mark all as read
router.patch('/read-all', notifications_1.markAllAsRead);
// DELETE notification
router.delete('/:id', notifications_1.deleteNotification);
exports.default = router;
//# sourceMappingURL=notifications.js.map