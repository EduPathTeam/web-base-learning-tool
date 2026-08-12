import { pool } from '../db/pool.js';
import { asyncHandler } from './asyncHandler.js';

// Looks up the role (and is_active — see requireAuth.js) fresh on every
// request, rather than caching either on the session at login, so a role
// change or deactivation takes effect immediately instead of only after
// the next login.
export const requireAdmin = asyncHandler(async (req, res, next) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not signed in.' });

  const [rows] = await pool.query('SELECT role, is_active FROM users WHERE id = ?', [
    req.session.userId,
  ]);
  const user = rows[0];
  if (!user?.is_active) return res.status(401).json({ error: 'Not signed in.' });
  if (user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });

  next();
});
