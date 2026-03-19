"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const feedbacks_1 = require("../controllers/feedbacks");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
// Get all feedbacks for an event (admin/event owner only)
router.get('/:eventId/feedbacks', feedbacks_1.getFeedbacksForEvent);
// Get current user's feedback for an event
router.get('/:eventId/feedbacks/me', feedbacks_1.getFeedbacksByUser);
// Get feedback statistics for an event
router.get('/:eventId/feedbacks/stats', feedbacks_1.getFeedbackStats);
// Create feedback
router.post('/:eventId/feedbacks', feedbacks_1.createFeedback);
// Update feedback
router.put('/:eventId/feedbacks/:feedbackId', feedbacks_1.updateFeedback);
// Delete feedback
router.delete('/:eventId/feedbacks/:feedbackId', feedbacks_1.deleteFeedback);
exports.default = router;
//# sourceMappingURL=feedbacks.js.map