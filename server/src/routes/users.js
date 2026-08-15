import { Router } from 'express';
import { pool } from '../db/pool.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

export const usersRouter = Router();

const VALID_ROLES = ['student', 'admin'];

// Pure decision, deliberately separated from the DB queries around it: is
// `target` the last active admin, given the current count of active
// admins in the system? Used to block both demoting and deactivating the
// sole remaining admin. Exported so it can be unit tested directly
// against a shared local dev database with an unknown, unpredictable
// real admin count (see server/test/api.test.js) — the two integration
// routes below only ever call this with the *real* count, which this
// test suite can't safely control without disturbing real accounts.
export function isLastActiveAdmin(target, activeAdminCount) {
  return target.role === 'admin' && !!target.is_active && activeAdminCount <= 1;
}

// GET /api/v1/users — admin-only, paginated list of all accounts.
// Deliberately lean (account fields only, no progress join) — a
// per-user detail/progress view can be added later if wanted.
usersRouter.get(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM users');
    const [rows] = await pool.query(
      'SELECT id, email, display_name, role, is_active, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    res.json({
      items: rows.map((u) => ({
        id: u.id,
        email: u.email,
        displayName: u.display_name,
        role: u.role,
        isActive: !!u.is_active,
        createdAt: u.created_at,
      })),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  })
);

// PATCH /api/v1/users/:id/role { role: 'student' | 'admin' } — admin-only.
// Two safety guards, both enforced server-side (not just hidden in the
// UI): an admin can never change their own role through this route, and
// demoting the last remaining *active* admin is rejected outright, so
// the in-app admin panel can never lock everyone out of itself by
// accident. (A deactivated admin doesn't count toward that total — see
// the comment below.)
usersRouter.patch(
  '/:id/role',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const targetId = Number(req.params.id);
    if (!Number.isInteger(targetId)) return res.status(400).json({ error: 'Invalid user id.' });
    if (targetId === req.session.userId) {
      return res.status(400).json({ error: "You can't change your own role." });
    }

    const { role } = req.body || {};
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: `role must be one of: ${VALID_ROLES.join(', ')}` });
    }

    const [rows] = await pool.query('SELECT id, role, is_active FROM users WHERE id = ?', [
      targetId,
    ]);
    const target = rows[0];
    if (!target) return res.status(404).json({ error: 'User not found.' });

    if (role === 'student') {
      const [[{ activeAdminCount }]] = await pool.query(
        "SELECT COUNT(*) AS activeAdminCount FROM users WHERE role = 'admin' AND is_active = TRUE"
      );
      if (isLastActiveAdmin(target, activeAdminCount)) {
        return res.status(400).json({ error: 'Cannot demote the last remaining admin.' });
      }
    }

    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, targetId]);
    res.status(204).end();
  })
);

// PATCH /api/v1/users/:id/deactivate — admin-only. Same two guards as
// the role route: no self-target, and refuses to drop the active admin
// count to zero.
usersRouter.patch(
  '/:id/deactivate',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const targetId = Number(req.params.id);
    if (!Number.isInteger(targetId)) return res.status(400).json({ error: 'Invalid user id.' });
    if (targetId === req.session.userId) {
      return res.status(400).json({ error: "You can't deactivate your own account." });
    }

    const [rows] = await pool.query('SELECT id, role, is_active FROM users WHERE id = ?', [
      targetId,
    ]);
    const target = rows[0];
    if (!target) return res.status(404).json({ error: 'User not found.' });

    const [[{ activeAdminCount }]] = await pool.query(
      "SELECT COUNT(*) AS activeAdminCount FROM users WHERE role = 'admin' AND is_active = TRUE"
    );
    if (isLastActiveAdmin(target, activeAdminCount)) {
      return res.status(400).json({ error: 'Cannot deactivate the last remaining admin.' });
    }

    await pool.query('UPDATE users SET is_active = FALSE WHERE id = ?', [targetId]);
    res.status(204).end();
  })
);

// PATCH /api/v1/users/:id/reactivate — admin-only. No self-target guard
// needed: a deactivated admin's own session is already rejected by
// requireAdmin (see requireAdmin.js), so they can never reach this route
// against themselves in the first place.
usersRouter.patch(
  '/:id/reactivate',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const targetId = Number(req.params.id);
    if (!Number.isInteger(targetId)) return res.status(400).json({ error: 'Invalid user id.' });

    const [result] = await pool.query('UPDATE users SET is_active = TRUE WHERE id = ?', [targetId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found.' });

    res.status(204).end();
  })
);
