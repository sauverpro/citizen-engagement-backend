import express from 'express';
import models from '../config/database.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Admin access required
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    
    const users = await models.User.findAll({
      include: [{
        model: models.Agency,
        as: 'agency',
        attributes: ['id', 'name']
      }],
      attributes: {
        exclude: ['password'] // Don't send passwords
      }
    });

    // Transform the response to include agency name directly
    const transformedUsers = users.map(user => {
      const plainUser = user.get({ plain: true });
      return {
        ...plainUser,
        agencyName: plainUser.agency?.name || null,
        agency: undefined // Remove the nested agency object
      };
    });

    res.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, email, password, role, agencyId } = req.body;

    // Check if user with email already exists
    const existingUser = await models.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const user = await models.User.create({
      name,
      email,
      password, // Note: In production, ensure password is hashed before saving
      role: role || 'citizen',
      agencyId: agencyId || null
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { name, email, role, agencyId, password } = req.body;

    const user = await models.User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData = {
      name,
      email,
      role,
      agencyId: agencyId || null
    };

    // Only update password if provided
    if (password) {
      updateData.password = password; // Note: In production, ensure password is hashed
    }

    await user.update(updateData);
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const user = await models.User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
