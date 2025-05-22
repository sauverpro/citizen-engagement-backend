import jwt from 'jsonwebtoken';
import models from '../config/database.js';

export async function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    
    // For agency users, get agencyId directly from token
    if (decoded.role === 'agency') {
      req.agencyId = decoded.agencyId;
      console.log('Auth Middleware - Agency ID:', req.agencyId);
    }
    
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(403).json({ message: 'Invalid token' });
  }
};

export function isAdmin(req, res, next) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};