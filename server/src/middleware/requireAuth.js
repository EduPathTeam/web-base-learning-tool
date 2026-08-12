import { pool } from '../db/pool.js';
import { asyncHandler } from './asyncHandler.js';

// Looks up is_active fresh on every request (not cached in the session)
// so a deactivation takes effect immediately instead of only once the
// existing session cookie naturally expires — same reasoning as
// requireAdmin.js's fresh role lookup.
export const requireAuth = asyncHandler(async (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not signed in.' });

  const [rows] = await pool.query('SELECT is_active FROM users WHERE id = ?', [req.session.userId]);
  if (!rows[0]?.is_active) return res.status(401).json({ error: 'Not signed in.' });

  next();
});
