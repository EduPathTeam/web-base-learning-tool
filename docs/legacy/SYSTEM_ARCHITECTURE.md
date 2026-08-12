# SYSTEM_ARCHITECTURE.md

Architecture reference for Web-Base-LearningTool. Reflects the **actual current codebase** — this project is a static frontend prototype with no backend, database, auth server, file storage, or notification system implemented yet. Sections for those layers describe what exists today (usually "nothing") and the proposed shape for when they're built, clearly separated so this doc is never mistaken for a description of infrastructure that doesn't exist.

---

## 1. Frontend Architecture

**Type:** Static multi-page site. Plain HTML/CSS/vanilla JS. No framework (no React/Vue/Angular), no bundler, no build step, no `package.json`.

**Structure:** one folder per page under `/pages/`, each with its own `.html`, `.js`, `.css` sharing a base name:

```
pages/
  home-page/         index.html, script.js, style.css
  learn-page/        learn.html, learn.js, learn.css  + topic pages (array.html/js/css, queue.html/css)
  quiz-page/         quiz.html, quiz.js, quiz.css
  quiz-page/about-page/  about.html, script2.js, style2.css   (nested under quiz-page — pre-existing structural quirk)
  dashboard-page/    dashboard.html, dashboard.js, dashboard.css
  sign-in/           sign-in.html, sign-in.js, sign-in.css
  feedback-page/     feedback.html, feedback.js, feedback.css
  testCode-Page/     test.html, test.js, test.css
images/              static assets (icons, photos)
```

**Rendering model:** each page is loaded and rendered independently by the browser — full page navigation (`<a href="...">`) between pages, no client-side router, no SPA behavior, no shared layout/template system. Any "shared" look (nav bar, header) is duplicated per-page HTML, not componentized.

**State management:** no framework state. Per-page JS manages its own local variables (e.g., quiz score/current question index in `quiz.js`). The one cross-page state mechanism is `window.CSPlatform` in `dashboard.js`, which wraps `localStorage` as a pseudo-shared-state API (see Database Design below) — but only `dashboard.js` itself currently reads/writes it; other pages that logically should call it (quiz, learn) do not yet call it, so state is **not actually synchronized across pages today** despite the API existing.

**Module boundaries:** each page's `.js` file is scoped to that page's DOM only. There is no import/export system (no ES modules, no bundler) — scripts are loaded via `<script src="...">` tags and rely on global scope / `window` for any cross-file access.

---

## 2. Backend Architecture

**Current state: none exists.** There is no server process, no API server, no server-side language runtime (Node/Python/PHP/etc.), no `server.js`/`app.js`/`main.py` entry point anywhere in the repo. Pages are meant to be opened directly in a browser or served by a plain static file server (e.g., VS Code Live Server) — nothing executes server-side logic.

**Implication:** every "backend-shaped" feature visible in the UI (sign-in, feedback submission, quiz result recording) is currently a client-side illusion:

- Sign-in form (`sign-in.html`) posts to `action="#"` — no request is ever sent.
- Feedback submission (in `testCode-Page/test.js`) fakes a network call with `setTimeout` and then shows a fake success message — no data leaves the browser.
- Quiz results (`quiz.js`) are held in local JS variables during the session only; nothing is persisted or sent anywhere.

**Proposed backend (not built — for future reference only):** a REST API (`/api/v1/...`) using JSON over HTTP, one server process, with route groups mirroring the current pages' data needs: `/api/auth`, `/api/quiz-results`, `/api/lessons/progress`, `/api/feedback`. Stack choice (Node/Express vs. Python/Flask vs. other) is undecided and should be confirmed with the user before any backend code is written — do not assume a stack.

---

## 3. Database Design

**Current state: no real database.** The only persistence layer that exists is browser `localStorage`, wrapped by the `CSPlatform` module in `pages/dashboard-page/dashboard.js`. This is **not a database** — it's per-browser, per-device, client-only storage with no server backup, no multi-user support, and no query capability beyond reading the one JSON blob back out.

**Current localStorage schema (as implemented in `dashboard.js`):**

- Single storage key (`CSPlatform.STORAGE_KEY`) holding one JSON object as the "single source of truth" for the dashboard.
- Public API surface exposed as `window.CSPlatform`: `markLessonComplete(...)`, `recordQuizResult(topicId, score)`, `setLastLesson(...)`, `addLearningMinutes(...)`, plus internal `getData()`/`saveData()` helpers that read/write the whole blob at once.
- All values are zero/empty by default (a prior version seeded fake demo data; that was removed) — meaning any progress shown depends entirely on the current browser's local storage, and is lost on cache clear or on a different device/browser.
- **Not wired up:** `quiz.js` and the learn pages do not currently call these `CSPlatform` methods, so in practice the dashboard's storage stays empty even after using the quiz/lessons — this is a known gap, not by design.

