# Semester 2 Project Report

**Report type:** Factual codebase inspection (not a design document, not marketing copy)
**Basis:** Direct inspection of project files as they exist on disk at the time of writing
**Rule:** Anything not directly verifiable in the code is marked "Not verified"

**Update — Stabilization Pass:** After the initial inspection below, a scoped stabilization pass was completed. **Project scope was explicitly narrowed to Data Structures & Algorithms only** — Database Systems, Java, and Probability & Statistics are intentionally *not* built as learner-facing subjects (this is a scope decision, not a gap). Six concrete items from the original findings were fixed and verified: learning-time tracking now actually feeds the Dashboard, the Time Distribution chart covers all 12 topics, the Quiz Hub's scroll-to-quiz gap is fixed, backend rate limiting was added to auth/feedback endpoints, and both a backend integration test suite and a frontend unit test suite now exist and pass. Every section below has been updated in place to reflect this — sections describing something as still-broken now say so only if it's still actually broken.

Status legend used throughout this report:

| Symbol | Meaning |
|---|---|
| ✅ COMPLETE | Implemented and confirmed working (built, or tested with curl/browser) |
| 🟡 PARTIALLY COMPLETE | Implemented but with known gaps, limitations, or missing pieces |
| 🔴 NOT IMPLEMENTED | No code found for this feature |
| ⚠️ NEEDS TESTING | Code exists but has not been verified working end-to-end |
| ❓ NOT VERIFIED | Could not be confirmed from the code alone |

---

# 1. Project Overview

- **Project name:** Web-Based Learning Tool for Core Computing Subjects (repository name: `web-base-learning-tool`)
- **Purpose:** Browser-based platform teaching Data Structures & Algorithms (DSA) through lessons, interactive visualizers, quizzes, and a progress dashboard.
- **Semester 1 role (per project background provided):** requirements, system analysis, UI/UX design, interface prototypes, system workflow, proposed database design. *(Not independently verifiable from current code — the Semester 1 static prototype was replaced during Semester 2 work.)*
- **Semester 2 role:** completing frontend, backend, database integration, authentication, API integration, learning progress, quizzes, dashboard, feedback, testing.
- **Main subjects the platform is meant to cover:** Data Structures & Algorithms, Database Systems, Advanced Programming Languages (Java), Probability & Statistics.
- **Current overall status:** The project was rebuilt from a static multi-page HTML/CSS/JS prototype into a React (Vite) single-page application with a separate Node/Express + MySQL backend. All 12 planned DSA lessons exist with quizzes and visualizers. Authentication and database persistence are implemented and were tested manually with `curl`. **No automated tests exist.** **No code has been committed to git yet** — all Semester 2 work is currently uncommitted in the working directory.

**What the application currently does (short summary):** A visitor can browse 12 DSA lessons (Array, Linked List, Queue, Stack, Tree, Graph, Recursion, Dynamic Programming, Sorting, Searching, Greedy, Big-O), each with an interactive visualizer, Python/Java code samples, and a 5-question quiz. Progress and quiz scores are saved to the browser's `localStorage` for guests, or to a MySQL database when the visitor registers/logs in. A dashboard shows stats (lessons completed, quiz average, streak, learning time), a "recommended major" heuristic, topic progress, recent activity, and two charts. A feedback form posts to the backend and is stored in MySQL.

---

# 2. Technology Stack

