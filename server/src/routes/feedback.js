import { Router } from 'express';
import { pool } from '../db/pool.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const feedbackRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/v1/feedback — open to signed-in and anonymous visitors alike,
// matching the original feedback form (no login required to send feedback).
feedbackRouter.post('/', asyncHandler(async (req, res) => {
  const { name, email, category, rating, message } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required.' });
  if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ error: 'A valid email is required.' });
  if (!message || !message.trim()) return res.status(400).json({ error: 'Message is required.' });
  const ratingNum = Number(rating) || 0;
  if (ratingNum < 0 || ratingNum > 5) return res.status(400).json({ error: 'rating must be between 0 and 5.' });

  const userId = req.session?.userId || null;

  const [result] = await pool.query(
    `INSERT INTO feedback (user_id, name, email, category, rating, message)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, name.trim(), email.trim(), category || 'General Feedback', ratingNum, message.trim()]
  );

  res.status(201).json({ id: result.insertId });
}));
