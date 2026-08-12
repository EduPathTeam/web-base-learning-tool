// ==========================================================================
// CS Learning Platform — shared progress store
// React port of pages/dashboard-page/dashboard.js's CSPlatform module.
// Same public API — just exported as plain functions instead of
// window.CSPlatform, so any component can:
//   import { markLessonComplete, recordQuizResult } from '../lib/csPlatform';
// DOM rendering (charts, stat cards, etc.) lives in React components now;
// this file only owns data + persistence, matching the project's existing
// "single source of truth in localStorage" design.
//
// Backend sync: localStorage remains the synchronous read model every
// component already relies on (works instantly, works signed-out as a
// guest). When a user is signed in (see authState.js), the mutating calls
// below ALSO fire a request to the server/ API so progress is durably
// saved to MySQL under that account — fire-and-forget, so a slow/offline
// API never blocks the UI. syncFromServer() pulls the account's saved
// progress down into localStorage right after sign-in.
//
// Storage is scoped per identity (see storageKeyFor() below), not one
// shared key. It used to be one fixed key for every account and guest
// browsing on the same browser, which meant switching accounts on the
// same machine showed the previous account's data — nothing distinguished
// "sync this account across two devices" (where merging local + server
// with Math.max is correct) from "a completely different account just
// logged in" (where it isn't). Fixed by giving each account its own key.
// ==========================================================================

import { getCurrentUser } from './authState.js';
import { apiGet, apiPost } from './apiClient.js';

export const TOPICS = [
  { id: 'arrays', name: 'Arrays', total: 10, lessonUrl: '/learn/array', quizUrl: '/quiz/arrays' },
  {
    id: 'linked-lists',
    name: 'Linked Lists',
    total: 10,
    lessonUrl: '/learn/linked-list',
    quizUrl: '/quiz/linked-lists',
  },
  { id: 'queues', name: 'Queue', total: 10, lessonUrl: '/learn/queue', quizUrl: '/quiz/queues' },
  { id: 'stacks', name: 'Stack', total: 10, lessonUrl: '/learn/stack', quizUrl: '/quiz/stacks' },
  { id: 'trees', name: 'Trees', total: 10, lessonUrl: '/learn/tree', quizUrl: '/quiz/trees' },
  { id: 'graphs', name: 'Graphs', total: 10, lessonUrl: '/learn/graph', quizUrl: '/quiz/graphs' },
  {
    id: 'recursion',
    name: 'Recursion',
    total: 10,
    lessonUrl: '/learn/recursion',
    quizUrl: '/quiz/recursion',
  },
  {
    id: 'dynamic-programming',
    name: 'Dynamic Programming',
    total: 10,
    lessonUrl: '/learn/dynamic-programming',
    quizUrl: '/quiz/dynamic-programming',
  },
  {
    id: 'sorting',
    name: 'Sorting',
    total: 10,
    lessonUrl: '/learn/sorting',
    quizUrl: '/quiz/sorting',
  },
  {
    id: 'searching',
    name: 'Searching',
    total: 10,
    lessonUrl: '/learn/searching',
    quizUrl: '/quiz/searching',
  },
  {
    id: 'greedy',
    name: 'Greedy Algorithm',
    total: 10,
    lessonUrl: '/learn/greedy',
    quizUrl: '/quiz/greedy',
  },
  {
    id: 'big-o',
    name: 'Big-O Notation',
    total: 10,
    lessonUrl: '/learn/big-o',
    quizUrl: '/quiz/big-o',
  },
];

export const FIRST_LESSON_URL = '/learn/array';

// v2: bumped so any browser that already had old seeded demo data (from
// before the dashboard was switched to a true empty start) simply won't
// find this key and gets a fresh, real, all-zero state. Now split per
// identity — see the file header comment for why a single shared key
// was a real bug, not just a naming detail.
const LEGACY_SHARED_STORAGE_KEY = 'csPlatformData_v2';
const GUEST_STORAGE_KEY = 'csPlatformData_v2_guest';
const USER_STORAGE_KEY_PREFIX = 'csPlatformData_v2_user_';

function storageKeyFor(user) {
  return user ? `${USER_STORAGE_KEY_PREFIX}${user.id}` : GUEST_STORAGE_KEY;
}

// One-time migration for browsers with data under the old shared key.
// Treated as guest data — the safest interpretation, since pre-fix data
// was never actually scoped to a particular account.
function migrateLegacySharedData() {
  try {
    if (localStorage.getItem(GUEST_STORAGE_KEY) !== null) return;
    const legacy = localStorage.getItem(LEGACY_SHARED_STORAGE_KEY);
    if (legacy !== null) {
      localStorage.setItem(GUEST_STORAGE_KEY, legacy);
      localStorage.removeItem(LEGACY_SHARED_STORAGE_KEY);
    }
  } catch {
    // localStorage inaccessible — nothing to migrate.
  }
}

