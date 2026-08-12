# CLAUDE.md

This file provides permanent, binding instructions for Claude Code when working in this repository. These rules apply to every session and override default assumptions unless the user explicitly says otherwise.

---

# Project Overview

**Web-Base-LearningTool** is a browser-based learning platform for computer science students, focused on teaching data structures and algorithms (arrays, queues, etc.) through interactive lessons, quizzes, and progress tracking.

**Business goals:**

- Provide an accessible, self-paced way for students to learn core CS concepts.
- Reinforce learning through quizzes and a code-testing area.
- Track individual learning progress (lessons completed, quiz scores, streaks) to motivate continued use.
- Collect user feedback to guide future content and feature decisions.

**Current state:** The project is a static frontend prototype (HTML/CSS/vanilla JS) with pages for home, learn, quiz, dashboard, sign-in, feedback, and about/test-code. There is **no backend, no database, and no real authentication yet** — the dashboard currently simulates persistence using `localStorage`, and forms (sign-in, feedback) do not submit to any server. Treat any "backend" work as greenfield unless code proves otherwise.

---

# Tech Stack

**Current (implemented):**

- HTML5, CSS3 (plain, no preprocessor, no framework like Tailwind/Bootstrap currently in use)
- Vanilla JavaScript (ES6+), no frontend framework (no React/Vue/Angular)
- Client-side persistence only: `localStorage` (via the `CSPlatform` module in `dashboard.js`)
- No build tooling, no bundler, no package manager currently configured (no `package.json`)

**Not yet present — do not assume these exist:**

- No server runtime (Node/Express, Python/Flask/Django, PHP, etc.)
- No database (SQL or NoSQL)
- No ORM, no migrations
- No test framework
- No CI/CD pipeline

If a task requires backend/database capability, propose a stack choice to the user before introducing new dependencies — do not silently pick one.

---

# Architecture Rules

**Folder structure (current):**

```
/pages/
  home-page/        index.html, script.js, style.css
  learn-page/        learn.html + per-topic pages (array.html, queue.html, ...)
  quiz-page/         quiz.html, quiz.js, quiz.css
  quiz-page/about-page/  about.html, script2.js, style2.css
  dashboard-page/    dashboard.html, dashboard.js, dashboard.css
  sign-in/           sign-in.html, sign-in.js, sign-in.css
  feedback-page/     feedback.html, feedback.js, feedback.css
  testCode-Page/     test.html, test.js, test.css
/images/            static assets (icons, photos)
README.md
```

**Rules:**

- Each page lives in its own folder under `/pages/` with matching `.html`, `.js`, `.css` files sharing the page's base name (e.g., `quiz.html` + `quiz.js` + `quiz.css`).
- Keep folder naming consistent: lowercase, hyphenated, suffixed with `-page` (existing exception: `testCode-Page` uses different casing — do not propagate this inconsistency to new folders; use `test-code-page` style for anything new).
- Do not nest a page's folder inside another unrelated page's folder (e.g., `about-page` currently lives inside `quiz-page/`, which is a pre-existing structural inconsistency — flag it if touched, but do not silently "fix" it without asking).
- Shared/reusable logic (e.g., the `CSPlatform` progress-tracking API in `dashboard.js`) should live in one place and be imported/referenced by other pages, not copy-pasted.
- **Component organization:** since there is no component framework, treat each `.js` file as a module scoped to one page. Do not let one page's script reach into another page's DOM or globals except through an explicit shared API (like `window.CSPlatform`).
- **API patterns (once a backend exists):** use RESTful routes (`/api/<resource>`), plural resource names, standard HTTP verbs (GET/POST/PUT/PATCH/DELETE), and JSON request/response bodies. Version the API (`/api/v1/...`) if breaking changes are anticipated.
- **Database patterns (once a database exists):** define schema/models before writing queries; do not write raw ad-hoc queries scattered across route handlers — centralize data access.
- **Coding standards:** consistent 2-space indentation, camelCase for JS variables/functions, kebab-case for file and folder names, SCREAMING_SNAKE_CASE for constants.

---

# UI/UX Rules

