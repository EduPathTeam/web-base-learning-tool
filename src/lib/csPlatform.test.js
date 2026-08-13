// Unit tests for csPlatform.js's pure/derived-stat functions — the logic
// that feeds the Dashboard (streaks, averages, totals, continue-learning
// resolution). These are plain data transforms with no
// React/DOM dependency, so they're tested directly with Node's built-in
// test runner instead of needing a browser test harness.
//
// Run with: npm test  (from the project root)
//
// localStorage is stubbed before csPlatform.js is imported (via a dynamic
// import, since static `import` statements are hoisted above any setup
// code) because csPlatform.js's getData()/saveData() read/write it, and
// plain Node has no localStorage global.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';

class MemoryStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

let csPlatform;
let authState;

before(async () => {
  globalThis.localStorage = new MemoryStorage();
  csPlatform = await import('./csPlatform.js');
  authState = await import('./authState.js');
});

function freshData() {
  globalThis.localStorage.clear();
  authState.setCurrentUser(null);
  return csPlatform.getData();
}

test('TOPICS contains exactly the 12 DSA topics, each with a 10-lesson total', () => {
  assert.equal(csPlatform.TOPICS.length, 12);
  const ids = csPlatform.TOPICS.map((t) => t.id);
  assert.deepEqual(ids, [
    'arrays',
    'linked-lists',
    'queues',
    'stacks',
    'trees',
    'graphs',
    'recursion',
    'dynamic-programming',
    'sorting',
    'searching',
    'greedy',
    'big-o',
  ]);
  csPlatform.TOPICS.forEach((t) => assert.equal(t.total, 10));
});

test('getData() returns a fresh, all-zero state when localStorage is empty', () => {
  const data = freshData();
  assert.deepEqual(data.recentActivity, []);
  csPlatform.TOPICS.forEach((t) => assert.equal(data.completedLessons[t.id], 0));
});

test('markLessonComplete increments the topic count and is capped at the topic total', () => {
  freshData();
  for (let i = 0; i < 12; i++) csPlatform.markLessonComplete('arrays');
  const data = csPlatform.getData();
  assert.equal(
    data.completedLessons.arrays,
    10,
    'should cap at total_lessons (10), not overshoot to 12'
  );
});

test('markLessonComplete on an unknown topic id is a safe no-op', () => {
  freshData();
  const data = csPlatform.markLessonComplete('not-a-real-topic');
  assert.equal(data.recentActivity.length, 0);
});

test('recordQuizResult stores the score and clamps out-of-range values', () => {
  freshData();
  csPlatform.recordQuizResult('arrays', 85);
  csPlatform.recordQuizResult('arrays', 150); // should clamp to 100
  csPlatform.recordQuizResult('arrays', -20); // should clamp to 0
  const data = csPlatform.getData();
  assert.deepEqual(data.quizResults.arrays, [85, 100, 0]);
});

test('computeAverageScore averages every recorded quiz score across all topics', () => {
  freshData();
  csPlatform.recordQuizResult('arrays', 80);
  csPlatform.recordQuizResult('queues', 60);
  const data = csPlatform.getData();
  assert.equal(csPlatform.computeAverageScore(data), 70);
});

test('computeAverageScore returns 0 when no quizzes have been taken', () => {
  const data = freshData();
  assert.equal(csPlatform.computeAverageScore(data), 0);
});

test('computeTotals sums completed lessons and the fixed total across all 12 topics', () => {
  freshData();
  csPlatform.markLessonComplete('arrays');
  csPlatform.markLessonComplete('arrays');
  csPlatform.markLessonComplete('trees');
  const data = csPlatform.getData();
  const { completed, total } = csPlatform.computeTotals(data);
  assert.equal(completed, 3);
  assert.equal(total, 120); // 12 topics x 10 lessons
});

test('findContinueLearningUrl defaults to the first lesson when nothing is in progress', () => {
  const data = freshData();
  assert.equal(csPlatform.findContinueLearningUrl(data), csPlatform.FIRST_LESSON_URL);
});

test('findContinueLearningUrl resumes the last visited, unfinished topic', () => {
  freshData();
  csPlatform.setLastLesson('trees', '/learn/tree');
  const data = csPlatform.getData();
  assert.equal(csPlatform.findContinueLearningUrl(data), '/learn/tree');
});

test('findContinueLearningUrl skips a fully-completed last lesson and finds the next in-progress topic', () => {
  freshData();
  for (let i = 0; i < 10; i++) csPlatform.markLessonComplete('arrays');
  csPlatform.setLastLesson('arrays', '/learn/array');
  const data = csPlatform.getData();
  const url = csPlatform.findContinueLearningUrl(data);
  assert.notEqual(url, '/learn/array', 'arrays is fully complete, should not be suggested again');
  assert.equal(url, csPlatform.TOPICS.find((t) => t.id === 'linked-lists').lessonUrl);
});

test('addLearningMinutes accumulates minutes per topic', () => {
  freshData();
  csPlatform.addLearningMinutes('arrays', 5);
  csPlatform.addLearningMinutes('arrays', 2.5);
  const data = csPlatform.getData();
  assert.equal(data.learningTimeMinutes.arrays, 7.5);
});

test('computeTotalLearningHours converts accumulated minutes across all topics to hours', () => {
  freshData();
  csPlatform.addLearningMinutes('arrays', 30);
  csPlatform.addLearningMinutes('queues', 30);
  const data = csPlatform.getData();
  assert.equal(csPlatform.computeTotalLearningHours(data), 1);
});

