import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, verifyTables } from './src/config/database.js';
import authRoutes from './src/routes/auth.js';
import complaintsRoutes from './src/routes/complaints.js';
import agenciesRoutes from './src/routes/agencies.js';
import usersRoutes from './src/routes/users.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import { swaggerUi, swaggerSpec } from './src/config/swagger.js';

dotenv.config();

const app = express();

// Enable CORS with environment-specific configuration
// const allowedOrigins = [
//   '*', // Allow all origins for development
//   'http://localhost:5173', // Vite's default dev port
//   'https://citizen-engagement-bay.vercel.app', // Production frontend URL
//   process.env.FRONTEND_URL, // Optional additional frontend URL
// ];


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes - all under /api
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/agencies', agenciesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize function to connect to database and start server
export async function initApp() {
  try {
    await connectDB();
    console.log('Database connected successfully');
    
    // Verify tables after connection
    if (process.env.NODE_ENV === 'production') {
      console.log('Verifying database tables...');
      await verifyTables();
    }
    
    return app;
  } catch (err) {
    console.error('Failed to initialize app:', err);
    process.exit(1);
  }
}

export default app;