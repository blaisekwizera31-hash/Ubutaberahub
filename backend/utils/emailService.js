import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER ,
    pass: process.env.EMAIL_PASS ,
  },
});

export async function sendVerificationEmail(email, code) {
  const mailOptions = {
    from: `"UbutaberaHub" <${process.env.EMAIL_USER || 'no-reply@example.com'}>`,
    to: email,
    subject: 'Your UbutaberaHub account verification code',
    html: `
      <h1>Email Verification</h1>
      <p>Enter this 6-digit code to verify your email address:</p>
      <p style="font-size: 32px; font-weight: 700; letter-spacing: 8px; margin: 24px 0;">${code}</p>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Ubutaberahub --- Rwanda --- 2026</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email, code) {
  const mailOptions = {
    from: `"UbutaberaHub" <${process.env.EMAIL_USER || 'no-reply@example.com'}>`,
    to: email,
    subject: 'Your UbutaberaHub password reset code',
    html: `
      <h1>Password Reset</h1>
      <p>Enter this 6-digit code to reset your password:</p>
      <p style="font-size: 32px; font-weight: 700; letter-spacing: 8px; margin: 24px 0;">${code}</p>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Ubutaberahub --- Rwanda --- 2026</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

export default transporter;
