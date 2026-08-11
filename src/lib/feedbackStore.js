// ==========================================================================
// Feedback store — real localStorage persistence.
// The original static version faked a network submit with setTimeout and
// showed a success message without saving anything (a known anti-pattern
// flagged in CLAUDE.md). This project has no backend yet, so instead of
// faking success, feedback is genuinely saved client-side — same honesty
// principle as CSPlatform's progress data.
// ==========================================================================

const STORAGE_KEY = 'csPlatformFeedback_v1';

export function getFeedback() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Feedback store: could not read localStorage.', err);
    return [];
  }
}

export function submitFeedback(entry) {
  const list = getFeedback();
  const record = { ...entry, submittedAt: Date.now() };
  list.unshift(record);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Feedback store: could not persist to localStorage.', err);
  }
  return record;
}
