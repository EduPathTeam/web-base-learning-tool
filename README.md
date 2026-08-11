# web-base-learning-tool

A DSA (Data Structures & Algorithms) learning platform: 12 interactive lessons, quizzes, a progress dashboard, and accounts. Built with React (Vite) on the frontend and a Node/Express + MySQL backend.

## Project structure

```
/                   React + Vite frontend
  src/
    components/     Header, Footer, shared lesson components (quiz, visualizers, ...)
    pages/          Home, Learn, Dashboard, Quiz, Sign In, About, Feedback, lessons/*
    lib/            csPlatform.js (progress store), apiClient.js, authState.js
    hooks/          useScrollReveal.js, useLessonTimer.js
    context/        AuthContext.jsx
    styles/         per-page CSS
server/             Node + Express + MySQL API
  src/
    app.js          Express app config (exported for tests)
    index.js        Entry point — imports app.js, calls app.listen()
    routes/         auth, progress, feedback
    db/             connection pool + migration runner
  migrations/       numbered .sql migration files
  test/             backend integration tests (node:test)
```

## Running locally

You need Node.js and a running local MySQL server.

**1. Frontend**
```
npm install
npm run dev        # http://localhost:5173
```

**2. Backend**
```
cd server
npm install
cp .env.example .env   # fill in your local MySQL credentials
npm run migrate        # creates the database + tables if they don't exist
npm run dev             # http://localhost:4000
```

The frontend works standalone on `localStorage` even without the backend running (guest mode). Signing in via `/sign-in` requires the backend to be running, and syncs your progress to MySQL. **If Sign In shows "Can't reach the server," it almost always means the backend from step 2 isn't running.**

**Shortcut:** once both `npm install`s and step 2's one-time `.env`/`migrate` setup are done, `npm run dev:all` (from the project root) starts both the frontend and backend together in one terminal.

## Testing

```
npm test            # frontend: csPlatform.js progress-logic unit tests (node:test)
cd server && npm test   # backend: API integration tests against your local MySQL (node:test)
```

Both use Node's built-in test runner — no extra test framework dependency. The backend suite runs against your real local database (there's no separate test DB) but cleans up every row it creates.

## Environment variables (server/.env)

See `server/.env.example`. Never commit `server/.env` — it's gitignored.

## Known limitations

See `SEMESTER_2_PROJECT_REPORT.md` for a full, verified breakdown of what's implemented vs. outstanding. In short: sessions are persisted in MySQL, every state-changing request is CSRF-protected, and password reset works (see below) — but there's still no email verification and no admin role.

### Sessions

Login sessions are stored in MySQL via `express-mysql-session` (table `sessions`, created by `server/migrations/002_add_sessions_table.sql` — run `npm run migrate` after pulling this change). This replaced `express-session`'s default in-memory store, which loses all sessions on every server restart and isn't safe under concurrent load. No new environment variables are needed — the session store reuses the same `DB_*` credentials and connection pool as the rest of the app.

### CSRF protection

Every `POST`/`PUT`/`PATCH`/`DELETE` request to the API must carry a valid `x-csrf-token` header (double-submit cookie pattern, via `csrf-csrf`). The frontend's `apiClient.js` handles this automatically — it fetches a token from `GET /api/v1/csrf-token` on the first mutating request and caches it, so existing call sites (`apiPost`, etc.) don't need any changes. If you're calling the API directly (curl, Postman, a new script), fetch a token from that endpoint first and send it back in both the `x-csrf-token` header and as the cookie the endpoint set.

Requires `CSRF_SECRET` in `server/.env` (see `.env.example`) — a long random string, separate from `SESSION_SECRET` so the two mechanisms can be rotated independently.

### Password reset

`/forgot-password` → `POST /api/v1/auth/forgot-password` generates a random token, stores only its SHA-256 hash (`password_reset_tokens` table), and — **because no transactional email provider is configured yet** — logs the reset link to the **server console only**, clearly labeled `[DEV ONLY — no email provider configured]`. Copy that link from the terminal running `server`'s `npm run dev`/`npm start` to test the flow locally. Tokens expire after 1 hour and can only be used once. `/reset-password?token=...` (the link's destination) collects a new password and submits it to `POST /api/v1/auth/reset-password`.

This is a deliberate interim state, not an oversight — wiring up a real email provider (e.g. SendGrid/Postmark/SES) is a separate decision requiring its own sign-off before being added.

### Production deployment note

Both the session cookie and the CSRF cookie set `secure: true` when `NODE_ENV=production`, which means **the backend must be served over HTTPS in production** — browsers silently refuse to store or send `secure` cookies over plain HTTP, which would break sign-in and every CSRF-protected request. Locally (`NODE_ENV` unset), cookies are sent over HTTP as before, so local dev is unaffected.
