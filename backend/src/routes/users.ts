import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getAllUsers,
  deleteUser,
  updateUserRole,
  searchUsers,
} from '../controllers/users';

const router = Router();

router.use(authMiddleware);

// Get all users (admin only)
router.get('/', getAllUsers);

// Search users (admin only)
router.get('/search', searchUsers);

// Update user role (admin only)
router.put('/:userId/role', updateUserRole);

// Delete user (admin only)
router.delete('/:userId', deleteUser);

export default router;
