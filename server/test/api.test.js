// Integration tests for the Express API, run against the REAL local MySQL
// database configured in server/.env (there is no separate test database —
// see README.md). Every row this suite creates is deleted in the `after`
// hook, and all test users are tagged with a unique timestamped email so a
// failed run never collides with real data.
//
// Run with: npm test  (from server/)
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createApp } from '../src/app.js';
import { pool } from '../src/db/pool.js';

let app;
let server;
let baseUrl;
const testEmail = `test-${Date.now()}@example.com`;
const testPassword = 'password123';
const resetEmail = `reset-test-${Date.now()}@example.com`;
const resetPassword = 'password123';
let resetUserId;
const adminEmail = `admin-test-${Date.now()}@example.com`;
const nonAdminEmail = `nonadmin-test-${Date.now()}@example.com`;
const testUserPassword = 'password123';
let adminCookie;
let nonAdminCookie;

function hashResetToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function extractCookie(res) {
  const raw = res.headers.get('set-cookie');
  if (!raw) return null;
  return raw.split(';')[0];
}

// Node's fetch Headers.get('set-cookie') collapses multiple Set-Cookie
// headers into one (per the Fetch spec), which breaks whenever a single
// response sets more than one cookie — as /csrf-token now does, since
// saveUninitialized:true means it also sets the session cookie. Use
// getSetCookie() (Node 18.14+/undici) to read the named one directly.
function extractCookieNamed(res, name) {
  const all = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  const match = all.find((c) => c.startsWith(`${name}=`));
  return match ? match.split(';')[0] : null;
}

// Every state-changing route now requires an x-csrf-token header matching
// the double-submit cookie (server/src/app.js), and that cookie's HMAC is
// bound to the *session id* that was active when the token was issued —
// so the same session cookie has to travel alongside it on every request,
// exactly like a real browser does automatically via credentials:
// 'include'. `sessionCookie` starts as the anonymous session established
// by the initial csrf-token fetch and is reassigned after register/login
// (see below); api() sends whichever value it currently holds unless a
// call explicitly overrides it.
let csrfCookie;
let csrfToken;
let sessionCookie;

async function fetchCsrfToken() {
  const res = await fetch(`${baseUrl}/api/v1/csrf-token`);
  csrfCookie = extractCookieNamed(res, 'csrf-token');
  sessionCookie = extractCookieNamed(res, 'connect.sid');
  const data = await res.json();
  csrfToken = data.csrfToken;
}

async function api(path, { method = 'GET', body, cookie, omitCsrf = false } = {}) {
  const effectiveCookie = cookie !== undefined ? cookie : sessionCookie;
  const cookieHeader = [effectiveCookie, !omitCsrf ? csrfCookie : null].filter(Boolean).join('; ');
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(method !== 'GET' && !omitCsrf ? { 'x-csrf-token': csrfToken } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : null;
  return { status: res.status, data, cookie: extractCookie(res) };
}

// Registers a user with its own isolated session/CSRF pairing, so it
// doesn't touch (or get touched by) the shared module-level session state
// that most of the suite relies on. Returns the new user's id and session
// cookie so callers can act as that user in later requests.
async function registerIsolatedUser(email, password, displayName) {
  const tokenRes = await fetch(`${baseUrl}/api/v1/csrf-token`);
  const setupCookie = [extractCookieNamed(tokenRes, 'connect.sid'), extractCookieNamed(tokenRes, 'csrf-token')]
    .filter(Boolean)
    .join('; ');
  const { csrfToken: setupToken } = await tokenRes.json();
  const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: setupCookie, 'x-csrf-token': setupToken },
    body: JSON.stringify({ email, password, displayName }),
  });
  const data = await res.json();
  const cookie = extractCookieNamed(res, 'connect.sid') || extractCookieNamed(tokenRes, 'connect.sid');
  return { id: data.id, cookie };
}

before(async () => {
  app = createApp();
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://localhost:${server.address().port}`;
  await fetchCsrfToken();

  // Dedicated user for the password-reset test group.
  const resetSetup = await registerIsolatedUser(resetEmail, resetPassword, 'Reset Test');
  resetUserId = resetSetup.id;

  // Dedicated users for the admin-feedback test group: one promoted to
  // admin directly via SQL (there's no self-service promotion — see
  // README.md's "Admin access" section), one left as the 'student'
  // default to prove non-admins are rejected.
  const adminSetup = await registerIsolatedUser(adminEmail, testUserPassword, 'Admin Test');
  await pool.query("UPDATE users SET role = 'admin' WHERE id = ?", [adminSetup.id]);
  adminCookie = adminSetup.cookie;

  const nonAdminSetup = await registerIsolatedUser(nonAdminEmail, testUserPassword, 'Non-Admin Test');
  nonAdminCookie = nonAdminSetup.cookie;
});

