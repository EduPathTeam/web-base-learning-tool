import express from 'express';
import cors from 'cors';
import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import rateLimit from 'express-rate-limit';
import { pool } from './db/pool.js';
import { authRouter } from './routes/auth.js';
import { progressRouter } from './routes/progress.js';
import { feedbackRouter } from './routes/feedback.js';

const MySQLStore = MySQLStoreFactory(session);

// Express app configuration, separated from src/index.js's app.listen()
// call so tests (server/test/*.test.js) can import and exercise the app
// directly on an ephemeral port without needing a second running process.
export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json());

  // Reuses the shared connection pool (db/pool.js) instead of opening a
  // second one. createDatabaseTable is false because the `sessions` table
  // is created by migration 002_add_sessions_table.sql, not by this
  // library's own auto-create — CLAUDE.md's migration rules say schema
  // changes go through migration files, never ad-hoc table creation.
  // Passing our own pool also makes the store skip closing it on
  // store.close() (endConnectionOnClose defaults to false when a
  // connection is supplied), so pool lifecycle stays owned by pool.js.
  const sessionStore = new MySQLStore({ createDatabaseTable: false }, pool);
  // Exposed so callers (e.g. the test suite's teardown) can stop the
  // store's periodic expired-session cleanup interval on shutdown.
  app.locals.sessionStore = sessionStore;

  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  );

  // CLAUDE.md's security rules call for rate limiting on public-facing
  // endpoints like login, registration, and feedback submission — this
  // wasn't in place before. Limits are generous enough not to interfere
  // with normal use or with the test suite's handful of requests per run.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many attempts. Please try again in a few minutes.' },
  });
  const feedbackLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many feedback submissions. Please try again later.' },
  });

  app.get('/api/v1/health', (req, res) => res.json({ ok: true }));

  app.use('/api/v1/auth/register', authLimiter);
  app.use('/api/v1/auth/login', authLimiter);
  app.use('/api/v1/auth/forgot-password', authLimiter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/progress', progressRouter);
  app.use('/api/v1/feedback', feedbackLimiter, feedbackRouter);

  // Centralized error handler so a thrown/rejected error in any route
  // returns a clean JSON 500 instead of leaking a stack trace or hanging.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  });

  return app;
}
