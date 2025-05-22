import express from 'express';
import { register, login } from '../controllers/authController.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered
 *       400:
 *         description: Registration failed
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verify JWT token and return user info
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token valid, user info returned
 *       401:
 *         description: Invalid or missing token
 */
router.get('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader);
  
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Optionally fetch user from DB for more info
    console.log("...datatatata",decoded);
    
    res.json({ id: decoded.id, role: decoded.role, email: decoded.email });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;