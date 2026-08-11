import { Router } from 'express';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { pool } from '../db/pool.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const authRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Reasonable default, not user-configurable yet: a reset link is valid
// for 1 hour after it's requested.
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { email, password, displayName } = req.body || {};
    if (!email || !EMAIL_RE.test(email))
      return res.status(400).json({ error: 'A valid email is required.' });
    if (!password || password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    if (!displayName || !displayName.trim())
      return res.status(400).json({ error: 'Display name is required.' });

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length)
      return res.status(409).json({ error: 'An account with that email already exists.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)',
      [email, passwordHash, displayName.trim()]
    );

    req.session.userId = result.insertId;
    // role is always 'student' at registration — there's no client-supplied
    // override, it only ever comes from the column default.
    res
      .status(201)
      .json({ id: result.insertId, email, displayName: displayName.trim(), role: 'student' });
  })
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const [rows] = await pool.query(
      'SELECT id, email, password_hash, display_name, role FROM users WHERE email = ?',
      [email]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });

    req.session.userId = user.id;
    res.json({ id: user.id, email: user.email, displayName: user.display_name, role: user.role });
  })
);

authRouter.post('/logout', (req, res) => {
  req.session.destroy(() => res.status(204).end());
});

// There's no transactional email provider configured in this project yet
// (see README.md), so instead of pretending to send an email — the kind
// of fake success state CLAUDE.md's rules forbid — the reset link is
// logged to the server console, clearly labeled as a dev-only stand-in.
// The response message is identical whether or not the email is
// registered, so this endpoint can't be used to enumerate accounts.
authRouter.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    const { email } = req.body || {};
    if (!email || !EMAIL_RE.test(email))
      return res.status(400).json({ error: 'A valid email is required.' });

    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (user) {
      // Only one live token per user — a fresh request supersedes any
      // earlier one rather than leaving multiple valid links outstanding.
      await pool.query('DELETE FROM password_reset_tokens WHERE user_id = ? AND used_at IS NULL', [
        user.id,
      ]);

      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
      await pool.query(
        'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
        [user.id, tokenHash, expiresAt]
      );

      const resetUrl = `${process.env.CLIENT_ORIGIN}/reset-password?token=${rawToken}`;
      // DEV-ONLY STAND-IN FOR REAL EMAIL DELIVERY. There is no email
      // provider wired up — see README.md's "Password reset" section.
      console.log(
        `[DEV ONLY — no email provider configured] Password reset link for ${email}: ${resetUrl} (expires in 1 hour)`
      );
    }

    res.json({
      message: 'If an account exists for that email, a password reset link has been sent.',
    });
  })
);

authRouter.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const { token, password } = req.body || {};
    if (!token) return res.status(400).json({ error: 'A reset token is required.' });
    if (!password || password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });

    const tokenHash = hashToken(token);
    const [rows] = await pool.query(
      'SELECT id, user_id, expires_at, used_at FROM password_reset_tokens WHERE token_hash = ?',
      [tokenHash]
    );
    const resetToken = rows[0];

    if (!resetToken || resetToken.used_at || new Date(resetToken.expires_at) < new Date()) {
      return res
        .status(400)
        .json({ error: 'This reset link is invalid or has expired. Please request a new one.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [
      passwordHash,
      resetToken.user_id,
    ]);
    await pool.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?', [
      resetToken.id,
    ]);
    // Any other outstanding tokens for this user are no longer meaningful
    // once the password has changed.
    await pool.query(
      'DELETE FROM password_reset_tokens WHERE user_id = ? AND id != ? AND used_at IS NULL',
      [resetToken.user_id, resetToken.id]
    );

    res.status(204).end();
  })
);

authRouter.get(
  '/me',
  asyncHandler(async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not signed in.' });
    const [rows] = await pool.query(
      'SELECT id, email, display_name, role FROM users WHERE id = ?',
      [req.session.userId]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Not signed in.' });
    res.json({ id: user.id, email: user.email, displayName: user.display_name, role: user.role });
  })
);
