// ==========================================================================
// CS Learning Platform — shared progress store
// React port of pages/dashboard-page/dashboard.js's CSPlatform module.
// Same localStorage key/schema, same public API — just exported as plain
// functions instead of window.CSPlatform, so any component can:
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
// ==========================================================================

import { getCurrentUser } from './authState.js';
import { apiGet, apiPost } from './apiClient.js';

export const TOPICS = [
  { id: 'arrays', name: 'Arrays', total: 10, lessonUrl: '/learn/array', quizUrl: '/quiz/arrays' },
  { id: 'linked-lists', name: 'Linked Lists', total: 10, lessonUrl: '/learn/linked-list', quizUrl: '/quiz/linked-lists' },
  { id: 'queues', name: 'Queue', total: 10, lessonUrl: '/learn/queue', quizUrl: '/quiz/queues' },
  { id: 'stacks', name: 'Stack', total: 10, lessonUrl: '/learn/stack', quizUrl: '/quiz/stacks' },
  { id: 'trees', name: 'Trees', total: 10, lessonUrl: '/learn/tree', quizUrl: '/quiz/trees' },
  { id: 'graphs', name: 'Graphs', total: 10, lessonUrl: '/learn/graph', quizUrl: '/quiz/graphs' },
  { id: 'recursion', name: 'Recursion', total: 10, lessonUrl: '/learn/recursion', quizUrl: '/quiz/recursion' },
  { id: 'dynamic-programming', name: 'Dynamic Programming', total: 10, lessonUrl: '/learn/dynamic-programming', quizUrl: '/quiz/dynamic-programming' },
  { id: 'sorting', name: 'Sorting', total: 10, lessonUrl: '/learn/sorting', quizUrl: '/quiz/sorting' },
  { id: 'searching', name: 'Searching', total: 10, lessonUrl: '/learn/searching', quizUrl: '/quiz/searching' },
  { id: 'greedy', name: 'Greedy Algorithm', total: 10, lessonUrl: '/learn/greedy', quizUrl: '/quiz/greedy' },
  { id: 'big-o', name: 'Big-O Notation', total: 10, lessonUrl: '/learn/big-o', quizUrl: '/quiz/big-o' },
];

export const FIRST_LESSON_URL = '/learn/array';
// v2: bumped so any browser that already has old seeded demo data (from
// before the dashboard was switched to a true empty start) simply won't
// find this key and will get a fresh, real, all-zero state.
export const STORAGE_KEY = 'csPlatformData_v2';

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
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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

// Pulls the signed-in user's saved progress down from the server and
// merges it into the local (localStorage) copy — called right after
// login/register so the dashboard reflects the account's real history
// instead of whatever this browser happened to have locally.
export async function syncFromServer() {
  if (!getCurrentUser()) return;

  const server = await apiGet('/progress');
  const data = getData();

  TOPICS.forEach((t) => {
    const serverCount = server.completedLessons[t.id] || 0;
    data.completedLessons[t.id] = Math.max(data.completedLessons[t.id] || 0, serverCount);
  });

  Object.entries(server.quizResults).forEach(([topicId, scores]) => {
    data.quizResults[topicId] = scores;
  });

  data.recommendedMajor = computeRecommendedMajor(data);
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
