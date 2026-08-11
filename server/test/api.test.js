// Integration tests for the Express API, run against the REAL local MySQL
// database configured in server/.env (there is no separate test database —
// see README.md). Every row this suite creates is deleted in the `after`
// hook, and all test users are tagged with a unique timestamped email so a
// failed run never collides with real data.
//
// Run with: npm test  (from server/)
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { pool } from '../src/db/pool.js';

let app;
let server;
let baseUrl;
const testEmail = `test-${Date.now()}@example.com`;
const testPassword = 'password123';

function extractCookie(res) {
  const raw = res.headers.get('set-cookie');
  if (!raw) return null;
  return raw.split(';')[0];
}

async function api(path, { method = 'GET', body, cookie } = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : null;
  return { status: res.status, data, cookie: extractCookie(res) };
}

before(async () => {
  app = createApp();
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://localhost:${server.address().port}`;
});

after(async () => {
  await pool.query('DELETE FROM users WHERE email = ?', [testEmail]);
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

let sessionCookie;

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
  const { status } = await api('/api/v1/progress/quiz-result', {
    method: 'POST',
    body: { topicId: 'arrays', score: 50 },
  });
  assert.equal(status, 401);
});

test('POST /api/v1/auth/logout ends the session', async () => {
  const { status } = await api('/api/v1/auth/logout', { method: 'POST', cookie: sessionCookie });
  assert.equal(status, 204);

  const { status: meStatus } = await api('/api/v1/auth/me', { cookie: sessionCookie });
  assert.equal(meStatus, 401);
});

test('POST /api/v1/feedback accepts an anonymous submission', async () => {
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
