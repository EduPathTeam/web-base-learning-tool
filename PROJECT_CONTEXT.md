# PROJECT_CONTEXT.md

Read this first. It gives a new AI session (or developer) a complete picture of this project in under 5 minutes. See also `CLAUDE.md` (binding rules) and `SYSTEM_ARCHITECTURE.md` (architecture deep-dive).

---

## Project Purpose

**Web-Base-LearningTool** ("DSA PathFinder" per page titles) is a browser-based learning platform for computer science students, teaching data structures and algorithms through interactive lessons, quizzes, and a progress dashboard. Goals: make CS fundamentals accessible and self-paced, reinforce learning via quizzes, track progress to motivate continued use, and recommend a CS major/track based on performance. `README.md` currently has no content beyond the project title.

**Reality check:** this is an early-stage static prototype. Most "platform" features (accounts, persistence across pages, feedback, code testing) are either non-functional UI, stubbed, or empty files. Treat anything below marked "not wired up" as aspirational, not working.

---

## Tech Stack

- HTML5 + CSS3 (plain, no preprocessor/framework)
- Vanilla JavaScript (ES6+), no frontend framework
- Chart.js (via CDN) — used only in `dashboard.js` for the performance line chart and time-distribution pie chart
- Persistence: browser `localStorage` only (via `window.CSPlatform` in `dashboard.js`)
- No backend, no database, no build tooling, no `package.json`, no test framework, no CI/CD

---

## Folder Structure

```
/CLAUDE.md                  binding project rules for AI sessions
/PROJECT_CONTEXT.md         this file
/SYSTEM_ARCHITECTURE.md     architecture deep-dive
/README.md                  title only, no content
/images/                     static marketing assets (icon, mission photos)
/pages/
  home-page/            index.html, script.js, style.css        — landing page
  learn-page/            learn.html/js/css                        — lesson hub
                          array.html/js/css                        — Array lesson (functional visualizer)
                          queue.html/css (no queue.js; reuses array.js) — Queue lesson
                          array.zip                                — stray archive, should be removed
  quiz-page/              quiz.html/js/css                         — Array quiz
                          about-page/ (about.html, script2.js, style2.css) — About page, UNTRACKED, mid-move here
  dashboard-page/         dashboard.html/js/css                    — progress dashboard (CSPlatform lives here)
  sign-in/                sign-in.html/js/css                      — non-functional Login/Register UI
  feedback-page/          feedback.html/js/css — all 3 files EMPTY (0 bytes)
  testCode-Page/          test.html/js/css — actually a feedback form, not code-testing (naming mismatch)
  web-base-learning.zip   stray archive at pages root, should be removed
```

**Known repo-state oddity (as of last check):** the real about-page (`pages/about-page/*`) was deleted in the working tree but not committed; an identical untracked copy now lives at `pages/quiz-page/about-page/`. This move is in-progress/uncommitted — don't assume either location is final without checking `git status`.

---

## Database Architecture

**No real database exists.** The only persistence is browser `localStorage`, under key `csPlatformData_v2`, managed exclusively by `window.CSPlatform` in `pages/dashboard-page/dashboard.js`.

**Schema (the localStorage blob):**
```
{
  completedLessons: { <topicId>: number },       // 0..topic.total (10 per topic)
  quizResults:      { <topicId>: number[] },      // scores 0-100
  weeklyPerformance: number[6],                   // 6 weekly buckets, index 5 = current
  learningTimeMinutes: { <topicId>: number },
  activeDates: string[],                          // ISO yyyy-mm-dd, max 60, newest first
  recentActivity: [{ type, text, link, timestamp }], // max 8, newest first
  lastLesson: { topicId, url } | null,
  recommendedMajor: { name, percent, reasons } | null
}
```
`TOPICS` (6 fixed topics, 10 lessons each = 60 total): `arrays`, `linked-lists`, `stacks-queues`, `trees`, `graphs`, `sorting`.

**Public API (`window.CSPlatform`):** `getData()`, `saveData(data)`, `markLessonComplete(topicId)`, `recordQuizResult(topicId, score)`, `setLastLesson(topicId, url)`, `addLearningMinutes(topicId, minutes)`, `findContinueLearningUrl(data)`.

**Critical gap:** no other page (quiz, learn) actually calls these write methods. Only `dashboard.js` itself reads/writes the blob (to record the active date on load). So in normal usage, taking the quiz or completing a lesson has **zero effect** on the dashboard — the write path is dead code from the UI's perspective. This is the single biggest functional gap in the app.

For proposed *real* database design (once a backend exists), see `SYSTEM_ARCHITECTURE.md` §3.

---

## API Architecture

**None exists.** No server, no endpoints, no fetch/AJAX/XHR calls anywhere in the codebase. Every "submission" is client-side only:
- Sign-in form: `action="#"`, no submit handler at all.
- Feedback form (`testCode-Page/test.js`): fakes a network call with `setTimeout` (~600ms "sending" + 3.2s before resetting), shows a fake success message, sends/stores nothing.
- Quiz: results live only in in-memory JS variables for the current page session.

See `SYSTEM_ARCHITECTURE.md` §2 for the proposed future REST API shape (not built, needs stack decision).

---

## User Roles

**None implemented.** The only "auth" UI is the Login/Register panel toggle in `sign-in.js` — purely cosmetic (`.toggled` class swap), no validation, no session, no user object. The dashboard hardcodes `"Welcome back, Student!"` regardless of any login state. There is no guest/student/admin distinction anywhere in code.