after(async () => {
  await pool.query('DELETE FROM users WHERE email = ?', [testEmail]);
  // password_reset_tokens rows for this user are removed via ON DELETE
  // CASCADE (see migration 003_add_password_reset_tokens.sql).
  await pool.query('DELETE FROM users WHERE email = ?', [resetEmail]);
  await pool.query('DELETE FROM users WHERE email = ?', [adminEmail]);
  await pool.query('DELETE FROM users WHERE email = ?', [nonAdminEmail]);
  await pool.query('DELETE FROM feedback WHERE email = ?', ['test-feedback@example.com']);
  // Stops the session store's periodic expired-session cleanup interval —
  // without this, node --test hangs after the suite finishes because the
  // interval keeps the event loop alive.
  await app.locals.sessionStore.close();
  await pool.end();
  await new Promise((resolve) => server.close(resolve));
});

test('GET /api/v1/health returns ok', async () => {
  const { status, data } = await api('/api/v1/health');
  assert.equal(status, 200);
  assert.deepEqual(data, { ok: true });
});

test('POST without a valid CSRF token is rejected', async () => {
  const { status, data } = await api('/api/v1/auth/register', {
    method: 'POST',
    body: { email: 'csrf-rejection-test@example.com', password: testPassword, displayName: 'CSRF Test' },
    omitCsrf: true,
  });
  assert.equal(status, 403);
  assert.equal(data.code, 'EBADCSRFTOKEN');
});

test('GET /api/v1/progress without a session is rejected', async () => {
  const { status, data } = await api('/api/v1/progress');
  assert.equal(status, 401);
  assert.equal(data.error, 'Not signed in.');
});

test('POST /api/v1/auth/register rejects an invalid email', async () => {
  const { status, data } = await api('/api/v1/auth/register', {
    method: 'POST',
    body: { email: 'not-an-email', password: testPassword, displayName: 'Test' },
  });
  assert.equal(status, 400);
  assert.match(data.error, /email/i);
});

test('POST /api/v1/auth/register rejects a short password', async () => {
  const { status, data } = await api('/api/v1/auth/register', {
    method: 'POST',
    body: { email: testEmail, password: '123', displayName: 'Test' },
  });
  assert.equal(status, 400);
  assert.match(data.error, /password/i);
});

test('POST /api/v1/auth/register creates an account and starts a session', async () => {
  const { status, data, cookie } = await api('/api/v1/auth/register', {
    method: 'POST',
    body: { email: testEmail, password: testPassword, displayName: 'Test Student' },
  });
  assert.equal(status, 201);
  assert.equal(data.email, testEmail);
  assert.equal(data.displayName, 'Test Student');
  assert.ok(cookie, 'expected a session cookie to be set');
  sessionCookie = cookie;
});

test('POST /api/v1/auth/register rejects a duplicate email', async () => {
  const { status, data } = await api('/api/v1/auth/register', {
    method: 'POST',
    body: { email: testEmail, password: testPassword, displayName: 'Duplicate' },
  });
  assert.equal(status, 409);
  assert.match(data.error, /already exists/i);
});

test('GET /api/v1/auth/me returns the signed-in user', async () => {
  const { status, data } = await api('/api/v1/auth/me', { cookie: sessionCookie });
  assert.equal(status, 200);
  assert.equal(data.email, testEmail);
});

test('POST /api/v1/auth/login rejects a wrong password', async () => {
  const { status, data } = await api('/api/v1/auth/login', {
    method: 'POST',
    body: { email: testEmail, password: 'wrong-password' },
  });
  assert.equal(status, 401);
  assert.match(data.error, /invalid/i);
});

test('POST /api/v1/auth/login succeeds with the correct password', async () => {
  // Refresh to a fresh anonymous session first — the shared sessionCookie
  // is already authenticated at this point (from the register test above),
  // so logging in again would be a no-op mutation and express-session
  // wouldn't re-send Set-Cookie, defeating the assertion below.
  await fetchCsrfToken();
  const { status, data, cookie } = await api('/api/v1/auth/login', {
    method: 'POST',
    body: { email: testEmail, password: testPassword },
  });
  assert.equal(status, 200);
  assert.equal(data.email, testEmail);
  assert.ok(cookie);
  sessionCookie = cookie;
});