**Proposed database (not built — for future reference only):** a relational schema once a backend exists, roughly:

- `users` (id, email, password_hash, created_at)
- `lessons` (id, topic_key, title)
- `lesson_progress` (id, user_id → users, lesson_id → lessons, completed_at)
- `quiz_results` (id, user_id → users, topic_id, score, taken_at)
- `feedback` (id, user_id → users nullable, rating, message, created_at)

snake_case naming, foreign keys named `<table_singular>_id`, `created_at`/`updated_at` timestamps on every table, indexes on all foreign keys — matching the conventions already defined in `CLAUDE.md`'s Database Rules section. This schema is a proposal only; confirm with the user before implementing.

---

## 4. Authentication Flow

**Current state: does not exist.** `pages/sign-in/sign-in.js` only handles UI panel-flipping between the "Login" and "Register" card faces (a CSS class toggle) — there is no form submit handler, no password hashing, no session, no token, no cookie, and no server to validate credentials against. Typing anything into the sign-in form and clicking submit currently does nothing (form `action="#"`).

**Proposed flow (not built — for future reference only):**

1. User submits email/password on `sign-in.html`.
2. Client-side validates required fields, then POSTs to `/api/auth/login` (or `/register`).
3. Server verifies credentials (bcrypt-compared password hash), issues a session cookie or JWT.
4. Subsequent requests from dashboard/quiz/etc. include the session token; server middleware verifies it and attaches the authenticated user before allowing access to user-scoped data (quiz results, progress).
5. Logout clears the session/token client- and server-side.

No authorization model (roles/permissions) currently exists in code — see User Roles note below for what's implied vs. real.

---

## 5. File Upload Flow

**Current state: does not exist.** No file input, upload endpoint, or storage integration was found anywhere in the codebase — no `<input type="file">`, no multipart form handling, no image/avatar upload feature. The `images/` folder contains only static, developer-provided assets (icons, marketing photos) checked into the repo — not user-uploaded content.

**Proposed flow (if a future feature requires uploads, e.g. profile pictures):** client selects file → multipart POST to an `/api/uploads` endpoint → server validates file type/size → stores in object storage (e.g., S3-compatible bucket) or a server-managed directory → returns a URL saved on the relevant DB record. Not designed in detail since no requirement for this exists yet — clarify the actual need with the user before building it.

---

## 6. Notification Flow

**Current state: does not exist.** No email sending, push notification, or in-app notification/toast system was found. The feedback form's "success" message (`testCode-Page/test.js`) is a hardcoded UI state shown after a fake `setTimeout` delay — it does not represent a real notification being sent to anyone (not an email to admins, not a stored record).

**Proposed flow (not built — for future reference only):** once a backend exists, likely candidates are (a) transactional email (e.g., feedback received → email to admin; quiz milestone → email to user) via a provider like SMTP/SendGrid, and (b) in-app toast notifications driven by real API responses instead of `setTimeout`. No provider or requirement has been chosen — this needs a decision from the user first.

---

## 7. Deployment Architecture

**Current state:** no deployment configuration exists in the repo — no CI/CD config, no `Dockerfile`, no hosting config (e.g., `vercel.json`, `netlify.toml`), no `.github/workflows/`. The project is currently run by opening HTML files directly or serving `/pages/**` via any static file server locally.

**Given the current stack (pure static site), the natural deployment path is:**

- Host as a static site (GitHub Pages, Netlify, or Vercel) — no server process required for the current feature set.
- Git workflow: feature/personal branches → PR → merge into `main` (per `CLAUDE.md`'s Git Workflow section); deployment would then be triggered from `main` (e.g., auto-deploy on push, or manual publish depending on host).

**If/when a backend + database are added,** deployment architecture must change to include: an application server host (e.g., a Node/Python runtime on a PaaS), a managed database instance, environment-variable-based secret management, and a reverse proxy/CDN in front of the static assets. None of this exists today — treat any such setup as a new architectural decision requiring the user's sign-off, not an assumed default.

---

## Summary

This codebase today is **frontend-only**: static HTML/CSS/JS pages with one client-side pseudo-persistence module (`CSPlatform` over `localStorage`) that isn't even fully wired to the rest of the app yet. Every section above beyond "Frontend Architecture" describes either a genuine gap (auth, uploads, notifications, real DB, deployment pipeline) or a proposal that requires explicit confirmation before implementation — nothing in sections 2–7 should be treated as already built.
