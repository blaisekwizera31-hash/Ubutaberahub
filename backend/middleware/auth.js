/**
 * Authentication Middleware
 * Verifies JWT tokens on protected routes
 */

import jwt from 'jsonwebtoken';
import pool from '../../backend/config/db.js';

/**
 * verifyToken - Express middleware to verify JWT
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Missing Bearer token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'User not found' });
    }

    req.user = user;
    req.profile = user; 
    next();
  } catch (err) {
    console.error('[auth] verifyToken error:', err.message);
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
};

/**
 * requireAuth - Legacy wrapper for verifyToken
 */
export const requireAuth = () => verifyToken;

/**
 * requireRole - Restricts route to specific roles
 * Must be used AFTER verifyToken
 */
export function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !allowed.includes(role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access restricted to: ${allowed.join(', ')}`,
      });
    }
    next();
  };
}

/**
 * optionalAuth - Attaches user if token present, continues without it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    if (!token) {
      req.user = null;
      req.profile = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    const user = rows[0];

    req.user = user || null;
    req.profile = user || null;

    next();
  } catch {
    req.user = null;
    req.profile = null;
    next();
  }
};