---

## Business Rules

Embedded logic found in the code (all client-side, all currently disconnected from each other per the gap above):

- **Quiz scoring** (`quiz.js`): score = count correct out of 5; result message thresholds — 100% "Excellent!", ≥80% "Great Job!", ≥60% "Good Work!", ≥40% "Keep Practicing!", else "Try Again!". Each question locks after answering (no re-answering).
- **Streak calculation** (`dashboard.js`): consecutive days present in `activeDates`, counted backwards from today.
- **Learning hours:** `round((totalMinutes/60) * 10) / 10`.
- **Recommended major** (`dashboard.js`): requires at least one quiz result anywhere, else `null` ("Not yet available"). Scored across 3 hardcoded majors (Data Science, Software Engineering, Artificial Intelligence), each weighted to 3 of the 6 topics: `score = completedPct*0.5 + avgQuizScore*0.5` per topic, averaged, highest wins. **Displayed percent is clamped to [60, 98]** regardless of the true computed score — cosmetic, not the real number.
- **Dashboard pie chart** intentionally excludes the `stacks-queues` topic (explicit design comment in code).

---

## Known Issues

High-value list for anyone picking up this repo (see the audit for full detail):

1. **Dashboard is disconnected from the rest of the app** — quiz/learn pages never call `CSPlatform`'s write methods, so real usage never updates dashboard stats.
2. **`learn.js` has dead code** (lines ~122–149): stray `button.addEventListener(...)` blocks reference an undefined global `button`, throwing `ReferenceError` on every page that loads `learn.js` (including `dashboard.html` and `quiz.html`, which load it despite not needing it).
3. **Broken navigation targets** referenced but nonexistent: `../about-page/about.html` (now-moved folder, 404s from every page's nav), `../array-page/index.html` (quiz hint/back links), `stack.html`/`linkedlist.html`/`graph.html` (learn-page bottom nav), `career-quiz.html`/`visualizer.html`/`major.html` (dashboard quick actions), `lessons/array.html`/`quizzes/array-quiz.html` (paths hardcoded in `dashboard.js`'s `TOPICS` config that don't match the real `pages/learn-page/`/`pages/quiz-page/` structure).
4. **`feedback-page/` is entirely empty** (all 3 files 0 bytes) — the real feedback implementation lives in `testCode-Page/test.js` instead, which is a naming/location mismatch.
5. **`testCode-Page` doesn't test code** — despite the name and the About page's "Test your solution" pitch, it's a feedback form with a fake `setTimeout` submit (explicitly flagged in `CLAUDE.md` as an anti-pattern already in the repo — don't replicate it elsewhere).
6. **Sign-in is 100% non-functional** — no submit handler, no validation, no backend.
7. **Duplicated nav-pill animation logic** copy-pasted with slight variations across `home-page/script.js`, `learn-page/learn.js`, `learn-page/array.js`, and `quiz-page/about-page/script2.js` — DRY violation, candidate for extraction into one shared module.
8. **Invalid/stray markup:** `queue.html` nests `<thead>` inside `<tbody>`; `test.html` has a stray unmatched `</script>` tag and a floating back-link above the footer scripts.
9. **Stray files checked into (or living in) the repo:** `pages/web-base-learning.zip`, `pages/learn-page/array.zip` — should likely be removed/gitignored.
10. **Uncommitted about-page move in progress:** `pages/about-page/*` deleted in working tree, untracked duplicate now at `pages/quiz-page/about-page/*` — resolve/commit deliberately, don't assume either location is final.
11. **Orphaned asset:** `images/mission.jpg` is never referenced by any HTML file.
12. **Accessibility gap:** sign-in form labels have empty `for=""` attributes, not properly associated with their inputs.

---

## Development Workflow

- Branching: work happens on a personal/feature branch (current repo history shows branch `Sreyneang` merged via PR into `main`), one feature per branch/PR (Home Page, Lesson Page, Sign-in, Queue Page, Quiz Page, Dashboard — each was its own PR).
- Commit style: short, imperative, capitalized subject lines matching existing history.
- No package manager, no build step — edit HTML/CSS/JS directly and open in a browser or serve via a static file server (e.g., VS Code Live Server) to test.
- No automated tests exist; verification is manual, in-browser.
- Full rules (naming conventions, DRY/SOLID expectations, security baseline, PR requirements) are defined in `CLAUDE.md` — follow those for any new work.

---

## Deployment Process

**None configured.** No CI/CD, no `Dockerfile`, no hosting config (`vercel.json`, `netlify.toml`, GitHub Actions workflows) exist in the repo. Given the current all-static stack, the natural path (not yet set up) is deploying `/pages/**` and `/images/**` directly to a static host (GitHub Pages, Netlify, or Vercel) with no server process required. If a backend/database is ever added, deployment architecture would need to change substantially — see `SYSTEM_ARCHITECTURE.md` §7 before making that decision.

---

## Where to Look Next

- Binding coding/architecture rules → `CLAUDE.md`
- Architecture layer-by-layer (frontend/backend/DB/auth/uploads/notifications/deployment, current vs. proposed) → `SYSTEM_ARCHITECTURE.md`
- To fix the biggest functional gap (dashboard disconnection), start with wiring `quiz.js` to call `CSPlatform.recordQuizResult('arrays', score)` and `array.js`/`learn.js` to call `CSPlatform.markLessonComplete(...)`/`setLastLesson(...)` — confirm approach with the user first per `CLAUDE.md`'s "explain major changes before implementation" rule.
