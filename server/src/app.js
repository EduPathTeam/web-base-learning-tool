import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import { doubleCsrf } from 'csrf-csrf';
import rateLimit from 'express-rate-limit';
import { pool } from './db/pool.js';
import { authRouter } from './routes/auth.js';
import { progressRouter } from './routes/progress.js';
import { feedbackRouter } from './routes/feedback.js';
import { usersRouter } from './routes/users.js';
import { analyticsRouter } from './routes/analytics.js';

const MySQLStore = MySQLStoreFactory(session);
const isProduction = process.env.NODE_ENV === 'production';

// Express app configuration, separated from src/index.js's app.listen()
// call so tests (server/test/*.test.js) can import and exercise the app
// directly on an ephemeral port without needing a second running process.
export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json());
  // csrf-csrf reads the CSRF cookie via req.cookies, which only exists
  // once cookie-parser has run.
  app.use(cookieParser());

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
      // Must be true (not the previous false) so that every visitor —
      // including ones who never log in — gets a stable session id from
      // their very first request. CSRF protection below binds each token
      // to req.session.id; with saveUninitialized:false, no session
      // cookie is ever sent to an anonymous visitor, so express-session
      // would mint a brand-new id on every request and CSRF validation
      // would always fail for register/login/anonymous feedback.
      saveUninitialized: true,
      cookie: {
        httpOnly: true,
        secure: isProduction,
        // Vercel (frontend) and Railway (backend) are different domains —
        // genuinely cross-site, not just cross-port-same-site like local
        // dev. SameSite=Lax (the default when unset) is not sent on
        // cross-site fetch(), only on top-level navigations, so without
        // this the session cookie silently never makes it back to the
        // server and every request looks logged-out. None requires
        // Secure, which isProduction already sets.
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  );

  // CSRF protection (double-submit cookie pattern) for every state-changing
  // request. csrf-csrf (actively maintained) was chosen over the archived
  // `csurf` package. The client fetches a token from GET /csrf-token (see
  // below — reads are exempt from protection by default) and echoes it
  // back in an `x-csrf-token` header on POST/PUT/PATCH/DELETE requests;
  // apiClient.js does this automatically so existing call sites don't
  // need to change individually.
  const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET,
    getSessionIdentifier: (req) => req.session.id,
    cookieName: 'csrf-token',
    cookieOptions: {
      // Same cross-site reasoning as the session cookie above — without
      // this, the CSRF cookie never reaches the server either, and every
      // POST/PATCH/DELETE fails with 403 EBADCSRFTOKEN.
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
      httpOnly: true,
    },
    errorConfig: {
      message: 'Invalid or missing CSRF token. Please refresh the page and try again.',
    },
  });
  app.locals.generateCsrfToken = generateCsrfToken;

  app.get('/api/v1/csrf-token', (req, res) => {
    res.json({ csrfToken: generateCsrfToken(req, res) });
  });

  app.use(doubleCsrfProtection);

  // CLAUDE.md's security rules call for rate limiting on public-facing
  // endpoints like login, registration, and feedback submission — this
  // wasn't in place before. Limits are generous enough not to interfere
  // with normal use or with the test suite's handful of requests per run.
  //
  // Two separate limiter instances, not one shared across all four auth
  // paths: register/login (credential-guessing risk) and
  // forgot-password/reset-password (token-guessing risk) are different
  // threat models, and sharing a single 20-request budget across all
  // four meant the test suite's own legitimate traffic (registering
  // several isolated test users, then also exercising login and the
  // password-reset flow in the same run) could exhaust it well before
  // any single endpoint was actually hammered.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many attempts. Please try again in a few minutes.' },
  });
  const passwordResetLimiter = rateLimit({
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
  app.use('/api/v1/auth/forgot-password', passwordResetLimiter);
  app.use('/api/v1/auth/reset-password', passwordResetLimiter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/progress', progressRouter);
  app.use('/api/v1/users', usersRouter);
  app.use('/api/v1/analytics', analyticsRouter);
  // Scoped to POST only (not app.use) so the rate limiter doesn't also
  // throttle the admin GET /feedback listing route.
  app.post('/api/v1/feedback', feedbackLimiter);
  app.use('/api/v1/feedback', feedbackRouter);

  // Centralized error handler so a thrown/rejected error in any route
  // returns a clean JSON response instead of leaking a stack trace or
  // hanging. Known 4xx errors (e.g. csrf-csrf's invalidCsrfTokenError)
  // carry their own status and a message that's safe to expose; anything
  // else is treated as unexpected and collapsed to a generic 500.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.status && err.status < 500) {
      return res
        .status(err.status)
        .json({ error: err.message, ...(err.code ? { code: err.code } : {}) });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  });

  return app;
}
