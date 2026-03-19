import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getFeedbacksForEvent,
  getFeedbacksByUser,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  getFeedbackStats,
} from '../controllers/feedbacks';

const router = Router();

router.use(authMiddleware);

// Get all feedbacks for an event (admin/event owner only)
router.get('/:eventId/feedbacks', getFeedbacksForEvent);

// Get current user's feedback for an event
router.get('/:eventId/feedbacks/me', getFeedbacksByUser);

// Get feedback statistics for an event
router.get('/:eventId/feedbacks/stats', getFeedbackStats);

// Create feedback
router.post('/:eventId/feedbacks', createFeedback);

// Update feedback
router.put('/:eventId/feedbacks/:feedbackId', updateFeedback);

// Delete feedback
router.delete('/:eventId/feedbacks/:feedbackId', deleteFeedback);

export default router;