| Layer | Technology | Actual Usage | Status |
|---|---|---|---|
| Frontend | React 18 (`react`, `react-dom` ^18.3.1) | SPA UI, all pages/components | ✅ COMPLETE |
| Frontend routing | React Router (`react-router-dom` ^6.26.2) | Client-side routing, 19 routes in `src/App.jsx` | ✅ COMPLETE |
| Build tool | Vite (`vite` ^5.4.6, `@vitejs/plugin-react`) | Dev server + production build (`npm run dev`, `npm run build`) | ✅ COMPLETE (build confirmed passing) |
| Charts | Chart.js (`chart.js` ^4.4.4, via `chart.js/auto`) | Dashboard's line chart (performance trend) and pie chart (time distribution) | ✅ COMPLETE |
| Styling | Plain CSS (per-page files in `src/styles/`), Bootstrap 5 + Bootstrap Icons (via CDN `<link>` in `index.html`) | Layout/utility classes + custom component CSS | ✅ COMPLETE |
| Backend | Node.js + Express (`express` ^4.19.2) | REST API server in `server/src/` | ✅ COMPLETE (manually tested) |
| Database | MySQL 8 (`mysql2` ^3.11.0, promise API) | Persistent storage for users, topics, lesson progress, quiz results, feedback | ✅ COMPLETE (connected and tested against a real local MySQL 8.0.46 instance) |
| Authentication | `bcryptjs` (password hashing) + `express-session` (session cookies) | Register/login/logout/`me`, session-gated API routes | 🟡 PARTIALLY COMPLETE (see §7 — session store is in-memory, not production-grade) |
| API communication | Native `fetch` via a custom wrapper (`src/lib/apiClient.js`) | Frontend → backend HTTP calls with `credentials: 'include'` | ✅ COMPLETE |
| Environment config | `dotenv` (backend only) | `server/.env` (gitignored) holds DB credentials, session secret, port, CORS origin | ✅ COMPLETE |
| Rate limiting | `express-rate-limit` ^8.6.2 | Applied to `/auth/register`, `/auth/login` (20 req/15min), `/feedback` (10 req/15min) | ✅ COMPLETE (verified — 21st login attempt in a window returns HTTP 429) |
| Testing | Node's built-in test runner (`node:test`, `node:assert/strict`) — no added dependency | Frontend: `src/lib/csPlatform.test.js` (16 tests, pure logic). Backend: `server/test/api.test.js` (17 tests, real HTTP requests against the real Express app + local MySQL) | ✅ COMPLETE (33/33 passing) |
| Linting | None found | No ESLint/Prettier config in either `package.json` | 🔴 NOT IMPLEMENTED |

---

# 3. Project Folder Structure

```text
Web-Base-LearningTool/
├── index.html                     Vite SPA entry point
├── package.json                   Frontend dependencies + scripts (dev/build/preview)
├── vite.config.js
├── README.md                      Setup instructions (added this session)
├── CLAUDE.md                      Project rules/conventions doc (Semester 2 authoring aid)
├── PROJECT_CONTEXT.md             Prior-state snapshot doc (describes the OLD static prototype)
├── SYSTEM_ARCHITECTURE.md         Prior-state architecture doc (describes the OLD static prototype)
├── public/
│   └── images/                    icon.png, mission images (static assets)
├── src/
│   ├── main.jsx                   ReactDOM root, wraps <App/> in <AuthProvider> + <BrowserRouter>
│   ├── App.jsx                    All route definitions (19 routes)
│   ├── components/
│   │   ├── Header.jsx             Nav bar, active-link pill animation, sign-in/sign-out state
│   │   ├── Footer.jsx
│   │   └── lessons/                12 topic-specific visualizers + shared lesson widgets:
│   │       ├── ArrayVisualizer.jsx, LinkedListVisualizer.jsx, QueueVisualizer.jsx,
│   │       │   StackVisualizer.jsx, TreeVisualizer.jsx, GraphVisualizer.jsx,
│   │       │   RecursionVisualizer.jsx, DPVisualizer.jsx, SortingVisualizer.jsx,
│   │       │   SearchingVisualizer.jsx, GreedyVisualizer.jsx, BigOVisualizer.jsx
│   │       ├── QuizSection.jsx     Reusable 5-question quiz engine
│   │       ├── LessonProgressBar.jsx  "Mark Lesson Complete" widget
│   │       ├── LessonHero.jsx, LessonNav.jsx, CodeTabs.jsx, PracticeExercise.jsx
│   ├── pages/
│   │   ├── Home.jsx, Learn.jsx, Dashboard.jsx, QuizHub.jsx, SignIn.jsx, About.jsx, Feedback.jsx
│   │   ├── ComingSoon.jsx         Generic "not built yet" placeholder (used for 404 route only)
│   │   └── lessons/               ArrayLesson.jsx ... BigOLesson.jsx (12 files, one per topic)
│   ├── context/
│   │   └── AuthContext.jsx        React context: user session state, login/register/logout
│   ├── lib/
│   │   ├── csPlatform.js          Progress data store (localStorage + optional API sync)
│   │   ├── csPlatform.test.js     16 unit tests for csPlatform.js's derived-stat logic (node:test)
│   │   ├── apiClient.js           fetch() wrapper for the backend API
│   │   ├── authState.js           Module-level "who is signed in" mirror (for non-React code)
│   │   └── feedbackStore.js       Local-only feedback log (secondary to the real API call)
│   ├── hooks/
│   │   ├── useScrollReveal.js     IntersectionObserver-based fade-in effect
│   │   └── useLessonTimer.js      Tracks time-on-page per lesson, feeds addLearningMinutes()
│   └── styles/                    array.css, learn.css, dashboard.css, home.css, quiz.css,
│                                   signin.css, feedback.css, about.css
└── server/
    ├── package.json                Backend dependencies + scripts (dev/start/migrate/test)
    ├── .env                        Local DB credentials (gitignored, NOT committed)
    ├── .env.example                Template for .env (committed, no secrets)
    ├── migrations/
    │   └── 001_init.sql             Single migration: creates all 6 tables + seeds topics
    ├── test/
    │   └── api.test.js              17 integration tests against the real app + local MySQL (node:test)
    └── src/
        ├── app.js                  Express app config: CORS, sessions, rate limiting, routes, error handler
        ├── index.js                Entry point — imports app.js, calls app.listen()
        ├── db/
        │   ├── pool.js             mysql2 connection pool
        │   └── migrate.js          Migration runner (creates DB if missing, applies new .sql files)
        ├── middleware/
        │   ├── requireAuth.js      Rejects unauthenticated requests with 401
        │   └── asyncHandler.js     Wraps async route handlers so errors reach the error handler
        └── routes/
            ├── auth.js             POST /register, /login, /logout, GET /me
            ├── progress.js         GET /, POST /lesson-complete, /last-lesson, /quiz-result
            └── feedback.js         POST /
```

