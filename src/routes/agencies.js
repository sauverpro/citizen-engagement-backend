import express from 'express';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import { createAgency, deleteAgency, getAllAgencies, updateAgency } from '../controllers/agencyController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Agencies
 *     description: Agency management endpoints
 */

/**
 * @swagger
 * /api/agencies:
 *   post:
 *     summary: Create a new agency
 *     tags: [Agencies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *               contactEmail:
 *                 type: string
 *     responses:
 *       201:
 *         description: Agency created
 *       400:
 *         description: Creation failed
 *       403:
 *         description: Admin access required
 */
router.post('/', verifyToken, isAdmin, createAgency);

/**
 * @swagger
 * /api/agencies:
 *   get:
 *     summary: Get all agencies
 *     tags: [Agencies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of agencies
 *       500:
 *         description: Server error
 */
router.get('/', verifyToken, getAllAgencies);

/**
 * @swagger
 * /api/agencies/{id}:
 *   put:
 *     summary: Update an agency
 *     tags: [Agencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Agency ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *               contactEmail:
 *                 type: string
 *     responses:
 *       200:
 *         description: Agency updated
 *       400:
 *         description: Update failed
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Agency not found
 */
router.put('/:id', verifyToken, isAdmin, updateAgency);

/**
 * @swagger
 * /api/agencies/{id}:
 *   get:
 *     summary: Get a single agency by ID
 *     tags: [Agencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Agency ID
 *     responses:
 *       200:
 *         description: Agency found
 *       404:
 *         description: Agency not found
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const agency = await import('../config/database.js').then(({ models }) => models.Agency.findByPk(req.params.id));
    if (!agency) return res.status(404).json({ error: 'Agency not found' });
    res.json(agency);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/agencies/{id}:
 *   delete:
 *     summary: Delete an agency
 *     tags: [Agencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Agency ID
 *     responses:
 *       204:
 *         description: Agency deleted
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Agency not found
 */
router.delete('/:id', verifyToken, isAdmin, deleteAgency);

export default router;