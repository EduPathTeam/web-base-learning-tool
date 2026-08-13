import { Router } from 'express';
import { pool } from '../db/pool.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

export const analyticsRouter = Router();

// Minimum number of distinct contributing users a per-topic aggregate needs
// before it's shown as a real number. Below this, a handful of accounts
// touching a rarely-used topic would let an admin back-solve an individual
// user's exact score/completion from the "average" — there's no per-user
// quiz/progress view anywhere else in the app, so this is the one place
// that risk actually exists. See README.md's analytics section.
export const MIN_SAMPLE_SIZE = 5;

export function suppressBelowMinSample(value, sampleSize, min = MIN_SAMPLE_SIZE) {
  return sampleSize < min ? null : value;
}

// Last `months` calendar months (oldest first) as 'YYYY-MM' strings, ending
// with the month of `reference`. Pure so the gap-filling logic (a sparse SQL
// GROUP BY can skip months with zero signups, but the line chart needs a
// continuous series) is unit-testable without touching the DB.
export function lastNMonths(reference, months = 12) {
  const out = [];
  const d = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 1));
  for (let i = 0; i < months; i++) {
    out.unshift(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
    d.setUTCMonth(d.getUTCMonth() - 1);
  }
  return out;
}

// GET /api/v1/analytics — admin-only, platform-wide aggregates. Deliberately
// read-only and free of any per-user drill-down (that's /admin/users); see
// suppressBelowMinSample above for the one place a naive aggregate could
// otherwise leak an individual's data.
analyticsRouter.get(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const [[userSummary]] = await pool.query(
      'SELECT COUNT(*) AS total, SUM(is_active) AS active FROM users'
    );
    const totalUsers = userSummary.total;
    const activeUsers = Number(userSummary.active) || 0;

    const months = lastNMonths(new Date());
    const [signupRows] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
       FROM users
       WHERE created_at >= ?
       GROUP BY month`,
      [`${months[0]}-01`]
    );
    const signupByMonth = new Map(signupRows.map((r) => [r.month, r.count]));
    const signupTrend = months.map((month) => ({ month, count: signupByMonth.get(month) || 0 }));

    const [topics] = await pool.query('SELECT id, name, total_lessons FROM topics ORDER BY id');

    // Per-user average first, then averaged across users — so a user who
    // retakes a topic's quiz repeatedly doesn't outweigh one who took it
    // once.
    const [quizRows] = await pool.query(
      `SELECT topic_id, AVG(user_avg) AS avgScore, COUNT(*) AS userCount
       FROM (
         SELECT topic_id, user_id, AVG(score) AS user_avg
         FROM quiz_results
         GROUP BY topic_id, user_id
       ) per_user
       GROUP BY topic_id`
    );
    const quizByTopic = new Map(quizRows.map((r) => [r.topic_id, r]));

    const [lessonRows] = await pool.query(
      `SELECT topic_id,
              SUM(completed_count) AS sumCompleted,
              COUNT(DISTINCT CASE WHEN completed_count > 0 THEN user_id END) AS usersStarted
       FROM lesson_progress
       GROUP BY topic_id`
    );
    const lessonByTopic = new Map(lessonRows.map((r) => [r.topic_id, r]));

    const quizAverageByTopic = topics.map((topic) => {
      const row = quizByTopic.get(topic.id);
      const userCount = row ? Number(row.userCount) : 0;
      const avgScore = row ? Math.round(Number(row.avgScore) * 10) / 10 : 0;
      return {
        topicId: topic.id,
        topicName: topic.name,
        userCount,
        avgScore: suppressBelowMinSample(avgScore, userCount),
      };
    });

    // Average % completion across ALL registered users (a user with no
    // lesson_progress row for a topic counts as 0%), not just users who
    // started it — a low "≥1 lesson" bar tells an admin little when every
    // topic only has 10 lessons.
    const completionByTopic = topics.map((topic) => {
      const row = lessonByTopic.get(topic.id);
      const usersStarted = row ? Number(row.usersStarted) : 0;
      const sumCompleted = row ? Number(row.sumCompleted) : 0;
      const avgPct =
        totalUsers > 0
          ? Math.round((sumCompleted / (topic.total_lessons * totalUsers)) * 1000) / 10
          : 0;
      return {
        topicId: topic.id,
        topicName: topic.name,
        usersStarted,
        avgCompletionPct: suppressBelowMinSample(avgPct, usersStarted),
      };
    });

    const [[feedbackSummary]] = await pool.query(
      'SELECT COUNT(*) AS total, AVG(rating) AS avgRating FROM feedback'
    );

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        deactivated: totalUsers - activeUsers,
      },
      signupTrend,
      quizAverageByTopic,
      completionByTopic,
      feedback: {
        total: feedbackSummary.total,
        avgRating:
          feedbackSummary.total > 0
            ? Math.round(Number(feedbackSummary.avgRating) * 10) / 10
            : null,
      },
      minSampleSize: MIN_SAMPLE_SIZE,
    });
  })
);