const MAJORS = [
  {
    name: 'Data Science',
    weightTopics: ['arrays', 'trees', 'sorting'],
    reasons: [
      'Strong performance in algorithm complexity',
      'High engagement with data structures',
      'Excellent analytical problem-solving',
    ],
  },
  {
    name: 'Software Engineering',
    weightTopics: ['linked-lists', 'stacks', 'queues'],
    reasons: [
      'Consistent progress across core data structures',
      'Solid grasp of memory and reference-based structures',
      'Good balance across multiple topics',
    ],
  },
  {
    name: 'Artificial Intelligence',
    weightTopics: ['graphs', 'trees', 'sorting'],
    reasons: [
      'High accuracy on graph and tree traversal quizzes',
      'Comfortable with recursive problem-solving',
      'Fast completion time on optimization topics',
    ],
  },
];

function buildDefaultData() {
  const emptyPerTopic = {};
  TOPICS.forEach((t) => (emptyPerTopic[t.id] = 0));

  return {
    completedLessons: { ...emptyPerTopic },
    quizResults: {},
    weeklyPerformance: [0, 0, 0, 0, 0, 0],
    learningTimeMinutes: { ...emptyPerTopic },
    activeDates: [],
    recentActivity: [],
    lastLesson: null,
    recommendedMajor: null,
  };
}

function isoDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function getData() {
  migrateLegacySharedData();
  const key = storageKeyFor(getCurrentUser());
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const fresh = buildDefaultData();
      saveData(fresh);
      return fresh;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('CSPlatform: could not read localStorage, using defaults.', err);
    return buildDefaultData();
  }
}

export function saveData(data) {
  const key = storageKeyFor(getCurrentUser());
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('CSPlatform: could not persist to localStorage.', err);
  }
}

function pushActivity(data, entry) {
  data.recentActivity.unshift({
    type: entry.type,
    text: entry.text,
    link: entry.link || null,
    timestamp: Date.now(),
  });
  data.recentActivity = data.recentActivity.slice(0, 8);
}

function recordActiveDate(data) {
  const today = isoDaysAgo(0);
  if (!data.activeDates.includes(today)) {
    data.activeDates.unshift(today);
    data.activeDates = data.activeDates.slice(0, 60);
  }
}

export function computeRecommendedMajor(data) {
  const hasAnyQuizData = Object.values(data.quizResults).some((arr) => arr.length > 0);
  if (!hasAnyQuizData) return null;

  let best = null;
  let bestScore = -1;

  MAJORS.forEach((major) => {
    let score = 0;
    let weightCount = 0;
    major.weightTopics.forEach((topicId) => {
      const topic = TOPICS.find((t) => t.id === topicId);
      const completedPct = ((data.completedLessons[topicId] || 0) / topic.total) * 100;
      const quizScores = data.quizResults[topicId] || [];
      const avgQuiz = quizScores.length
        ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length
        : 0;
      score += completedPct * 0.5 + avgQuiz * 0.5;
      weightCount += 1;
    });
    const normalized = weightCount ? score / weightCount : 0;
    if (normalized > bestScore) {
      bestScore = normalized;
      best = major;
    }
  });

  return {
    name: best.name,
    percent: Math.max(60, Math.min(98, Math.round(bestScore))),
    reasons: best.reasons,
  };
}

export function markLessonComplete(topicId) {
  const data = getData();
  const topic = TOPICS.find((t) => t.id === topicId);
  if (!topic) return data;

  const current = data.completedLessons[topicId] || 0;
  data.completedLessons[topicId] = Math.min(current + 1, topic.total);

  pushActivity(data, {
    type: 'lesson',
    text: `Completed a lesson in ${topic.name}`,
    link: topic.lessonUrl,
  });

  recordActiveDate(data);
  data.recommendedMajor = computeRecommendedMajor(data);
  saveData(data);

  if (getCurrentUser()) {
    apiPost('/progress/lesson-complete', { topicId, lessonUrl: topic.lessonUrl }).catch((err) =>
      console.warn('Could not sync lesson completion to server:', err.message)
    );
  }

  return data;
}

export function recordQuizResult(topicId, score) {
  const data = getData();
  const topic = TOPICS.find((t) => t.id === topicId);
  if (!topic) return data;

  if (!data.quizResults[topicId]) data.quizResults[topicId] = [];
  data.quizResults[topicId].push(Math.max(0, Math.min(100, score)));

  pushActivity(data, {
    type: 'quiz',
    text: `${score >= 60 ? 'Passed' : 'Attempted'} ${topic.name} Quiz (${score}%)`,
    link: topic.quizUrl,
  });

  const weekly = data.weeklyPerformance.slice();
  weekly[weekly.length - 1] = Math.round((weekly[weekly.length - 1] + score) / 2);
  data.weeklyPerformance = weekly;

  recordActiveDate(data);
  data.recommendedMajor = computeRecommendedMajor(data);
  saveData(data);

  if (getCurrentUser()) {
    apiPost('/progress/quiz-result', { topicId, score }).catch((err) =>
      console.warn('Could not sync quiz result to server:', err.message)
    );
  }

  return data;
}

