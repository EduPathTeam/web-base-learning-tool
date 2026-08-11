import { useEffect } from 'react';

// React port of the IntersectionObserver fade-in reveal used across every
// static page (learn-common.js / home script.js / dashboard.js all had
// their own copy of this — one hook now covers all of them).
export default function useScrollReveal(deps = []) {
  useEffect(() => {
    const targets = document.querySelectorAll('.fade-in:not(.visible), .reveal-on-scroll:not(.is-visible)');
    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('visible', 'is-visible'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible', 'is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
