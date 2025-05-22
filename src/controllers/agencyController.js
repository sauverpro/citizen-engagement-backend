import models from '../config/database.js';

export async function createAgency(req, res) {
  try {
    const { name, categories, contactEmail } = req.body;
    const agency = await models.Agency.create({
      name,
      categories,
      contactEmail
    });
    res.status(201).json(agency);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function getAllAgencies(req, res) {
  try {
    const agencies = await models.Agency.findAll({
      attributes: ['id', 'name', 'contactEmail', 'categories', 'createdAt', 'updatedAt']
    });
    res.json(agencies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateAgency(req, res) {
  try {
    const agency = await models.Agency.findByPk(req.params.id);
    if (!agency) return res.status(404).json({ error: 'Agency not found' });
    
    const { name, categories, contactEmail } = req.body;
    await agency.update({
      name,
      categories,
      contactEmail
    });
    res.json(agency);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
// deleteAgency
export async function deleteAgency(req, res) {
  try {
    const agency = await models.Agency.findByPk(req.params.id);
    if (!agency) return res.status(404).json({ error: 'Agency not found' });
    
    await agency.destroy();
    res.status(200).json({message: 'Agency deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}