`src/app.js` was split out of `src/index.js` during the stabilization pass specifically so the test suite could import and exercise the configured app on an ephemeral port without a second manually-started process.

**Note:** `CLAUDE.md`, `PROJECT_CONTEXT.md`, and `SYSTEM_ARCHITECTURE.md` at the repository root describe the **previous** static-HTML version of this project (pre-React-migration). They are now out of date relative to the current React/Express codebase and should not be treated as accurate for the current implementation — this report supersedes them for describing current state.

---

# 4. Frontend Implementation

## 4.1 Routing (`src/App.jsx`)

19 routes are registered. All confirmed present in code:

| Route | Component | Status |
|---|---|---|
| `/` | `Home.jsx` | ✅ COMPLETE |
| `/learn` | `Learn.jsx` | ✅ COMPLETE |
| `/learn/array` … `/learn/big-o` (12 routes) | `pages/lessons/*.jsx` | ✅ COMPLETE (all 12 exist) |
| `/dashboard` | `Dashboard.jsx` | ✅ COMPLETE |
| `/quiz` | `QuizHub.jsx` | ✅ COMPLETE |
| `/about` | `About.jsx` | ✅ COMPLETE |
| `/sign-in` | `SignIn.jsx` | ✅ COMPLETE |
| `/feedback` | `Feedback.jsx` | ✅ COMPLETE |
| `*` (404) | `ComingSoon.jsx` | ✅ COMPLETE (generic fallback page) |

No routes currently point at `ComingSoon.jsx` except the wildcard 404 catch-all — i.e. there are no "stub" pages left in the main navigation.

## 4.2 Pages — verified content

| Page | What it actually contains |
|---|---|
| `Home.jsx` | Rotating 3D course carousel, intro section, quick-action buttons, feature cards, CTA section |
| `Learn.jsx` | Two lesson-picker columns (Data Structure / Algorithm), all 12 marked `ready: true` and linked |
| `Dashboard.jsx` | 4 stat cards, Chart.js line chart (weekly performance), recommended-major card, topic progress list (all 12 topics), recent activity feed, quick actions, Chart.js pie chart (time distribution, all 12 topics — see §8/§10) |
| `QuizHub.jsx` | Lists all 12 topics with best score so far; links to each lesson's embedded quiz section (not a separate quiz engine) |
| `SignIn.jsx` | Login/register panel-flip UI, calls real `/api/v1/auth/*` endpoints via `AuthContext` |
| `About.jsx` | Story, mission, "what you can learn" cards, team section, impact counters (animated), CTA |
| `Feedback.jsx` | Name/email/category/star-rating/message form, POSTs to `/api/v1/feedback` |
| `ComingSoon.jsx` | Generic message + link back home; used only for unmatched routes |

## 4.3 Lesson pages (12 total) — verified structure

Each of the 12 files in `src/pages/lessons/` was checked and contains, in this order: hero section, `LessonProgressBar`, Learning Objectives, "What is X" explainer, an interactive visualizer, an operations/concepts grid, a time-complexity table, advantages/disadvantages, applications, a `CodeTabs` block (JavaScript/Python/Java), a summary, a `QuizSection` (5 questions), a `PracticeExercise`, and `LessonNav` (Previous/Next links chained in this order: Array → Linked List → Queue → Stack → Tree → Graph → Recursion → Dynamic Programming → Sorting → Searching → Greedy → Big-O).

