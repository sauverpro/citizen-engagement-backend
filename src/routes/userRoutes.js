import express from 'express';
import { getUsers, updateUser, deleteUser, createUser } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { isAdmin } from '../middleware/roles.js';

const router = express.Router();

// Protected routes - require authentication and admin role
router.use(authenticate);
router.use(isAdmin);

// Get all users
router.get('/', getUsers);

// Create new user
router.post('/', createUser);

// Update user
router.put('/:id', updateUser);

// Delete user
router.delete('/:id', deleteUser);

export default router; 