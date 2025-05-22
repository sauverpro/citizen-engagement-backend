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
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
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
    
    // In production, only create tables if they don't exist
    // Never force sync or alter in production
    if (process.env.NODE_ENV === 'production') {
      // Check if database file exists
      const dbExists = fs.existsSync(dbPath);
      
      if (!dbExists) {
        // Only create tables if database doesn't exist
        await sequelize.sync();
        console.log('Production database initialized for the first time');
        
        // Create default admin user if it's a fresh database
        const adminExists = await models.User.findOne({ where: { email: 'admin@gmail.com' } });
        if (!adminExists) {
          await models.User.create({
            name: 'Admin',
            email: 'admin@gmail.com',
            password: '$2b$10$EiX/TDE9VcQrHv6GA3RdKu/BSQ/2tZ9qeUErySs0lxjfP8mJBnAgi', // admin123
            role: 'admin'
          });
          console.log('Default admin user created');
        }
      } else {
        console.log('Using existing production database');
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

export { models };
export default sequelize;