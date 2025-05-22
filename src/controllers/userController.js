import models from '../config/database.js';
import bcrypt from 'bcrypt';

export async function getUsers(req, res) {
  try {
    const users = await models.User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'agencyId'],
      include: [{
        model: models.Agency,
        as: 'agency',
        attributes: ['name']
      }]
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createUser(req, res) {
  try {
    const { name, email, password, role, agencyId } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await models.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user data object
    const userData = {
      name,
      email,
      password: hashedPassword,
      role
    };

    // Only add agencyId if role is agency and agencyId is provided
    if (role === 'agency' && agencyId) {
      // Verify agency exists
      const agency = await models.Agency.findByPk(agencyId);
      if (!agency) {
        return res.status(400).json({ error: 'Invalid agency ID' });
      }
      userData.agencyId = agencyId;
    }

    // Create user
    const user = await models.User.create(userData);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, password, role, agencyId } = req.body;

    const user = await models.User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update basic info
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    
    // Only update agencyId if role is agency
    if (role === 'agency') {
      user.agencyId = agencyId;
    } else {
      user.agencyId = null;
    }

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    
    const user = await models.User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await models.User.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin user' });
      }
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function assignAgency(req, res) {
  try {
    const { id } = req.params;
    const { agencyId } = req.body;

    const user = await models.User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'agency') {
      return res.status(400).json({ error: 'Can only assign agencies to users with agency role' });
    }

    const agency = await models.Agency.findByPk(agencyId);
    if (!agency) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    user.agencyId = agencyId;
    await user.save();

    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
} 