export function setLastLesson(topicId, url) {
  const data = getData();
  data.lastLesson = { topicId, url };
  saveData(data);

  if (getCurrentUser()) {
    apiPost('/progress/last-lesson', { topicId, lessonUrl: url }).catch((err) =>
      console.warn('Could not sync last lesson to server:', err.message)
    );
  }

  return data;
}

// Pure merge step, split out from syncFromServer() so it can be unit
// tested without touching the network or localStorage (see
// csPlatform.test.js). Mutates and returns `data`.
//
// Lesson counts merge with Math.max — safe and monotonic either way.
// Quiz results are only adopted from the server when its array is at
// least as long as the local one. quiz_results is an append-only log
// server-side, so once the server has caught up its array is a superset
// of the local one; but recordQuizResult()'s write to the server is
// fire-and-forget, so a just-taken local attempt can still be ahead of
// what the server has recorded. Overwriting local with a shorter server
// array in that window would silently drop that attempt.
export function mergeServerProgress(data, server) {
  TOPICS.forEach((t) => {
    const serverCount = server.completedLessons[t.id] || 0;
    data.completedLessons[t.id] = Math.max(data.completedLessons[t.id] || 0, serverCount);
  });

  Object.entries(server.quizResults).forEach(([topicId, scores]) => {
    const localScores = data.quizResults[topicId] || [];
    if (scores.length >= localScores.length) {
      data.quizResults[topicId] = scores;
    }
  });

  data.recommendedMajor = computeRecommendedMajor(data);
  return data;
}

// If this is the first time `user`'s account has been used on this
// browser (no local data under its own key yet), carries over whatever
// guest progress currently exists here — matching the pre-existing
// "guest progress carries into your next login" behavior — and clears
// the guest slate afterward so the same guest data can't also carry into
// a second, different account logged into later on this browser. No-op
// (returns false) if this account already has its own local data.
//
// Split out from syncFromServer() so this half of the flow — everything
// except the actual network call — can be unit tested without a network
// mock; see csPlatform.test.js.
export function seedAccountFromGuestIfFirstTime(user) {
  const key = storageKeyFor(user);
  if (localStorage.getItem(key) !== null) return false;

  migrateLegacySharedData();
  const guestRaw = localStorage.getItem(GUEST_STORAGE_KEY);
  if (guestRaw !== null) {
    localStorage.setItem(key, guestRaw);
    localStorage.removeItem(GUEST_STORAGE_KEY);
  }
  return true;
}

// Pulls the signed-in user's saved progress down from the server and
// merges it into this account's own local (localStorage) copy — see
// storageKeyFor() above; each account gets its own key on this browser,
// so this can never blend in a different account's cached data. Called
// right after login/register, and — via useProgressSync.js — on
// Dashboard mount and whenever the tab regains focus, so a second
// device's progress shows up without requiring a full sign-out/sign-in.
// There's still no push from the server: a change on another device only
// appears here the next time one of those trigger points fires on this
// one.
export async function syncFromServer() {
  const user = getCurrentUser();
  if (!user) return;

  seedAccountFromGuestIfFirstTime(user);

  const server = await apiGet('/progress');
  const data = getData();
  mergeServerProgress(data, server);
  saveData(data);
  return data;
}

export function addLearningMinutes(topicId, minutes) {
  const data = getData();
  data.learningTimeMinutes[topicId] = (data.learningTimeMinutes[topicId] || 0) + minutes;
  saveData(data);
  return data;
}

export function computeTotals(data) {
  let completed = 0;
  let total = 0;
  TOPICS.forEach((t) => {
    completed += data.completedLessons[t.id] || 0;
    total += t.total;
  });
  return { completed, total };
}

export function computeAverageScore(data) {
  const all = [];
  Object.values(data.quizResults).forEach((arr) => all.push(...arr));
  if (!all.length) return 0;
  const sum = all.reduce((a, b) => a + b, 0);
  return Math.round(sum / all.length);
}

export function computeStreak(data) {
  const dates = new Set(data.activeDates);
  let streak = 0;
  let cursor = 0;
  while (dates.has(isoDaysAgo(cursor))) {
    streak += 1;
    cursor += 1;
  }
  return streak;
}

export function computeTotalLearningHours(data) {
  const totalMinutes = Object.values(data.learningTimeMinutes).reduce((a, b) => a + b, 0);
  return Math.round((totalMinutes / 60) * 10) / 10;
}

export function findContinueLearningUrl(data) {
  if (data.lastLesson && data.lastLesson.topicId) {
    const topic = TOPICS.find((t) => t.id === data.lastLesson.topicId);
    if (topic && (data.completedLessons[topic.id] || 0) < topic.total) {
      return data.lastLesson.url || topic.lessonUrl;
    }
  }
  const inProgress = TOPICS.find((t) => (data.completedLessons[t.id] || 0) < t.total);
  if (inProgress) return inProgress.lessonUrl;

  return FIRST_LESSON_URL;
}

export function timeAgo(timestamp) {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}
