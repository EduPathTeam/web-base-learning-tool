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

See `SEMESTER_2_PROJECT_REPORT.md` for a full, verified breakdown of what's implemented vs. outstanding. In short: session storage is in-memory (fine for local dev, not production), there's no password reset/email verification, and **nothing in this project is committed to git yet** — commit the work before doing anything that could lose the working directory.
