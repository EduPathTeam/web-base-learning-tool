// Unit tests for csPlatform.js's pure/derived-stat functions — the logic
// that feeds the Dashboard (streaks, averages, totals, recommended major,
// continue-learning resolution). These are plain data transforms with no
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
  constructor() { this.store = new Map(); }
  getItem(key) { return this.store.has(key) ? this.store.get(key) : null; }
  setItem(key, value) { this.store.set(key, String(value)); }
  removeItem(key) { this.store.delete(key); }
  clear() { this.store.clear(); }
}

let csPlatform;

before(async () => {
  globalThis.localStorage = new MemoryStorage();
  csPlatform = await import('./csPlatform.js');
});

function freshData() {
  globalThis.localStorage.clear();
  return csPlatform.getData();
}

test('TOPICS contains exactly the 12 DSA topics, each with a 10-lesson total', () => {
  assert.equal(csPlatform.TOPICS.length, 12);
  const ids = csPlatform.TOPICS.map((t) => t.id);
  assert.deepEqual(
    ids,
    ['arrays', 'linked-lists', 'queues', 'stacks', 'trees', 'graphs', 'recursion',
     'dynamic-programming', 'sorting', 'searching', 'greedy', 'big-o']
  );
  csPlatform.TOPICS.forEach((t) => assert.equal(t.total, 10));
});

test('getData() returns a fresh, all-zero state when localStorage is empty', () => {
  const data = freshData();
  assert.equal(data.recommendedMajor, null);
  assert.deepEqual(data.recentActivity, []);
  csPlatform.TOPICS.forEach((t) => assert.equal(data.completedLessons[t.id], 0));
});

test('markLessonComplete increments the topic count and is capped at the topic total', () => {
  freshData();
  for (let i = 0; i < 12; i++) csPlatform.markLessonComplete('arrays');
  const data = csPlatform.getData();
  assert.equal(data.completedLessons.arrays, 10, 'should cap at total_lessons (10), not overshoot to 12');
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

test('computeRecommendedMajor is null until at least one quiz has been taken', () => {
  const data = freshData();
  assert.equal(csPlatform.computeRecommendedMajor(data), null);
});

test('computeRecommendedMajor picks a major once quiz data exists, with percent clamped to [60, 98]', () => {
  freshData();
  csPlatform.recordQuizResult('arrays', 100);
  csPlatform.markLessonComplete('arrays');
  const data = csPlatform.getData();
  const rec = csPlatform.computeRecommendedMajor(data);
  assert.ok(rec, 'expected a recommendation once quiz data exists');
  assert.ok(rec.percent >= 60 && rec.percent <= 98);
  assert.ok(Array.isArray(rec.reasons) && rec.reasons.length > 0);
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
