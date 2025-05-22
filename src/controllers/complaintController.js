import { models } from '../config/database.js';
import { assignComplaint } from '../services/autoAssignService.js';
import upload from '../config/storage.js';
import fs from 'fs';

export const createComplaint = [
  upload.array('attachments', 3),
  async (req, res) => {
    try {
      const { title, description, category } = req.body;
      
      if (!title || !description || !category) {
        return res.status(400).json({ 
          error: 'Missing required fields. Title, description, and category are required.' 
        });
      }

      const attachments = req.files?.map(file => file.path) || [];
      
      // Create complaint with status 'pending'
      const complaint = await models.Complaint.create({
        title,
        description,
        category,
        attachments,
        userId: req.userId,
        status: 'pending'
      });

      try {
        // Try to assign to an agency
        await assignComplaint(complaint.id);
      } catch (assignError) {
        console.error('Error assigning complaint:', assignError);
        // Don't fail the complaint creation if assignment fails
      }

      // Fetch updated complaint with associations
      const updatedComplaint = await models.Complaint.findByPk(complaint.id, {
        include: [{
          model: models.Agency,
          as: 'agency',
          attributes: ['id', 'name', 'contactEmail']
        }]
      });

      res.status(201).json(updatedComplaint);
    } catch (err) {
      console.error('Error creating complaint:', err);
      // Clean up uploaded files if any error occurs
      if (req.files) {
        req.files.forEach(file => fs.unlink(file.path, () => {}));
      }
      res.status(400).json({ 
        error: err.message || 'Error creating complaint',
        details: err.original?.message
      });
    }
  }
];

export async function getComplaints(req, res) {
  try {
    let complaints;
    console.log('User Role:', req.userRole);
    console.log('Agency ID:', req.agencyId);
    console.log('User ID:', req.userId);
    console.log('Auth Headers:', req.headers.authorization);
    
    if (req.userRole === 'admin') {
      complaints = await models.Complaint.findAll({
        include: [{
          model: models.User,
          attributes: ['email', 'name'],
          as: 'user'
        }]
      });
      console.log('Admin - Total complaints:', complaints.length);
    } else if (req.userRole === 'agency') {
      console.log('Fetching complaints for agency:', req.agencyId);
      complaints = await models.Complaint.findAll({
        where: { agencyId: req.agencyId },
        include: [{
          model: models.User,
          attributes: ['email', 'name'],
          as: 'user'
        }]
      });
      console.log('Agency - Filtered complaints:', complaints.length);
    } else {
      complaints = await models.Complaint.findAll({
        where: { userId: req.userId },
        include: [{
          model: models.User,
          attributes: ['email', 'name'],
          as: 'user'
        }]
      });
      console.log('Citizen - Total complaints:', complaints.length);
    }
    res.json(complaints);
  } catch (err) {
    console.error('Error in getComplaints:', err);
    res.status(500).json({ error: err.message });
  }
}
// get single complaint
export async function getComplaint(req, res) {
  try {
    const { id } = req.params;
    const complaint = await models.Complaint.findByPk(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function respondToComplaint(req, res) {
  try {
    const { id } = req.params;
    const { status, response } = req.body;
    const complaint = await models.Complaint.findByPk(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    // Only allow agency or admin to update
    if (req.userRole !== 'admin' && req.userRole !== 'agency') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    // Optionally, only allow agency assigned to this complaint
    // if (req.userRole === 'agency' && complaint.agencyId !== req.userId) { ... }
    if (status) complaint.status = status;
    if (response) complaint.response = response;
    await complaint.save();
    res.json(complaint);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function assignAgencyToComplaint(req, res) {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { id } = req.params;
    const { agencyId } = req.body;
    const complaint = await models.Complaint.findByPk(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    complaint.agencyId = agencyId;
    complaint.status = 'assigned';
    await complaint.save();
    res.json(complaint);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}