/**
 * controllers/authController.js
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.js';

const safeRole = (v) =>
  ["citizen", "lawyer", "judge", "clerk"].includes(v) ? v : "citizen";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d',
  });
};

export async function signup(req, res) {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Verification token
    const verificationToken = uuidv4();

    // Insert user
    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash, name, role, verification_token, is_verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [email, hashedPassword, name || email.split('@')[0], safeRole(role), verificationToken, false]
    );

    // Send email
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr);
      // We still created the user, they might need to request a resend later
    }

    const token = generateToken(newUser.rows[0].id);

    return res.status(201).json({
      user: {
        id: newUser.rows[0].id,
        email: newUser.rows[0].email,
        name: newUser.rows[0].name,
        role: newUser.rows[0].role,
      },
      token,
      message: 'Registration successful. Please check your email for verification.'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Signup failed', message: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      const token = generateToken(user.id);

      return res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          is_verified: user.is_verified,
        },
        token,
      });
    } else {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Login failed', message: err.message });
  }
}

export async function verifyEmail(req, res) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const { rows } = await pool.query(
      'UPDATE users SET is_verified = true, verification_token = NULL WHERE verification_token = $1 RETURNING *',
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    return res.json({ message: 'Email verified successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Verification failed', message: err.message });
  }
}

export async function resendSignupVerification(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (rows[0].is_verified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    const newToken = uuidv4();
    await pool.query('UPDATE users SET verification_token = $1 WHERE email = $2', [newToken, email]);
    await sendVerificationEmail(email, newToken);

    return res.json({ message: 'Verification email resent' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to resend verification', message: err.message });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 600000); // 10 minutes

    const { rows } = await pool.query(
      'UPDATE users SET reset_token = $1, reset_expires = $2 WHERE email = $3 RETURNING *',
      [resetCode, expires, email]
    );

    if (rows.length > 0) {
      await sendPasswordResetEmail(email, resetCode);
    }

    // Always return success to prevent email enumeration
    return res.json({ message: 'If that email exists, a reset code has been sent.' });
  } catch (err) {
    return res.status(500).json({ error: 'Request failed', message: err.message });
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { rows } = await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_expires = NULL WHERE reset_token = $2 AND reset_expires > NOW() RETURNING *',
      [hashedPassword, token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    return res.json({ message: 'Password reset successful' });
  } catch (err) {
    return res.status(500).json({ error: 'Reset failed', message: err.message });
  }
}

export async function getSessionUser(req, res) {
  try {
    // req.user is already populated by requireAuth middleware
    return res.json({ user: req.user });
  } catch (err) {
    return res.status(500).json({ error: "Failed to load session user", message: err.message });
  }
}

export async function syncProfile(req, res) {
  try {
    const user = req.user;
    const role  = safeRole(req.body?.role || user.role);
    const name  = req.body?.name || user.name;
    const profile_photo = req.body?.profile_photo || user.profile_photo;

    const { rows } = await pool.query(
      'UPDATE users SET name = $1, role = $2, profile_photo = $3 WHERE id = $4 RETURNING *',
      [name, role, profile_photo, user.id]
    );

    return res.json({ user: rows[0] });
  } catch (err) {
    return res.status(500).json({ error: "Failed to sync profile", message: err.message });
  }
}
