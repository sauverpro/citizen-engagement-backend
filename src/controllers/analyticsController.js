import { models } from '../config/database.js';
import { Op, Sequelize } from 'sequelize';

// Get overall statistics
export async function getOverallStats(req, res) {
  try {
    const totalComplaints = await models.Complaint.count();
    const resolvedComplaints = await models.Complaint.count({
      where: { status: 'resolved' }
    });
    
    // Calculate average response time for resolved complaints
    const resolvedWithDates = await models.Complaint.findAll({
      where: {
        status: 'resolved',
        updatedAt: { [Op.not]: null },
        createdAt: { [Op.not]: null }
      },
      attributes: ['createdAt', 'updatedAt']
    });

    const avgResponseTime = resolvedWithDates.reduce((acc, complaint) => {
      const diff = new Date(complaint.updatedAt) - new Date(complaint.createdAt);
      return acc + (diff / (1000 * 60 * 60 * 24)); // Convert to days
    }, 0) / (resolvedWithDates.length || 1);

    const activeAgencies = await models.Agency.count({
      where: {
        id: {
          [Op.in]: await models.Complaint.findAll({
            attributes: ['agencyId'],
            where: { agencyId: { [Op.not]: null } },
            group: ['agencyId']
          }).then(results => results.map(r => r.agencyId))
        }
      }
    });

    res.json({
      totalComplaints,
      resolvedComplaints,
      resolutionRate: (resolvedComplaints / totalComplaints) * 100,
      avgResponseTime,
      activeAgencies
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get complaint status distribution
export async function getStatusDistribution(req, res) {
  try {
    const distribution = await models.Complaint.findAll({
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['status']
    });
    
    // Transform the data to ensure proper format
    const formattedDistribution = distribution.map(item => ({
      status: item.status,
      count: parseInt(item.getDataValue('count'), 10)
    }));
    
    res.json(formattedDistribution);
  } catch (err) {
    console.error('Status Distribution Error:', err);
    res.status(500).json({ error: err.message });
  }
}

// Get complaints by category
export async function getCategoryDistribution(req, res) {
  try {
    const distribution = await models.Complaint.findAll({
      attributes: [
        'category',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['category']
    });
    
    // Transform the data to ensure proper format
    const formattedDistribution = distribution.map(item => ({
      category: item.category,
      count: parseInt(item.getDataValue('count'), 10)
    }));
    
    res.json(formattedDistribution);
  } catch (err) {
    console.error('Category Distribution Error:', err);
    res.status(500).json({ error: err.message });
  }
}

// Get 7-day trend
export async function getTrendAnalysis(req, res) {
  try {
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const complaints = await models.Complaint.findAll({
      where: {
        createdAt: {
          [Op.gte]: new Date(last7Days[0])
        }
      },
      attributes: ['createdAt']
    });

    const trend = last7Days.map(date => ({
      date,
      count: complaints.filter(c => 
        c.createdAt.toISOString().split('T')[0] === date
      ).length
    }));

    res.json(trend);
  } catch (err) {
    console.error('Trend Analysis Error:', err);
    res.status(500).json({ error: err.message });
  }
}

// Get agency performance metrics
export async function getAgencyPerformance(req, res) {
  try {
    const agencies = await models.Agency.findAll({
      attributes: [
        'id',
        'name',
        [Sequelize.fn('COUNT', Sequelize.col('complaints.id')), 'total'],
        [
          Sequelize.fn('SUM', 
            Sequelize.literal("CASE WHEN complaints.status = 'resolved' THEN 1 ELSE 0 END")
          ),
          'resolved'
        ]
      ],
      include: [{
        model: models.Complaint,
        as: 'complaints',
        attributes: [],
        required: false
      }],
      group: ['Agency.id', 'Agency.name']
    });

    const performance = agencies.map(agency => {
      const total = parseInt(agency.getDataValue('total'), 10) || 0;
      const resolved = parseInt(agency.getDataValue('resolved'), 10) || 0;
      return {
        name: agency.name,
        resolved,
        pending: total - resolved,
        total,
        resolutionRate: total ? (resolved / total) * 100 : 0
      };
    });

    res.json(performance);
  } catch (err) {
    console.error('Agency Performance Error:', err);
    res.status(500).json({ error: err.message });
  }
} 