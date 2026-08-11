import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const progressRouter = Router();

// GET /api/v1/progress — full progress state for the signed-in user,
// shaped close to CSPlatform's localStorage schema so the frontend can
// merge it in with minimal translation.
progressRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.session.userId;

    const [topics] = await pool.query('SELECT id, name, total_lessons FROM topics');
    const [progressRows] = await pool.query(
      'SELECT topic_id, completed_count, last_lesson_url FROM lesson_progress WHERE user_id = ?',
      [userId]
    );
    const [quizRows] = await pool.query(
      'SELECT topic_id, score, taken_at FROM quiz_results WHERE user_id = ? ORDER BY taken_at ASC',
      [userId]
    );

    const completedLessons = {};
    const lastLessonByTopic = {};
    topics.forEach((t) => (completedLessons[t.id] = 0));
    progressRows.forEach((p) => {
      completedLessons[p.topic_id] = p.completed_count;
      if (p.last_lesson_url) lastLessonByTopic[p.topic_id] = p.last_lesson_url;
    });

    const quizResults = {};
    quizRows.forEach((q) => {
      if (!quizResults[q.topic_id]) quizResults[q.topic_id] = [];
      quizResults[q.topic_id].push(q.score);
    });

    res.json({ topics, completedLessons, quizResults, lastLessonByTopic });
  })
);

// POST /api/v1/progress/lesson-complete { topicId, lessonUrl }
progressRouter.post(
  '/lesson-complete',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.session.userId;
    const { topicId, lessonUrl } = req.body || {};
    if (!topicId) return res.status(400).json({ error: 'topicId is required.' });

    const [topicRows] = await pool.query('SELECT total_lessons FROM topics WHERE id = ?', [
      topicId,
    ]);
    if (!topicRows.length) return res.status(404).json({ error: 'Unknown topic.' });
    const total = topicRows[0].total_lessons;

    await pool.query(
      `INSERT INTO lesson_progress (user_id, topic_id, completed_count, last_lesson_url, completed_at)
     VALUES (?, ?, 1, ?, NOW())
     ON DUPLICATE KEY UPDATE
       completed_count = LEAST(completed_count + 1, ?),
       last_lesson_url = VALUES(last_lesson_url),
       completed_at = NOW()`,
      [userId, topicId, lessonUrl || null, total]
    );

    res.status(204).end();
  })
);

// POST /api/v1/progress/last-lesson { topicId, lessonUrl }
progressRouter.post(
  '/last-lesson',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.session.userId;
    const { topicId, lessonUrl } = req.body || {};
    if (!topicId) return res.status(400).json({ error: 'topicId is required.' });

    await pool.query(
      `INSERT INTO lesson_progress (user_id, topic_id, completed_count, last_lesson_url)
     VALUES (?, ?, 0, ?)
     ON DUPLICATE KEY UPDATE last_lesson_url = VALUES(last_lesson_url)`,
      [userId, topicId, lessonUrl || null]
    );

    res.status(204).end();
  })
);

// POST /api/v1/progress/quiz-result { topicId, score }
progressRouter.post(
  '/quiz-result',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.session.userId;
    const { topicId, score } = req.body || {};
    if (!topicId) return res.status(400).json({ error: 'topicId is required.' });
    if (typeof score !== 'number' || score < 0 || score > 100) {
      return res.status(400).json({ error: 'score must be a number between 0 and 100.' });
    }

    const [topicRows] = await pool.query('SELECT id FROM topics WHERE id = ?', [topicId]);
    if (!topicRows.length) return res.status(404).json({ error: 'Unknown topic.' });

    await pool.query('INSERT INTO quiz_results (user_id, topic_id, score) VALUES (?, ?, ?)', [
      userId,
      topicId,
      Math.round(score),
    ]);

    res.status(204).end();
  })
);
