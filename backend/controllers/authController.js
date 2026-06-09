/**
 * controllers/authController.js
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { uploadProfilePhoto } from '../config/cloudinary.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.js';

const safeRole = (v) =>
  ["citizen", "lawyer", "judge", "clerk"].includes(v) ? v : "citizen";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d',
  });
};

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const codeExpiry = () => new Date(Date.now() + 600000);

export async function signup(req, res) {
  try {
    const {
      email,
      password,
      name,
      role,
      phone,
      profilePhoto,
      profile_photo,
      licenseNumber,
      specialization,
      lawFirm,
      yearsExperience,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const photo = await uploadProfilePhoto(profile_photo || profilePhoto);
    if (!photo) {
      return res.status(400).json({ error: 'Profile photo is required' });
    }

    // Check if user exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationCode = generateCode();
    const verificationExpires = codeExpiry();

    // Insert user
    const newUser = await pool.query(
      `INSERT INTO users (
        email, password_hash, name, role, phone, profile_photo,
        license_number, specialization, law_firm, years_experience,
        verification_token, verification_expires, is_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        email,
        hashedPassword,
        name || email.split('@')[0],
        safeRole(role),
        phone || null,
        photo,
        licenseNumber || null,
        specialization || null,
        lawFirm || null,
        Number(yearsExperience || 0),
        verificationCode,
        verificationExpires,
        false,
      ]
    );

    // Send email
    try {
      await sendVerificationEmail(email, verificationCode);
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
        phone: newUser.rows[0].phone,
        profile_photo: newUser.rows[0].profile_photo,
        is_verified: newUser.rows[0].is_verified,
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
    const email = req.body?.email || req.query?.email;
    const code = req.body?.code || req.query?.code;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }

    const { rows } = await pool.query(
      'UPDATE users SET is_verified = true, verification_token = NULL, verification_expires = NULL WHERE LOWER(email) = LOWER($1) AND verification_token = $2 AND verification_expires > NOW() RETURNING *',
      [email, code]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
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

    const newCode = generateCode();
    const expires = codeExpiry();
    await pool.query(
      'UPDATE users SET verification_token = $1, verification_expires = $2 WHERE email = $3',
      [newCode, expires, email]
    );
    await sendVerificationEmail(email, newCode);

    return res.json({ message: 'Verification code resent' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to resend verification', message: err.message });
  }
}

export async function forgotPassword(req, res) {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const resetCode = generateCode();
    const expires = codeExpiry();

    const { rows } = await pool.query(
      'UPDATE users SET reset_token = $1, reset_expires = $2 WHERE LOWER(email) = LOWER($3) RETURNING *',
      [resetCode, expires, email]
    );

    if (rows.length > 0) {
      await sendPasswordResetEmail(rows[0].email, resetCode);
    }

    // Always return success to prevent email enumeration
    return res.json({ message: 'If that email exists, a reset code has been sent.' });
  } catch (err) {
    return res.status(500).json({ error: 'Request failed', message: err.message });
  }
}

export async function resetPassword(req, res) {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const token = String(req.body?.token || req.body?.code || "").trim();
    const { password } = req.body;

    if (!email || !token || !password) {
      return res.status(400).json({ error: 'Email, reset code, and password are required' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { rows } = await pool.query(
      `UPDATE users
       SET password_hash = $1, reset_token = NULL, reset_expires = NULL
       WHERE LOWER(email) = LOWER($2)
         AND reset_token = $3
         AND reset_expires > NOW()
       RETURNING *`,
      [hashedPassword, email, token]
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
    const incomingPhoto = req.body?.profile_photo ?? req.body?.profilePhoto;
    const profile_photo = incomingPhoto !== undefined
      ? await uploadProfilePhoto(incomingPhoto)
      : user.profile_photo;
    const phone = req.body?.phone ?? user.phone;
    const law_firm = req.body?.law_firm ?? req.body?.lawFirm ?? user.law_firm;
    const specialization = req.body?.specialization ?? user.specialization;
    const years_experience = req.body?.years_experience ?? req.body?.yearsExperience ?? user.years_experience;
    const hourly_rate = req.body?.hourly_rate ?? req.body?.hourlyRate ?? user.hourly_rate;
    const is_available = req.body?.is_available ?? req.body?.isAvailable ?? user.is_available;

    const { rows } = await pool.query(
      `UPDATE users SET
        name = $1,
        role = $2,
        profile_photo = $3,
        phone = $4,
        law_firm = $5,
        specialization = $6,
        years_experience = $7,
        hourly_rate = $8,
        is_available = $9,
        updated_at = NOW()
      WHERE id = $10 RETURNING *`,
      [
        name,
        role,
        profile_photo,
        phone,
        law_firm,
        specialization,
        Number(years_experience || 0),
        Number(hourly_rate || 0),
        is_available !== false,
        user.id,
      ]
    );

    return res.json({ user: rows[0] });
  } catch (err) {
    return res.status(500).json({ error: "Failed to sync profile", message: err.message });
  }
}
