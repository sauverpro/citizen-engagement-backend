import { models } from '../config/database.js';
import { Op } from 'sequelize';

export async function assignComplaint(complaintId) {
  try {
    const complaint = await models.Complaint.findByPk(complaintId);
    if (!complaint) {
      throw new Error('Complaint not found');
    }

    // Find all agencies
    const agencies = await models.Agency.findAll();
    
    // Find an agency that handles this category
    const matchingAgency = agencies.find(agency => {
      const categories = agency.categories; // Will be automatically parsed by the getter
      return Array.isArray(categories) && categories.includes(complaint.category);
    });

    if (matchingAgency) {
      await complaint.update({
        agencyId: matchingAgency.id,
        status: 'assigned'
      });
      return matchingAgency;
    }
    
    // If no matching agency is found, mark as pending
    await complaint.update({ status: 'pending' });
    return null;
  } catch (error) {
    console.error('Error in assignComplaint:', error);
    throw error;
  }
}