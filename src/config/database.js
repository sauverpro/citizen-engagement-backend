import { Sequelize } from 'sequelize';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import Agency from '../models/Agency.js';
import path from 'path';

// Set database path based on environment
const dbPath = process.env.NODE_ENV === 'production'
  ? '/opt/render/project/src/data/database.sqlite'
  : './database.sqlite';

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
    
    // Sync database in development only
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync();
      console.log('Database synced successfully');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}

export default sequelize;