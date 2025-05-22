import { Sequelize } from 'sequelize';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import Agency from '../models/Agency.js';
import path from 'path';
import fs from 'fs';

// Set database path based on environment
const dbPath = process.env.NODE_ENV === 'production'
  ? '/opt/render/project/src/data/database.sqlite'
  : './database.sqlite';

// Ensure the data directory exists in production
if (process.env.NODE_ENV === 'production') {
  const dataDir = '/opt/render/project/src/data';
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true, mode: 0o755 });
      console.log('Created data directory:', dataDir);
    }
  } catch (error) {
    console.error('Error creating data directory:', error);
    throw error;
  }
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

const models = {
  User: User(sequelize, Sequelize.DataTypes),
  Complaint: Complaint(sequelize, Sequelize.DataTypes),
  Agency: Agency(sequelize, Sequelize.DataTypes),
};

// Initialize all model associations
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

export async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Always sync in production for now to ensure tables exist
    if (process.env.NODE_ENV === 'production') {
      try {
        console.log('Starting database sync in production...');
        await sequelize.sync();
        console.log('Production database synced successfully');
        
        // Check if admin user exists
        const adminExists = await models.User.findOne({ where: { email: 'admin@gmail.com' } });
        if (!adminExists) {
          try {
            await models.User.create({
              name: 'Admin',
              email: 'admin@gmail.com',
              password: '$2b$10$EiX/TDE9VcQrHv6GA3RdKu/BSQ/2tZ9qeUErySs0lxjfP8mJBnAgi', // admin123
              role: 'admin'
            });
            console.log('Default admin user created successfully');
          } catch (error) {
            console.error('Error creating admin user:', error);
            // Continue execution even if admin creation fails
          }
        } else {
          console.log('Admin user already exists');
        }
      } catch (error) {
        console.error('Error syncing database:', error);
        throw error;
      }
    } else {
      // In development, we can sync all changes
      await sequelize.sync();
      console.log('Development database synced successfully');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}

// Add a function to verify table existence
export async function verifyTables() {
  try {
    const tables = ['Users', 'Complaints', 'Agencies'];
    for (const table of tables) {
      const query = `SELECT name FROM sqlite_master WHERE type='table' AND name='${table}';`;
      const result = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT });
      console.log(`Table ${table} exists:`, result.length > 0);
    }
  } catch (error) {
    console.error('Error verifying tables:', error);
  }
}

export { models };
export default sequelize;