import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db/pool.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const authRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

authRouter.post('/register', asyncHandler(async (req, res) => {
  const { email, password, displayName } = req.body || {};
  if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ error: 'A valid email is required.' });
  if (!password || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  if (!displayName || !displayName.trim()) return res.status(400).json({ error: 'Display name is required.' });

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length) return res.status(409).json({ error: 'An account with that email already exists.' });

  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)',
    [email, passwordHash, displayName.trim()]
  );

  req.session.userId = result.insertId;
  res.status(201).json({ id: result.insertId, email, displayName: displayName.trim() });
}));

authRouter.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  const [rows] = await pool.query(
    'SELECT id, email, password_hash, display_name FROM users WHERE email = ?',
    [email]
  );
  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });

  req.session.userId = user.id;
  res.json({ id: user.id, email: user.email, displayName: user.display_name });
}));

authRouter.post('/logout', (req, res) => {
  req.session.destroy(() => res.status(204).end());
});

// There's no email provider configured in this project (see README /
// SEMESTER_2_PROJECT_REPORT.md), so this endpoint deliberately does NOT
// pretend to send a reset email — that would be exactly the kind of fake
// success state CLAUDE.md's rules forbid. It validates the request and
// gives the user an honest answer instead. The response is identical
// whether or not the email is registered, so this endpoint can't be used
// to enumerate which emails have accounts.
authRouter.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body || {};
  if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ error: 'A valid email is required.' });

  res.json({
    message: "Automatic password reset isn't set up on this platform yet. If you have an account, please contact an administrator to reset your password.",
  });
}));

authRouter.get('/me', asyncHandler(async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not signed in.' });
  const [rows] = await pool.query(
    'SELECT id, email, display_name FROM users WHERE id = ?',
    [req.session.userId]
  );
  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'Not signed in.' });
  res.json({ id: user.id, email: user.email, displayName: user.display_name });
}));