- **Design philosophy:** clean, student-friendly, low-distraction. Prioritize clarity of learning content over decorative flourishes.
- **Visual style:** consistent card-based layouts for lessons/quizzes, consistent header/nav across pages.
- **Color rules:** reuse the existing color palette found in each page's CSS rather than introducing new arbitrary colors. If a new color is needed, define it as a CSS variable at the top of the relevant stylesheet (or a shared variables block) rather than hardcoding hex values inline.
- **Typography:** keep font choices consistent across pages; do not mix multiple font families without reason. Maintain a clear heading hierarchy (h1 > h2 > h3).
- **Spacing:** use consistent, predictable spacing (prefer a scale like 4/8/16/24/32px) rather than arbitrary pixel values.
- **Responsiveness:** all pages must remain usable on mobile widths (~375px) and up. Use relative units (%, rem, flex/grid) over fixed pixel widths where practical. Test/consider layout at mobile, tablet, and desktop breakpoints.
- **Accessibility:** use semantic HTML (`<button>`, `<nav>`, `<main>`, `<label>` etc.), always provide `alt` text for images, ensure sufficient color contrast, ensure forms have associated labels, and ensure interactive elements are keyboard-navigable.
- **Animations:** keep animations subtle and purposeful (e.g., panel transitions, count-up stats). Avoid animations that block interaction or run longer than ~300–400ms for UI feedback.
- **Component consistency:** buttons, cards, form inputs, and nav bars should look and behave the same way across all pages. Before styling a new component, check whether a similar one already exists elsewhere in the project and reuse its class/style pattern.

---

# Coding Standards