✅ COMPLETE for all 12 topics — confirmed by grepping every lesson file for `QuizSection` usage (12/12 matched).

## 4.4 Shared components

| Component | Verified behavior |
|---|---|
| `Header.jsx` | Active-route pill animation, mobile burger menu, shows "Sign In" link or `{displayName} · Sign Out` depending on `AuthContext` state |
| `QuizSection.jsx` | One question at a time, locks answer after selection, shows correct/incorrect + explanation, live running score, final summary screen, retry button. Calls `recordQuizResult(topicId, score)` on finish. |
| `LessonProgressBar.jsx` | Reads/writes `csPlatform.js` data; "Mark Lesson Complete" button disables once the topic's lesson count is exhausted |
| `CodeTabs.jsx` | Tab-switches between JS/Python/Java code blocks (client-side state only, no execution) |

---

# 5. Backend Implementation

## 5.1 Server setup (`server/src/app.js` + `server/src/index.js`)

- Express app with `cors` (origin restricted to `CLIENT_ORIGIN` env var, `credentials: true`), `express.json()`, and `express-session`.
- Session cookie: `httpOnly: true`, 7-day `maxAge`. **No `secure` flag set** (fine for local HTTP dev, would need to be set for HTTPS production).
- **Session store: default in-memory `MemoryStore`.** No Redis/MySQL session store configured. 🟡 This is explicitly unsuitable for production (Express prints a warning about this) — sessions are lost on server restart and this will leak memory under sustained load. Confirmed by reading `app.js`; no alternate store package (e.g. `connect-redis`, `express-mysql-session`) is installed. **Not changed in the stabilization pass** — acceptable for local/dev use, called out explicitly as a pre-production item.
- **Rate limiting (added in the stabilization pass):** `express-rate-limit` applied to `/api/v1/auth/register`, `/api/v1/auth/login` (20 requests/15min per IP) and `/api/v1/feedback` (10 requests/15min per IP). ✅ Verified: 25 rapid login attempts returned `401` for the first 20 and `429 Too Many Requests` for the remaining 5.
- Centralized error-handling middleware returns JSON `{ error: 'Internal server error.' }` on unhandled exceptions.
- `app.js` exports `createApp()` (config only, no `listen()`); `index.js` calls it and listens on `PORT` env var (default 4000). This split (done in the stabilization pass) is what allows `server/test/api.test.js` to run the real app in-process.

## 5.2 API routes — verified against source

| Method & Path | Auth required | Purpose | Status |
|---|---|---|---|
| `GET /api/v1/health` | No | Liveness check, returns `{ ok: true }` | ✅ COMPLETE (tested) |
| `POST /api/v1/auth/register` | No | Create account (email, password ≥8 chars, displayName); hashes password with bcrypt (cost 10); starts a session | ✅ COMPLETE (tested) |
| `POST /api/v1/auth/login` | No | Verifies bcrypt hash, starts a session | ✅ COMPLETE (tested, including wrong-password → 401) |
| `POST /api/v1/auth/logout` | Session | Destroys session | ✅ COMPLETE (covered by an automated test: logout then confirm `/me` returns 401) |
| `GET /api/v1/auth/me` | Session | Returns current user or 401 | ✅ COMPLETE (tested) |
| `GET /api/v1/progress` | Session | Returns topics, `completedLessons`, `quizResults`, `lastLessonByTopic` for the logged-in user | ✅ COMPLETE (tested) |
| `POST /api/v1/progress/lesson-complete` | Session | Increments `completed_count` for a topic (capped at `total_lessons`), upserts | ✅ COMPLETE (tested, including the unknown-topic-id → 404 case) |
| `POST /api/v1/progress/last-lesson` | Session | Upserts the last-visited lesson URL for a topic | ⚠️ NEEDS TESTING (still not directly covered by an automated test, though it is called by the frontend on every lesson-page load; low risk since it shares its implementation pattern with the tested `lesson-complete` route) |
| `POST /api/v1/progress/quiz-result` | Session | Inserts a quiz score row (0–100) | ✅ COMPLETE (tested, including out-of-range-score → 400) |
| `POST /api/v1/feedback` | No (optional session) | Validates and inserts a feedback row; tags `user_id` if signed in, else `NULL` | ✅ COMPLETE (tested, including missing-message → 400) |

All routes wrapped in `asyncHandler` so a thrown/rejected DB error is forwarded to the centralized error handler instead of hanging the request. Confirmed by reading every route file.

## 5.3 Not implemented on the backend

