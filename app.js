import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './src/config/database.js';
import authRoutes from './src/routes/auth.js';
import complaintsRoutes from './src/routes/complaints.js';
import agenciesRoutes from './src/routes/agencies.js';
import usersRoutes from './src/routes/users.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import { swaggerUi, swaggerSpec } from './src/config/swagger.js';

dotenv.config();

const app = express();

// Enable CORS with environment-specific configuration
// allow all in production
// allow only specific origins in development 
const allowedOrigins = process.env.NODE_ENV === 'production' ?
  ['*'] :
  ['http://localhost:5173', 'https://citizen-engagement-bay.vercel.app', process.env.FRONTEND_URL];
// const allowedOrigins = ['http://localhost:5173', 'https://citizen-engagement-bay.vercel.app', process.env.FRONTEND_URL];
 

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
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
    return app;
  } catch (err) {
    console.error('Failed to initialize app:', err);
    process.exit(1);
  }
}

export default app;