test('timeAgo formats recent timestamps as human-readable strings', () => {
  assert.equal(csPlatform.timeAgo(Date.now()), 'Just now');
  assert.equal(csPlatform.timeAgo(Date.now() - 5 * 60000), '5 min ago');
});

test('mergeServerProgress takes the higher lesson count either direction', () => {
  const data = freshData();
  data.completedLessons.arrays = 3;
  data.completedLessons.trees = 7;
  const server = {
    completedLessons: { arrays: 5, trees: 2 },
    quizResults: {},
  };
  csPlatform.mergeServerProgress(data, server);
  assert.equal(data.completedLessons.arrays, 5, 'server is ahead, should win');
  assert.equal(data.completedLessons.trees, 7, 'local is ahead, should be kept');
});

test('mergeServerProgress adopts server quiz results once the server has caught up', () => {
  const data = freshData();
  data.quizResults.arrays = [80];
  const server = { completedLessons: {}, quizResults: { arrays: [80, 95] } };
  csPlatform.mergeServerProgress(data, server);
  assert.deepEqual(data.quizResults.arrays, [80, 95]);
});

test('mergeServerProgress keeps a just-taken local quiz attempt the server has not recorded yet', () => {
  const data = freshData();
  // Simulates a fire-and-forget recordQuizResult() write still in flight:
  // this attempt exists locally but the server's copy hasn't caught up.
  data.quizResults.arrays = [80, 95, 70];
  const server = { completedLessons: {}, quizResults: { arrays: [80, 95] } };
  csPlatform.mergeServerProgress(data, server);
  assert.deepEqual(
    data.quizResults.arrays,
    [80, 95, 70],
    'a shorter server array must not silently drop the newer local attempt'
  );
});

test('mergeServerProgress leaves a topic untouched when the server has no results for it', () => {
  const data = freshData();
  data.quizResults.queues = [60];
  const server = { completedLessons: {}, quizResults: {} };
  csPlatform.mergeServerProgress(data, server);
  assert.deepEqual(data.quizResults.queues, [60]);
});

test("logging in as a different user does not leak the previous account's local data", () => {
  freshData();
  const userA = { id: 101, email: 'a@example.com', displayName: 'User A' };
  const userB = { id: 202, email: 'b@example.com', displayName: 'User B' };

  authState.setCurrentUser(userA);
  csPlatform.markLessonComplete('arrays');
  csPlatform.markLessonComplete('arrays');
  csPlatform.recordQuizResult('arrays', 90);
  const aData = csPlatform.getData();
  assert.equal(aData.completedLessons.arrays, 2);
  assert.deepEqual(aData.quizResults.arrays, [90]);
  assert.equal(
    aData.recentActivity.length,
    3,
    'A should have 3 activity entries (2 lessons + 1 quiz)'
  );

  authState.setCurrentUser(userB);
  const bData = csPlatform.getData();
  assert.equal(bData.completedLessons.arrays, 0, "user B must not see user A's lesson progress");
  assert.deepEqual(bData.quizResults, {}, "user B must not see user A's quiz results");
  assert.equal(bData.recentActivity.length, 0, "user B must not see user A's activity feed");

  // B does their own thing — must not affect A's stored data either.
  csPlatform.markLessonComplete('queues');
  const bDataAfter = csPlatform.getData();
  assert.equal(bDataAfter.completedLessons.queues, 1);

  authState.setCurrentUser(userA);
  const aDataAgain = csPlatform.getData();
  assert.equal(
    aDataAgain.completedLessons.arrays,
    2,
    "A's progress must be untouched by B's session"
  );
  assert.equal(
    aDataAgain.completedLessons.queues,
    0,
    "A never touched queues — B's activity must not appear here"
  );
  assert.deepEqual(aDataAgain.quizResults.arrays, [90]);

  authState.setCurrentUser(null);
});

test("seedAccountFromGuestIfFirstTime carries guest progress into a brand-new account's first login", () => {
  freshData();
  csPlatform.markLessonComplete('trees');
  const guestData = csPlatform.getData();
  assert.equal(guestData.completedLessons.trees, 1);

  const newUser = { id: 303, email: 'new@example.com', displayName: 'New User' };
  const seeded = csPlatform.seedAccountFromGuestIfFirstTime(newUser);
  assert.equal(seeded, true);

  authState.setCurrentUser(newUser);
  const accountData = csPlatform.getData();
  assert.equal(
    accountData.completedLessons.trees,
    1,
    "the new account should inherit the guest's progress"
  );

  authState.setCurrentUser(null);
  const guestDataAfter = csPlatform.getData();
  assert.equal(
    guestDataAfter.completedLessons.trees,
    0,
    'the guest slate should be cleared after being claimed'
  );
});

test('seedAccountFromGuestIfFirstTime does not overwrite an account that already has its own local data', () => {
  freshData();
  const returningUser = { id: 404, email: 'returning@example.com', displayName: 'Returning User' };

  authState.setCurrentUser(returningUser);
  csPlatform.markLessonComplete('stacks');

  authState.setCurrentUser(null);
  csPlatform.markLessonComplete('queues'); // unrelated guest activity on this browser later

  const seeded = csPlatform.seedAccountFromGuestIfFirstTime(returningUser);
  assert.equal(
    seeded,
    false,
    "an account with its own existing data shouldn't be re-seeded from guest data"
  );

  authState.setCurrentUser(returningUser);
  const data = csPlatform.getData();
  assert.equal(
    data.completedLessons.stacks,
    1,
    "the account's own prior progress must be untouched"
  );
  assert.equal(data.completedLessons.queues, 0, 'unrelated guest activity must not leak in');

  authState.setCurrentUser(null);
});