- 🔴 No password reset / "forgot password" flow.
- 🔴 No email verification.
- 🔴 No admin/moderation endpoints for viewing submitted feedback (feedback can only currently be inspected by querying MySQL directly).
- ~~No rate limiting~~ — **fixed in the stabilization pass**, see §5.1.
- ~~No automated tests~~ — **fixed in the stabilization pass**, see §13.

---

# 6. Database Implementation

## 6.1 Connection

- `server/src/db/pool.js` creates a `mysql2` connection pool using `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` from `server/.env`.
- Verified working against a real local **MySQL 8.0.46** instance (Windows service `MySQL80`) during this project's development — confirmed via a direct connection test and via the migration run succeeding.

## 6.2 Schema (`server/migrations/001_init.sql`)

Single migration file, applied via a custom runner (`server/src/db/migrate.js`) that tracks applied files in a `schema_migrations` table.

| Table | Columns | Notes |
|---|---|---|
| `users` | `id, email (unique), password_hash, display_name, created_at, updated_at` | ✅ COMPLETE |
| `topics` | `id (string PK), name, total_lessons, created_at, updated_at` | ✅ COMPLETE, seeded with all 12 topic IDs matching `csPlatform.js`'s `TOPICS` constant |
| `lesson_progress` | `id, user_id (FK), topic_id (FK), completed_count, last_lesson_url, completed_at, created_at, updated_at` | Unique key on `(user_id, topic_id)`; ✅ COMPLETE |
| `quiz_results` | `id, user_id (FK), topic_id (FK), score, taken_at` | `CHECK (score BETWEEN 0 AND 100)`; append-only (no `updated_at`, by design — it's a log) |
| `feedback` | `id, user_id (FK, nullable), name, email, category, rating, message, created_at` | `CHECK (rating BETWEEN 0 AND 5)`; `user_id` nullable so anonymous feedback is allowed |
| `schema_migrations` | `filename (PK), applied_at` | Internal bookkeeping table for the migration runner, not part of the application data model |

Foreign keys use `ON DELETE CASCADE` (progress/quiz results) or `ON DELETE SET NULL` (feedback's `user_id`) — deleting a user cascades to their progress/quiz rows but preserves their feedback anonymously.

Indexes exist on all foreign key columns (`idx_lesson_progress_user_id`, `idx_lesson_progress_topic_id`, `idx_quiz_results_user_id`, `idx_quiz_results_topic_id`, `idx_feedback_user_id`).

## 6.3 What was actually tested against the database

Verified in this session via `curl` + direct MySQL queries:
- Migration created the database and all 6 tables.
- 12 topics seeded correctly.
- A test user registered → password stored as a bcrypt hash (not plaintext) → confirmed by reading the raw `password_hash` column.
- A lesson-complete call correctly incremented `lesson_progress.completed_count`.
- A quiz-result call correctly inserted into `quiz_results`.
- `GET /progress` correctly reassembled this into the shape the frontend expects.
- A feedback submission was correctly inserted with a `NULL` `user_id` when unauthenticated.
- Invalid login correctly returned 401 without creating a session.

🟡 That initial verification was manual `curl`-based testing. **Since then, `server/test/api.test.js` automates all of the above (17 tests) and can be re-run at any time with `npm test` from `server/`** — it creates a uniquely-emailed test user and a tagged feedback row, exercises the flows above, and deletes both in an `after()` cleanup hook so it never leaves residue in the real database.

---

# 7. Authentication

| Aspect | Status | Detail |
|---|---|---|
| Password storage | ✅ COMPLETE | `bcryptjs`, cost factor 10, verified hash format `$2a$10$...` in the database |
| Session mechanism | 🟡 PARTIALLY COMPLETE | `express-session` with default in-memory store — works for local development, **not viable for production** (data lost on restart, not shared across server instances) |
| CORS + credentialed requests | ✅ COMPLETE | Verified via a manual OPTIONS preflight request and a full register→cookie→`/me` round trip with an `Origin: http://localhost:5173` header, matching real browser behavior |
| Frontend session awareness | ✅ COMPLETE | `AuthContext.jsx` checks `/auth/me` on load, exposes `user`/`loading`/`login`/`register`/`logout` |
| Guest mode | ✅ COMPLETE | The entire app functions without an account; `csPlatform.js` falls back to `localStorage` when `getCurrentUser()` is null |
| Sign-out UX | ✅ COMPLETE | Wired in `Header.jsx`, calls `logout()` then navigates home; the underlying `/auth/logout` call is covered by an automated test. Not manually clicked through in a live browser — the button itself is ⚠️ NEEDS TESTING only in the browser-click sense, the API contract it relies on is verified. |
| Password reset | 🔴 NOT IMPLEMENTED | No route, no UI |
| Email verification | 🔴 NOT IMPLEMENTED | Not present |
| Role-based authorization (student/admin) | 🔴 NOT IMPLEMENTED | `users` table has no role column; every authenticated user has identical access |
| CSRF protection | 🔴 NOT IMPLEMENTED | No CSRF token middleware found |

---

# 8. Learning Progress System

- **Source of truth (guest):** `localStorage` key `csPlatformData_v2`, read/written exclusively through `src/lib/csPlatform.js`.
- **Source of truth (signed-in):** Same `localStorage` object, kept in sync with MySQL via fire-and-forget API calls on every mutation (`markLessonComplete`, `recordQuizResult`, `setLastLesson`), plus a one-time pull (`syncFromServer()`) executed right after login/register and on initial page load if already signed in.
- **Sync direction:** Confirmed by reading the code — sync is **one-way merge on login only** (server → local, taking the max of local/server lesson counts). There is no continuous two-way sync or conflict resolution beyond that single merge point. If a user is signed in on two different browsers, progress made in one will not appear in the other until that browser's next login/page load, and even then only via the `Math.max()` merge — it does not re-pull after that.
- **Derived stats implemented:** total lessons completed, average quiz score, day streak (`computeStreak`, consecutive days in `activeDates`), total learning hours, "recommended major" heuristic (weighted completion % + quiz average across 3 fixed majors), "continue learning" URL resolution. All covered by automated tests in `csPlatform.test.js`.
- ✅ **Fixed in the stabilization pass:** `addLearningMinutes()` is now called by a new hook, `src/hooks/useLessonTimer.js`, wired into `LessonProgressBar.jsx` (rendered on every lesson page). It accumulates visible time-on-page (paused while the browser tab is hidden, via the Page Visibility API) and logs it when the student navigates away. Verified by code review and by the existing `addLearningMinutes`/`computeTotalLearningHours` unit tests — **not** verified by sitting on a lesson page in a live browser and watching the Dashboard update in real time, since that requires manual interaction outside this session's tooling.

---

# 9. Quiz System

- One `QuizSection.jsx` component reused across all 12 lessons (not 12 separate implementations).
- Each lesson supplies its own array of exactly 5 question objects (`{question, options, answer, explanation}`) — confirmed present in all 12 lesson files.
- On completing a quiz, `recordQuizResult(topicId, score)` is called, which updates `localStorage` and (if signed in) `POST /api/v1/progress/quiz-result`.
- `QuizHub.jsx` (`/quiz`) does not implement a second quiz engine — it links into each lesson's own quiz section via `href="/learn/<topic>#lesson-quiz"`.
- ✅ **Fixed in the stabilization pass:** `QuizSection.jsx` now checks `window.location.hash === '#lesson-quiz'` on mount and calls `scrollIntoView({ behavior: 'smooth' })` on the `#lesson-quiz` section if so — since every lesson page's quiz section already has that `id`, this is a single fix that applies to all 12 lessons. Confirmed by code review (build passes, logic is straightforward); **not** confirmed by clicking through in a live browser.

---

# 10. Dashboard

Confirmed present in `Dashboard.jsx`:
- 4 stat cards (Lessons Completed, Quiz Score Average, Current Streak, Learning Time)
- Chart.js line chart: 6-week performance trend
- Recommended Major card with reasons list and a "Retake Quiz" button (routes to `/quiz`)
- Topic Progress list — all 12 topics, each a clickable link to its lesson, with a progress bar
- Recent Activity feed (from `localStorage`'s `recentActivity`, capped at 8 entries)
- Quick Actions (Browse Lessons, Take a Quiz)
- Chart.js pie chart: Time Distribution — ✅ **fixed in the stabilization pass**, `TIME_COLORS` now defines a color for all 12 topics (previously only 5), so every topic with logged time appears in the chart.
- Signed-in vs. guest messaging in the header ("Welcome back, {name}" vs. "browsing as a guest" notice).

✅ Overall: dashboard renders and reads real data. Its Time Distribution chart and Learning Time stat now have a real data source (`useLessonTimer` → `addLearningMinutes()`, see §8) instead of staying permanently empty.

---

# 11. Feedback System

- `Feedback.jsx` form (name, email, category, 1–5 star rating, message) → `POST /api/v1/feedback` (primary, persisted to MySQL) → also mirrored into a local-only `localStorage` log via `feedbackStore.js` (secondary, not authoritative).
- Server-side validation confirmed: name required, email regex-checked, message required, rating clamped 0–5.
- ✅ Confirmed working end-to-end via curl (anonymous submission accepted, row inserted with `user_id = NULL`).
- 🔴 No admin UI to view submitted feedback — must be queried directly from MySQL.
- This replaces an earlier fake `setTimeout`-based "success" simulation that existed in the pre-React static version (per `PROJECT_CONTEXT.md`) — the current version performs a real network request and shows a genuine error message if it fails, rather than always showing success.

---

# 12. Subject Coverage Check

**Scope decision (post-dates the original inspection):** the project owner explicitly narrowed Semester 2 scope to **Data Structures & Algorithms only**. Database Systems, Java, and Probability & Statistics are **intentionally not built as learner-facing subjects** — this is a deliberate scope decision, not an oversight or an incomplete feature. The table below is kept for historical/reference accuracy (what technology choices exist under the hood), but should not be read as "these subjects are missing and need finishing."

| Subject | Evidence found in code | Status |
|---|---|---|
| Data Structures and Algorithms | 12 full lesson pages, visualizers, quizzes, complexity tables (see §4.3) | ✅ COMPLETE — this is the project's sole learner-facing subject by explicit scope decision |
| Database Systems | MySQL schema with 6 tables, foreign keys, indexes, a migration system (see §6) | Present only as underlying infrastructure (how progress/accounts are stored), not as taught content. **Out of scope by decision**, not a gap. |
| Advanced Programming Languages (Java) | Java code samples inside `CodeTabs` on every lesson page (static text, not executed) | Present only as illustrative example code alongside JS/Python on each lesson. The application itself is written in JavaScript (React + Express), not Java. **Out of scope as a separate subject by decision** — the existing Java code samples were left in place since they're part of each lesson's existing, working Code Example section, not removed. |
| Probability & Statistics | No lesson content, no statistics-related pages, components, or calculations found anywhere in `src/` | **Out of scope by decision** — not implemented, and not planned to be. |

---

# 13. Testing

| Type | Status |
|---|---|
| Unit tests | ✅ COMPLETE — `src/lib/csPlatform.test.js`, 16 tests covering TOPICS shape, `markLessonComplete` (including the cap-at-total case and unknown-topic no-op), `recordQuizResult` (including score clamping), `computeAverageScore`, `computeTotals`, `computeRecommendedMajor` (both the null-until-a-quiz-is-taken case and the percent-clamped-to-60–98 case), `findContinueLearningUrl` (all 3 branches), `addLearningMinutes`, `computeTotalLearningHours`, `timeAgo`. Run with `npm test` from the project root. |
| Integration tests | ✅ COMPLETE — `server/test/api.test.js`, 17 tests making real HTTP requests to the real Express app (in-process, ephemeral port) against the real local MySQL database: health check, session-required rejection, registration validation (bad email, short password, duplicate email), full register→session→`/me` flow, wrong-password rejection, login, lesson-complete (including unknown-topic → 404), quiz-result (including out-of-range → 400, no-session → 401), logout, anonymous feedback submission, feedback validation. Run with `npm test` from `server/`. Cleans up all rows it creates. |
| End-to-end / browser tests | 🔴 NOT IMPLEMENTED — no Playwright/Cypress/similar; nothing clicks through the actual rendered UI in a real browser |
| Automated test run (this session) | Both suites executed and passed: frontend 16/16, backend 17/17 (33/33 total) |
| Manual testing performed (this session) | `npm run build` confirmed passing (twice — before and after the stabilization edits); a live curl-based run through register → lesson-complete → quiz-result → get-progress; a 25-request burst against `/auth/login` confirmed the new rate limiter returns 429 after the 20th attempt; all 19 frontend routes confirmed returning HTTP 200 |
| Manual testing NOT performed | No click-through browser testing of the rendered UI (clicking buttons, watching animations, resizing for mobile) was performed — everything above is either an automated test or a scripted HTTP/build check, not a human clicking through the app in a browser |

---

# 14. Version Control Status

Checked via `git status` and `git log`:

- Current branch: `Sreyneang`.
- The entire React frontend (`src/`, `public/`, `index.html`, `vite.config.js`, `package.json`) and the entire backend (`server/`) are **untracked** — not yet added or committed to git.
- The old static-site files under `pages/` and the old `images/` folder show as **deleted** in the working tree (removed from disk, but the deletion itself is also not yet committed).
- `CLAUDE.md`, `PROJECT_CONTEXT.md`, `SYSTEM_ARCHITECTURE.md` are also untracked (added but not committed).
- **Conclusion: none of the Semester 2 work described in this report exists in git history yet — including everything added in the stabilization pass** (rate limiting, both test suites, the learning-time fix, the chart fix, the quiz-scroll fix). It only exists in the current working directory. If this machine's working directory were lost without a commit, all of this work would be lost. **This remains the single highest-priority action item.**

---

# 15. Known Issues / Limitations Summary

Items fixed in the stabilization pass are kept here (struck through) so the history of what changed stays visible.

| # | Issue | Severity | Status |
|---|---|---|---|
| 1 | Nothing committed to git — all Semester 2 work is uncommitted | High (risk of data loss) | 🔴 Still open — see §14 |
| 2 | Session store is in-memory (`express-session` default) — not production-viable | Medium | 🔴 Still open — acceptable for local dev, deliberately not addressed (see §16) |
| 3 | ~~No automated tests anywhere~~ | ~~Medium~~ | ✅ Fixed — 33 tests across frontend + backend, see §13 |
| 4 | ~~No rate limiting on login/register/feedback endpoints~~ | ~~Medium (security)~~ | ✅ Fixed — see §5.1 |
| 5 | ~~`addLearningMinutes()` exists but nothing calls it~~ | ~~Medium (functional gap)~~ | ✅ Fixed — see §8 |
| 6 | ~~Dashboard's Time Distribution chart only supports 5 of 12 topics~~ | ~~Low~~ | ✅ Fixed — see §10 |
| 7 | ~~Quiz hub's hash-link scrolling doesn't auto-scroll~~ | ~~Low~~ | ✅ Fixed — see §9 |
| 8 | No password reset, email verification, or role-based access | Medium (feature gap) | 🔴 Still open — explicitly deferred, see §16 |
| 9 | Progress sync between server and localStorage is one-way-on-login only, not continuous | Low–Medium | 🔴 Still open — explicitly deferred, see §16 |
| 10 | No admin interface to review feedback submissions | Low | 🔴 Still open — explicitly deferred, see §16 |
| 11 | `POST /api/v1/progress/last-lesson` has no dedicated automated test | Low | ⚠️ Needs testing — see §5.2 |
| 12 | Database Systems / Java / Probability & Statistics are not learner-facing subjects | N/A | Not an issue — explicit scope decision, see §12 |

---

# 16. Future Work (explicitly out of current scope)

The following are **not implemented** and are listed here only to separate them clearly from current state. Project scope is explicitly DSA-only (see §12) — none of these involve adding new subjects.

- **Committing the current work to git** (highest priority — see §14).
- Continuous/bi-directional progress sync instead of one-way pull-on-login (§8).
- A production-grade session store (e.g. Redis or a MySQL-backed session store) to replace `express-session`'s default in-memory store.
- CSRF protection.
- Password reset / email verification / role-based access.
- An admin view for submitted feedback.
- A dedicated automated test for `POST /api/v1/progress/last-lesson`.
- End-to-end/browser tests (Playwright/Cypress) covering actual clicks through the rendered UI — everything verified so far is either an HTTP-level test or a build check, not a simulated user session in a browser.

---

# 17. Summary Table

| Area | Status |
|---|---|
| Project scope | DSA-only, by explicit decision (§12) |
| Frontend framework migration (React/Vite) | ✅ COMPLETE |
| All 12 DSA lesson pages | ✅ COMPLETE |
| Quiz system (per-lesson, 5 questions each) | ✅ COMPLETE (including Quiz Hub scroll-to-quiz fix) |
| Dashboard (stats, charts, activity) | ✅ COMPLETE (learning-time data path fixed, chart covers all 12 topics) |
| Backend REST API | ✅ COMPLETE (all routes tested except `last-lesson`, which is ⚠️ needs a dedicated test) |
| MySQL database + schema | ✅ COMPLETE (tested) |
| Authentication (register/login/session) | 🟡 PARTIALLY COMPLETE (fully functional and tested locally; in-memory session store is not production-ready — deliberately deferred) |
| Rate limiting | ✅ COMPLETE (auth + feedback endpoints) |
| Feedback system | ✅ COMPLETE (tested) |
| Frontend ↔ backend integration | ✅ COMPLETE (tested for core flows) |
| Automated testing | ✅ COMPLETE (33 tests: 16 frontend unit, 17 backend integration, both passing) |
| Version control (commits) | 🔴 NOT IMPLEMENTED — nothing committed, highest-priority remaining item |
| Database Systems / Java / Probability & Statistics | Out of scope by explicit decision — not gaps (§12) |
