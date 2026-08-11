import { pool } from '../db/pool.js';
import { asyncHandler } from './asyncHandler.js';

// Looks up the role fresh on every request (rather than caching it on the
// session at login) so a role change — promotion or demotion — takes
// effect immediately instead of only after the next login.
export const requireAdmin = asyncHandler(async (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not signed in.' });

  const [rows] = await pool.query('SELECT role FROM users WHERE id = ?', [req.session.userId]);
  if (rows[0]?.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });

  next();
});
