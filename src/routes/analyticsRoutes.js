import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  getOverallStats,
  getStatusDistribution,
  getCategoryDistribution,
  getTrendAnalysis,
  getAgencyPerformance
} from '../controllers/analyticsController.js';

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

/**
 * @swagger
 * tags:
 *   - name: Analytics
 *     description: Dashboard analytics endpoints
 */

/**
 * @swagger
 * /api/analytics/overall:
 *   get:
 *     summary: Get overall statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overall statistics
 *       403:
 *         description: Access denied
 */
router.get('/overall', verifyToken, isAdmin, getOverallStats);

/**
 * @swagger
 * /api/analytics/status:
 *   get:
 *     summary: Get complaint status distribution
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status distribution
 *       403:
 *         description: Access denied
 */
router.get('/status', verifyToken, isAdmin, getStatusDistribution);

/**
 * @swagger
 * /api/analytics/category:
 *   get:
 *     summary: Get complaints by category
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category distribution
 *       403:
 *         description: Access denied
 */
router.get('/category', verifyToken, isAdmin, getCategoryDistribution);

/**
 * @swagger
 * /api/analytics/trend:
 *   get:
 *     summary: Get 7-day complaint trend
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trend analysis data
 *       403:
 *         description: Access denied
 */
router.get('/trend', verifyToken, isAdmin, getTrendAnalysis);

/**
 * @swagger
 * /api/analytics/agency-performance:
 *   get:
 *     summary: Get agency performance metrics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Agency performance data
 *       403:
 *         description: Access denied
 */
router.get('/agency-performance', verifyToken, isAdmin, getAgencyPerformance);

export default router; 