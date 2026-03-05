"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const schedule_1 = require("../controllers/schedule");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
// Schedule routes
router.get('/:eventId/schedule', schedule_1.getScheduleItems);
router.post('/:eventId/schedule', schedule_1.createScheduleItem);
router.put('/:eventId/schedule/:scheduleId', schedule_1.updateScheduleItem);
router.delete('/:eventId/schedule/:scheduleId', schedule_1.deleteScheduleItem);
// Tasks routes
router.get('/:eventId/tasks', schedule_1.getTasks);
router.post('/:eventId/tasks', schedule_1.createTask);
router.put('/:eventId/tasks/:taskId', schedule_1.updateTask);
router.delete('/:eventId/tasks/:taskId', schedule_1.deleteTask);
exports.default = router;
//# sourceMappingURL=schedule.js.map