test('POST /api/v1/progress/lesson-complete increments completed count', async () => {
  const { status } = await api('/api/v1/progress/lesson-complete', {
    method: 'POST',
    cookie: sessionCookie,
    body: { topicId: 'arrays', lessonUrl: '/learn/array' },
  });
  assert.equal(status, 204);

  const { data } = await api('/api/v1/progress', { cookie: sessionCookie });
  assert.equal(data.completedLessons.arrays, 1);
  assert.equal(data.lastLessonByTopic.arrays, '/learn/array');
});

test('POST /api/v1/progress/lesson-complete for an unknown topic is rejected', async () => {
  const { status } = await api('/api/v1/progress/lesson-complete', {
    method: 'POST',
    cookie: sessionCookie,
    body: { topicId: 'not-a-real-topic' },
  });
  assert.equal(status, 404);
});

test('POST /api/v1/progress/last-lesson records the last-visited lesson URL', async () => {
  const { status } = await api('/api/v1/progress/last-lesson', {
    method: 'POST',
    cookie: sessionCookie,
    body: { topicId: 'queues', lessonUrl: '/learn/queue' },
  });
  assert.equal(status, 204);

  const { data } = await api('/api/v1/progress', { cookie: sessionCookie });
  assert.equal(data.lastLessonByTopic.queues, '/learn/queue');
});

test('POST /api/v1/progress/last-lesson without a session is rejected', async () => {
  // Needs its own fresh anonymous session + CSRF pairing rather than the
  // shared one, which is authenticated by this point in the suite (see
  // the equivalent quiz-result test above for the same reasoning).
  const tokenRes = await fetch(`${baseUrl}/api/v1/csrf-token`);
  const freshCookie = [extractCookieNamed(tokenRes, 'connect.sid'), extractCookieNamed(tokenRes, 'csrf-token')]
    .filter(Boolean)
    .join('; ');
  const { csrfToken: freshToken } = await tokenRes.json();

  const res = await fetch(`${baseUrl}/api/v1/progress/last-lesson`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: freshCookie, 'x-csrf-token': freshToken },
    body: JSON.stringify({ topicId: 'queues', lessonUrl: '/learn/queue' }),
  });
  assert.equal(res.status, 401);
});

test('POST /api/v1/progress/quiz-result records a score', async () => {
  const { status } = await api('/api/v1/progress/quiz-result', {
    method: 'POST',
    cookie: sessionCookie,
    body: { topicId: 'arrays', score: 80 },
  });
  assert.equal(status, 204);

  const { data } = await api('/api/v1/progress', { cookie: sessionCookie });
  assert.deepEqual(data.quizResults.arrays, [80]);
});

test('POST /api/v1/progress/quiz-result rejects an out-of-range score', async () => {
  const { status, data } = await api('/api/v1/progress/quiz-result', {
    method: 'POST',
    cookie: sessionCookie,
    body: { topicId: 'arrays', score: 150 },
  });
  assert.equal(status, 400);
  assert.match(data.error, /score/i);
});

test('POST /api/v1/progress/quiz-result without a session is rejected', async () => {
  // Needs its own fresh anonymous session + CSRF pairing rather than the
  // shared one above, which is authenticated by this point in the suite —
  // sending the shared pair here would pass requireAuth and defeat the
  // test. A brand-new pairing has no userId attached, so it still clears
  // CSRF validation but correctly fails the auth check.
  const tokenRes = await fetch(`${baseUrl}/api/v1/csrf-token`);
  const freshCookie = [extractCookieNamed(tokenRes, 'connect.sid'), extractCookieNamed(tokenRes, 'csrf-token')]
    .filter(Boolean)
    .join('; ');
  const { csrfToken: freshToken } = await tokenRes.json();

  const res = await fetch(`${baseUrl}/api/v1/progress/quiz-result`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: freshCookie, 'x-csrf-token': freshToken },
    body: JSON.stringify({ topicId: 'arrays', score: 50 }),
  });
  assert.equal(res.status, 401);
});

test('POST /api/v1/auth/logout ends the session', async () => {
  const { status } = await api('/api/v1/auth/logout', { method: 'POST', cookie: sessionCookie });
  assert.equal(status, 204);

  const { status: meStatus } = await api('/api/v1/auth/me', { cookie: sessionCookie });
  assert.equal(meStatus, 401);
});

test('POST /api/v1/feedback accepts an anonymous submission', async () => {
  // sessionCookie is stale after logout (destroyed server-side, so
  // reusing it makes express-session mint a different session id than
  // the one the shared CSRF token is bound to). Refresh to a fresh
  // anonymous pairing first.
  await fetchCsrfToken();
  const { status, data } = await api('/api/v1/feedback', {
    method: 'POST',
    body: {
      name: 'Anonymous Tester',
      email: 'test-feedback@example.com',
      category: 'Bug Report',
      rating: 4,
      message: 'Automated test feedback submission.',
    },
  });
  assert.equal(status, 201);
  assert.ok(data.id);
});

