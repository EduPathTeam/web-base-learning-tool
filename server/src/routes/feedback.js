import { Router } from 'express';
import { pool } from '../db/pool.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

export const feedbackRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/v1/feedback — open to signed-in and anonymous visitors alike,
// matching the original feedback form (no login required to send feedback).
// feedbackLimiter (app.js) is mounted on this exact method+path only, so
// it doesn't also throttle the admin GET route below.
feedbackRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, email, category, rating, message } = req.body || {};
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required.' });
    if (!email || !EMAIL_RE.test(email))
      return res.status(400).json({ error: 'A valid email is required.' });
    if (!message || !message.trim()) return res.status(400).json({ error: 'Message is required.' });
    const ratingNum = Number(rating) || 0;
    if (ratingNum < 0 || ratingNum > 5)
      return res.status(400).json({ error: 'rating must be between 0 and 5.' });

    const userId = req.session?.userId || null;

    const [result] = await pool.query(
      `INSERT INTO feedback (user_id, name, email, category, rating, message)
     VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, name.trim(), email.trim(), category || 'General Feedback', ratingNum, message.trim()]
    );

    res.status(201).json({ id: result.insertId });
  })
);

// GET /api/v1/feedback — admin-only listing of all submissions, newest
// first, with basic page/limit pagination (there's no in-app way to
// review feedback otherwise; previously required querying MySQL directly).
feedbackRouter.get(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM feedback');
    const [items] = await pool.query(
      'SELECT id, user_id, name, email, category, rating, message, created_at FROM feedback ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    res.json({ items, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) });
  })
);