- **Clean code:** small, single-purpose functions; descriptive names; no dead code or commented-out blocks left in place.
- **DRY:** do not duplicate logic across pages (e.g., duplicate quiz-scoring logic or duplicate localStorage-access code). Extract shared logic into a single reusable module/function.
- **SOLID (applied pragmatically to JS/future backend code):** single-responsibility functions/modules; prefer composition over deep inheritance; keep modules open to extension without needing to rewrite existing working code; depend on clear interfaces (e.g., the `CSPlatform` API) rather than reaching into internal implementation details of another module.
- **Error handling:** never fail silently. User-facing actions (form submits, quiz submission, future API calls) must handle failure states and show the user clear feedback — no empty `catch` blocks, no swallowed promise rejections.
- **Type safety:** since this is plain JS, be disciplined about expected shapes of data (validate function inputs, avoid implicit type coercion bugs). If the project later adopts TypeScript or JSDoc typing, follow that consistently once introduced — don't mix typed and untyped code without reason.
- **Documentation requirements:** every new module/file should have a short header comment describing its purpose and public API (`dashboard.js`'s existing header comment is a good model). Inline comments should explain _why_, not _what_.
- **Security requirements:** never trust client-side-only validation for anything security-sensitive; never hardcode secrets/API keys in frontend code; sanitize any user-generated content before rendering it into the DOM (avoid `innerHTML` with unsanitized input to prevent XSS).

---

# Database Rules

_(Applies once a database is introduced — none exists today.)_

- **Schema conventions:** snake_case table and column names; every table has a primary key `id`; every table has `created_at`/`updated_at` timestamps unless there's a specific reason not to.
- **Relationships:** use explicit foreign keys with clear naming (`user_id`, `quiz_id`, `lesson_id`); define cascade behavior deliberately (don't default to `CASCADE DELETE` without confirming it's safe).
- **Naming standards:** table names plural (`users`, `quiz_results`), column names singular and descriptive (`score`, `completed_at`).
- **Indexing strategy:** index foreign keys and any column used in frequent `WHERE`/`JOIN`/`ORDER BY` clauses (e.g., `user_id` on `quiz_results`).
- **Migration rules:** all schema changes go through migration files, never manual/ad-hoc schema edits. Migrations must be reversible (include a down/rollback step) where the tooling supports it. Never edit a migration that has already been applied/shared — write a new one.

---

# Git Workflow

- **Branch naming:** `<type>/<short-description>` (e.g., `feature/quiz-persistence`, `fix/signin-form-validation`, `chore/cleanup-about-page`). Match the existing pattern seen in this repo of working on a personal/feature branch and merging via PR into `main`.
- **Commit message format:** short, imperative summary (e.g., "Add quiz result persistence", "Fix sign-in form validation"); follow the existing repo convention of concise, capitalized subject lines. Avoid vague messages like "update" or "fix stuff."
- **Pull request requirements:** PRs should describe what changed and why, note any manual testing performed, and flag any known incomplete/stubbed pieces. Do not merge PRs that silently remove functionality without calling it out.
- **Deployment workflow:** since this is currently a static site, deployment (if/when set up) should be via a static host (e.g., GitHub Pages, Netlify, Vercel) unless a backend is added, in which case deployment strategy must be discussed and agreed with the user before implementation.

---

# Performance Requirements

- **Targets:** pages should load and become interactive quickly on a typical connection — avoid large unoptimized images (compress assets in `/images/`) and avoid blocking scripts in `<head>` where avoidable.
- **Lazy loading:** defer/lazy-load non-critical images and below-the-fold content where practical (`loading="lazy"` on `<img>` tags).
- **Code splitting:** keep each page's JS scoped to that page only — do not load unrelated pages' scripts globally. If a shared module grows large, keep it isolated so pages only load what they need.
- **Caching:** static assets (images, CSS, JS) should be cacheable; avoid cache-busting churn from unnecessary file renames.
- **Optimization requirements:** avoid unnecessary DOM reflows/repaints (batch DOM updates), avoid redundant `localStorage` reads/writes (batch via the existing `getData()`/`saveData()` pattern in `dashboard.js` rather than reading/writing per field).

---

# Security Requirements

- **Authentication:** the current sign-in form is non-functional (no real auth). Do not claim a feature is "secure" or "authenticated" until a real auth mechanism (server-verified sessions or tokens, hashed passwords) is implemented. Never store passwords in plain text or in `localStorage`.
- **Authorization:** once accounts exist, every data-modifying action must verify the requesting user owns/may access the resource — do not trust a client-supplied user ID alone.
- **Validation:** validate all user input both client-side (for UX) and server-side (for security) once a backend exists. Never rely on client-side validation alone.
- **Sanitization:** sanitize/escape any user-supplied content before rendering (prevent XSS) and before using in any future database query (prevent injection — use parameterized queries/prepared statements, never string-concatenated SQL).
- **Rate limiting:** any future public-facing endpoint (login, feedback submission, quiz submission) should be rate-limited to prevent abuse/brute force.
- **Secret management:** API keys, DB credentials, and other secrets must never be committed to the repo. Use environment variables and a `.env` file excluded via `.gitignore`; never hardcode secrets in frontend JS (frontend code is always publicly visible).
- **Data protection:** treat any future user data (emails, progress, feedback) as sensitive; avoid over-collecting data; ensure any stored personal data has a clear purpose.

---

# Testing Requirements

- **Unit testing:** once a test framework is introduced, core logic (quiz scoring, progress calculations, any future API handlers) must have unit tests covering normal and edge cases.
- **Integration testing:** once a backend/database exists, critical flows (sign-up/login, quiz submission → persistence, feedback submission) must have integration tests verifying the full request/response/data path.
- **Validation procedures:** for frontend-only changes (current state of the project), manually verify the change in-browser across at least one mobile and one desktop viewport before considering it done, and check the browser console for errors/warnings.

---

# Development Rules

Claude must:

- **Analyze before coding** — read relevant existing files and understand current patterns before writing new code.
- **Explain major changes before implementation** — for anything beyond a small fix (new pages, new architecture, new dependencies, schema changes), briefly explain the approach and get confirmation before writing code.
- **Avoid generating placeholder code** — no stub functions, no `TODO: implement later`, no fake `setTimeout`-simulated behavior presented as if it were real (the existing feedback-form fake-submit pattern is a known anti-pattern in this repo — do not replicate it in new code).
- **Avoid duplicate code** — check whether similar logic already exists (e.g., in `dashboard.js`'s `CSPlatform`) before writing new logic that does the same thing.
- **Reuse existing components/patterns** — match existing HTML/CSS structure and naming conventions rather than introducing a new pattern for the same kind of UI element.
- **Check project structure before creating files** — confirm the correct folder/naming convention exists or is intentional before adding new files.
- **Prefer modifying existing files over creating new ones** — only create a new file when the functionality is genuinely new and doesn't belong in an existing module.

---

# Response Style

Claude should:

- **Be concise** — avoid unnecessary preamble or repetition.
- **Explain reasoning when necessary** — especially for architectural decisions, security-relevant choices, or when deviating from an existing pattern in the repo.
- **Ask questions when requirements are ambiguous** — especially around backend/database stack choices, since none currently exists in this project.
- **Suggest improvements if a better solution exists** — but present it as a suggestion, not an unrequested rewrite; do not implement it without confirmation.