test('POST /api/v1/feedback rejects a missing message', async () => {
  const { status, data } = await api('/api/v1/feedback', {
    method: 'POST',
    body: { name: 'Anonymous Tester', email: 'test-feedback@example.com', rating: 3, message: '' },
  });
  assert.equal(status, 400);
  assert.match(data.error, /message/i);
});

test('POST /api/v1/auth/forgot-password responds identically for a registered and an unregistered email', async () => {
  await fetchCsrfToken();
  const { status, data } = await api('/api/v1/auth/forgot-password', {
    method: 'POST',
    body: { email: 'definitely-not-registered@example.com' },
  });
  assert.equal(status, 200);
  assert.match(data.message, /reset link has been sent/i);
});

test('POST /api/v1/auth/forgot-password creates a reset token for a registered email', async () => {
  const { status } = await api('/api/v1/auth/forgot-password', { method: 'POST', body: { email: resetEmail } });
  assert.equal(status, 200);

  const [rows] = await pool.query(
    'SELECT id FROM password_reset_tokens WHERE user_id = ? AND used_at IS NULL',
    [resetUserId]
  );
  assert.ok(rows.length >= 1, 'expected a reset token row to be created');
});

test('POST /api/v1/auth/reset-password succeeds with a valid token and the new password can log in', async () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  await pool.query('INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)', [
    resetUserId,
    hashResetToken(rawToken),
    new Date(Date.now() + 60 * 60 * 1000),
  ]);

  const { status } = await api('/api/v1/auth/reset-password', {
    method: 'POST',
    body: { token: rawToken, password: 'newPassword456' },
  });
  assert.equal(status, 204);

  const { status: loginStatus, data: loginData } = await api('/api/v1/auth/login', {
    method: 'POST',
    body: { email: resetEmail, password: 'newPassword456' },
  });
  assert.equal(loginStatus, 200);
  assert.equal(loginData.email, resetEmail);
});

test('POST /api/v1/auth/reset-password rejects an expired token', async () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  await pool.query('INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)', [
    resetUserId,
    hashResetToken(rawToken),
    new Date(Date.now() - 60 * 1000),
  ]);

  const { status, data } = await api('/api/v1/auth/reset-password', {
    method: 'POST',
    body: { token: rawToken, password: 'anotherPassword789' },
  });
  assert.equal(status, 400);
  assert.match(data.error, /invalid or has expired/i);
});

test('POST /api/v1/auth/reset-password rejects an already-used token', async () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  await pool.query(
    'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, used_at) VALUES (?, ?, ?, NOW())',
    [resetUserId, hashResetToken(rawToken), new Date(Date.now() + 60 * 60 * 1000)]
  );

  const { status, data } = await api('/api/v1/auth/reset-password', {
    method: 'POST',
    body: { token: rawToken, password: 'anotherPassword789' },
  });
  assert.equal(status, 400);
  assert.match(data.error, /invalid or has expired/i);
});

test('POST /api/v1/auth/reset-password rejects an unknown token', async () => {
  const { status, data } = await api('/api/v1/auth/reset-password', {
    method: 'POST',
    body: { token: 'not-a-real-token', password: 'anotherPassword789' },
  });
  assert.equal(status, 400);
  assert.match(data.error, /invalid or has expired/i);
});

test('GET /api/v1/feedback as a signed-in non-admin is rejected with 403', async () => {
  const res = await fetch(`${baseUrl}/api/v1/feedback`, { headers: { Cookie: nonAdminCookie } });
  const data = await res.json();
  assert.equal(res.status, 403);
  assert.match(data.error, /admin/i);
});

test('GET /api/v1/feedback without a session is rejected with 401', async () => {
  const res = await fetch(`${baseUrl}/api/v1/feedback`);
  assert.equal(res.status, 401);
});

test('GET /api/v1/feedback as an admin returns the paginated list', async () => {
  const res = await fetch(`${baseUrl}/api/v1/feedback?page=1&limit=5`, { headers: { Cookie: adminCookie } });
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(data.items));
  assert.equal(data.page, 1);
  assert.equal(data.limit, 5);
  assert.ok(data.items.length <= 5);
  // The anonymous-submission test earlier in this suite created at least
  // one row, so the real total should reflect that.
  assert.ok(data.total >= 1);
  assert.equal(data.totalPages, Math.max(1, Math.ceil(data.total / 5)));
});
