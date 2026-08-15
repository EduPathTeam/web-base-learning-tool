import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { syncFromServer } from '../lib/csPlatform';

// Re-pulls the signed-in user's server progress on mount and whenever the
// tab regains focus (Page Visibility API — same idiom as
// useLessonTimer.js), closing the staleness window left by the one-time
// pull-on-login sync in csPlatform.js without polling on a timer. Calls
// onSync after each successful pull so the caller can refresh whatever
// local state it's rendering from localStorage (see Dashboard.jsx).
export default function useProgressSync(onSync) {
  const { user } = useAuth();
  const onSyncRef = useRef(onSync);

  useEffect(() => {
    onSyncRef.current = onSync;
  });

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    function runSync() {
      syncFromServer()
        .then(() => {
          if (!cancelled) onSyncRef.current?.();
        })
        .catch((err) => console.warn('Progress sync failed:', err.message));
    }

    runSync();

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') runSync();
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // Intentionally keyed on the user's id, not the user object or
    // onSync — re-running on every render (or every AuthContext refresh
    // that returns a new object with the same id) would re-fire the
    // initial sync unnecessarily.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);
}
