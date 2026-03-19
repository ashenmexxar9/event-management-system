import { Request, Response } from 'express';
import { allAsync, getAsync, runAsync } from '../database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    // Only admins can view all users
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const users = await allAsync(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );

    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    // Only admins can delete users
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { userId } = req.params;

    // Prevent deleting self
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await getAsync('SELECT id FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // SQLite foreign keys are enforced (see `PRAGMA foreign_keys = ON`), and
    // several tables reference users without ON DELETE CASCADE.
    // To make admin deletion work, we delete dependencies in the correct order.
    await runAsync('BEGIN TRANSACTION');
    try {
      // User-scoped data
      await runAsync('DELETE FROM notifications WHERE user_id = ?', [userId]);
      await runAsync('DELETE FROM feedbacks WHERE user_id = ?', [userId]);
      await runAsync('DELETE FROM sponsors WHERE owner_id = ?', [userId]);

      // Deleting the user's events will cascade into guests/tasks/vendors/expenses/tickets/registrations
      // because those foreign keys reference events with ON DELETE CASCADE.
      await runAsync('DELETE FROM events WHERE owner_id = ?', [userId]);

      await runAsync('DELETE FROM users WHERE id = ?', [userId]);
      await runAsync('COMMIT');
    } catch (err) {
      await runAsync('ROLLBACK');
      throw err;
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    // Only admins can update roles
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !['ADMIN', 'USER'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await getAsync('SELECT id FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await runAsync('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
    const updatedUser = await getAsync('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [userId]);

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const searchUsers = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const users = await allAsync(
      `SELECT id, name, email, role, created_at FROM users
       WHERE name LIKE ? OR email LIKE ?
       ORDER BY created_at DESC`,
      [`%${q}%`, `%${q}%`]
    );

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
};
