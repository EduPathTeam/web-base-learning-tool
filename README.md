# web-base-learning-tool

A DSA (Data Structures & Algorithms) learning platform: 12 interactive lessons, quizzes, a progress dashboard, and accounts. Built with React (Vite) on the frontend and a Node/Express + MySQL backend.

## Project structure

```
/                   React + Vite frontend
  src/
    components/     Header, Footer, shared lesson components (quiz, visualizers, ...)
    pages/          Home, Learn, Dashboard, Profile, Quiz, About, Feedback, AdminFeedback,
                    AdminUsers, lessons/*
      auth/          SignIn, SignUp, ForgotPassword, ResetPassword
    lib/            csPlatform.js (progress store), apiClient.js, authState.js
    hooks/          useScrollReveal.js, useLessonTimer.js, useProgressSync.js
    context/        AuthContext.jsx
    styles/         per-page CSS
server/             Node + Express + MySQL API
  src/
    app.js          Express app config (exported for tests)
    index.js        Entry point — imports app.js, calls app.listen()
    routes/         auth, progress, feedback, users
    middleware/     requireAuth, requireAdmin, asyncHandler
    db/             connection pool + migration runner
  migrations/       numbered .sql migration files
  test/             backend integration tests (node:test)
e2e/                Playwright end-to-end specs (npm run test:e2e)
playwright.config.js
docs/legacy/        Superseded pre-React-migration docs, kept for history
                    (CLAUDE.md, PROJECT_CONTEXT.md, SYSTEM_ARCHITECTURE.md)
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

### End-to-end (browser) tests

```
npm run test:e2e
```

Playwright, run separately from `npm test` so day-to-day runs stay fast — it drives a real Chromium browser against real dev servers and your real local MySQL (same setup as the backend integration suite; `server/.env` must be filled in). It starts the frontend and backend dev servers itself (see `playwright.config.js`'s `webServer` entries) and cleans up every row it creates. Covers: the guest flow (lesson → mark complete → take its quiz → Dashboard reflects it, no account), the auth flow (register → sign out → sign back in on a **fresh browser context** → progress persisted from the server, not just the browser), and the feedback form (submit → success state).

## Linting & formatting

```
npm run lint          # frontend: eslint . && prettier --check .
npm run lint:fix       # frontend: auto-fix + reformat
cd server && npm run lint   # backend: same, scoped to server/
```

ESLint 9 (flat config, one `eslint.config.js` per package) + Prettier. The 12 lesson pages, their visualizers, the quiz engine, and quiz content (`src/pages/lessons/`, `src/components/lessons/*Visualizer.jsx`, `QuizSection.jsx`, `src/data/quizQuestions.js`) are still linted for real bugs but are excluded from auto-fixing and Prettier's `--write`/`--check` (see `.prettierignore`) — they're out of scope to modify in this pass, even cosmetically.

## Environment variables (server/.env)

See `server/.env.example`. Never commit `server/.env` — it's gitignored.

## Known limitations

See `SEMESTER_2_PROJECT_REPORT.md` for a full, verified breakdown of what's implemented vs. outstanding. In short: sessions are persisted in MySQL, every state-changing request is CSRF-protected, password reset works, and there's a full admin view for feedback and user management (see below) — but there's still no email verification.

### Sessions

Login sessions are stored in MySQL via `express-mysql-session` (table `sessions`, created by `server/migrations/002_add_sessions_table.sql` — run `npm run migrate` after pulling this change). This replaced `express-session`'s default in-memory store, which loses all sessions on every server restart and isn't safe under concurrent load. No new environment variables are needed — the session store reuses the same `DB_*` credentials and connection pool as the rest of the app.

### CSRF protection

Every `POST`/`PUT`/`PATCH`/`DELETE` request to the API must carry a valid `x-csrf-token` header (double-submit cookie pattern, via `csrf-csrf`). The frontend's `apiClient.js` handles this automatically — it fetches a token from `GET /api/v1/csrf-token` on the first mutating request and caches it, so existing call sites (`apiPost`, etc.) don't need any changes. If you're calling the API directly (curl, Postman, a new script), fetch a token from that endpoint first and send it back in both the `x-csrf-token` header and as the cookie the endpoint set.

Requires `CSRF_SECRET` in `server/.env` (see `.env.example`) — a long random string, separate from `SESSION_SECRET` so the two mechanisms can be rotated independently.

### Password reset

`/forgot-password` → `POST /api/v1/auth/forgot-password` generates a random token, stores only its SHA-256 hash (`password_reset_tokens` table), and — **because no transactional email provider is configured yet** — logs the reset link to the **server console only**, clearly labeled `[DEV ONLY — no email provider configured]`. Copy that link from the terminal running `server`'s `npm run dev`/`npm start` to test the flow locally. Tokens expire after 1 hour and can only be used once. `/reset-password?token=...` (the link's destination) collects a new password and submits it to `POST /api/v1/auth/reset-password`.

This is a deliberate interim state, not an oversight — wiring up a real email provider (e.g. SendGrid/Postmark/SES) is a separate decision requiring its own sign-off before being added.

### Admin access

`users.role` is `'student'` by default; `'admin'` unlocks `/admin/feedback` (lists all feedback submissions, paginated) and `/admin/users` (see below). There's no self-service admin promotion at registration, so to make the _first_ local account an admin, run this against your local database after registering it normally:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

After that, further promotions/demotions can be done in-app from `/admin/users` — the manual SQL statement above is only needed once, to bootstrap the first admin. Non-admins (including signed-out visitors) get a 403/401-style message if they visit either admin page directly; neither is linked from the main nav.

### Admin: user management

`/admin/users` — list every account (paginated), promote/demote role, deactivate/reactivate. Backed by `GET /api/v1/users`, `PATCH /api/v1/users/:id/role`, `PATCH /api/v1/users/:id/deactivate`, `PATCH /api/v1/users/:id/reactivate` (`server/src/routes/users.js`), all admin-only.

- **No hard delete.** Deactivation is the moderation primitive — reversible, and doesn't cascade-delete a student's `lesson_progress`/`quiz_results` history the way a real delete would (see the schema's `ON DELETE CASCADE` rules). This was an explicit scope decision, not an omission.
- **Deactivation takes effect immediately, not just at next login.** `requireAuth.js` and `requireAdmin.js` both look up `is_active` fresh on every request (same reasoning as the existing fresh role lookup), so a deactivated user's already-active session is rejected on its very next request — not just once their 7-day session cookie naturally expires. Login is also blocked outright (403) for a deactivated account.
- **Two safety guards, enforced server-side:** an admin can never target their own account through these routes (no self-demote, no self-deactivate), and demoting or deactivating the last remaining _active_ admin is rejected outright, so the admin panel can never lock everyone out of itself by accident. (The manual SQL statement above remains available as a break-glass path regardless.)
- **No audit log.** An accepted tradeoff for this project's small admin pool, not an oversight — say the word if you want one added.

### Account isolation on shared browsers

Each account gets its own `localStorage` key (`csPlatformData_v2_user_<id>`), separate from guest browsing (`csPlatformData_v2_guest`). This used to be one shared key for everyone, so logging into a different account on the same browser showed the previous account's Dashboard data — a real bug, found via manual testing, fixed by scoping storage per identity (see `storageKeyFor()` in `csPlatform.js`). Guest progress still carries into your first login on a given account, same as before; a one-time migration handles browsers with data under the old shared key.

### Profile

`/profile` — view your email (read-only) and edit your display name, backed by `PATCH /api/v1/auth/me`. Email isn't editable yet: this project has no email verification, and email doubles as the login/password-reset identifier, so an unverified change would be a real lockout risk. "Change Password" links to the existing `/forgot-password` flow rather than a separate current-password-confirmation form.

### Progress sync across devices

Signed-in progress syncs server → local on login/register, on visiting the Dashboard, and whenever the browser tab regains focus (`src/hooks/useProgressSync.js`) — so switching between two devices (or two tabs) shows up without a full sign-out/sign-in. This is still one-way (server → local) and trigger-based, not a live push: a change made on another device appears here the next time one of those triggers fires on this one, not instantly. Full push-based sync (e.g. a websocket) was considered and explicitly ruled out as unwarranted for a single-user, non-collaborative learning tool.

### Production deployment note

Both the session cookie and the CSRF cookie set `secure: true` when `NODE_ENV=production`, which means **the backend must be served over HTTPS in production** — browsers silently refuse to store or send `secure` cookies over plain HTTP, which would break sign-in and every CSRF-protected request. Locally (`NODE_ENV` unset), cookies are sent over HTTP as before, so local dev is unaffected.
