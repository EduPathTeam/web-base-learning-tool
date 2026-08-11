import express from 'express';
import cors from 'cors';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import { authRouter } from './routes/auth.js';
import { progressRouter } from './routes/progress.js';
import { feedbackRouter } from './routes/feedback.js';

// Express app configuration, separated from src/index.js's app.listen()
// call so tests (server/test/*.test.js) can import and exercise the app
// directly on an ephemeral port without needing a second running process.
export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(
    session({
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
