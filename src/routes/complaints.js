import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { createComplaint, getComplaint, getComplaints, respondToComplaint, assignAgencyToComplaint } from '../controllers/complaintController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Complaints
 *     description: Complaint management endpoints
 */

/**
 * @swagger
 * /api/complaints:
 *   post:
 *     summary: Create a new complaint
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Complaint created
 *       400:
 *         description: Creation failed
 */
router.post('/', verifyToken, createComplaint);

/**
 * @swagger
 * /api/complaints:
 *   get:
 *     summary: Get all complaints for the authenticated user
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of complaints
 *       500:
 *         description: Server error
 */
router.get('/', verifyToken, getComplaints);

/**
 * @swagger
 * /api/complaints/{id}:
 *   get:
 *     summary: Get a single complaint by ID
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Complaint ID
 *     responses:
 *       200:
 *         description: Complaint details
 *       404:
 *         description: Complaint not found
 */
router.get('/:id', verifyToken, getComplaint)

/**
 * @swagger
 * /api/complaints/{id}/respond:
 *   put:
 *     summary: Respond to a complaint and update its status (admin/agency only)
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Complaint ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, assigned, in_progress, resolved]
 *               response:
 *                 type: string
 *     responses:
 *       200:
 *         description: Complaint updated
 *       400:
 *         description: Update failed
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Complaint not found
 */
router.put('/:id/respond', verifyToken, respondToComplaint);

/**
 * @swagger
 * /api/complaints/{id}/assign-agency:
 *   put:
 *     summary: Assign an agency to a complaint (admin only)
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Complaint ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               agencyId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Complaint updated
 *       400:
 *         description: Update failed
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Complaint not found
 */
router.put('/:id/assign-agency', verifyToken, assignAgencyToComplaint);

export default router;