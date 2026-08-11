import { useEffect, useState } from 'react';
import { getData, markLessonComplete, setLastLesson, TOPICS } from '../../lib/csPlatform';
import useLessonTimer from '../../hooks/useLessonTimer';

// React port of lesson-engine.js's "Mark Lesson Complete" widget. Also owns
// this lesson's time-tracking (useLessonTimer) since every lesson page
// already renders this component with the topicId it needs.
export default function LessonProgressBar({ topicId, lessonUrl }) {
  const topic = TOPICS.find((t) => t.id === topicId);
  const [completed, setCompleted] = useState(0);
  const [done, setDone] = useState(false);

  useLessonTimer(topicId);

  useEffect(() => {
    setLastLesson(topicId, lessonUrl);
    const data = getData();
    setCompleted(data.completedLessons[topicId] || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, lessonUrl]);

  if (!topic) return null;

  function handleMarkComplete() {
    const data = markLessonComplete(topicId);
    setCompleted(data.completedLessons[topicId] || 0);
    setDone(true);
  }

  const isFullyDone = completed >= topic.total || done;

  return (
    <div className="lesson-progress-bar fade-in">
      <span className="lesson-progress-badge">{completed} / {topic.total} lessons completed in {topic.name}</span>
      <button
        className={`btn mark-complete-btn${isFullyDone ? ' is-complete' : ''}`}
        onClick={handleMarkComplete}
        disabled={isFullyDone}
      >
        <i className={`bi ${isFullyDone ? 'bi-check-circle-fill' : 'bi-check2'}`}></i>{' '}
        {isFullyDone ? 'Lesson Completed' : 'Mark Lesson Complete'}
      </button>
    </div>
  );
}
