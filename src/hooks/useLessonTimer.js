import { useEffect, useRef } from 'react';
import { addLearningMinutes } from '../lib/csPlatform.js';

// Tracks how long a student stays on a lesson page and logs it via
// addLearningMinutes() when they leave — this is what actually feeds the
// Dashboard's "Learning Time" stat card and the Time Distribution pie
// chart. Previously addLearningMinutes() existed in csPlatform.js but
// nothing called it, so both of those stayed empty for every user.
//
// Time is only counted while the tab is visible (document.hidden === false)
// so leaving a lesson open in a background tab doesn't inflate the stat.
export default function useLessonTimer(topicId) {
  const accumulatedMs = useRef(0);
  const visibleSinceRef = useRef(document.visibilityState === 'visible' ? Date.now() : null);

  useEffect(() => {
    if (!topicId) return;

    function flush() {
      if (visibleSinceRef.current !== null) {
        accumulatedMs.current += Date.now() - visibleSinceRef.current;
        visibleSinceRef.current = null;
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        visibleSinceRef.current = Date.now();
      } else {
        flush();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      flush();
      const minutes = accumulatedMs.current / 60000;
      // Ignore sub-6-second visits (accidental clicks / route churn) so the
      // stat reflects genuine reading time, not navigation noise.
      if (minutes >= 0.1) {
        addLearningMinutes(topicId, Math.round(minutes * 10) / 10);
      }
    };
    // Intentionally only re-runs if the topic changes (i.e. a different
    // lesson mounts) — not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);
}
