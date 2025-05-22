import models from '../config/database.js'; 
import { Op } from 'sequelize';

export async function assignComplaint(complaintId) {
  const complaint = await models.Complaint.findByPk(complaintId);
  // Use LIKE for SQLite compatibility (categories as comma-separated string)
  const agency = await models.Agency.findOne({
    where: {
      categories: { [Op.like]: `%${complaint.category}%` }
    }
  });

  if (agency) {
    await complaint.update({
      agencyId: agency.id,
      status: 'assigned'
    });
    return agency;
  }
  
  await complaint.update({ status: 'unassigned' });
  return null;
};