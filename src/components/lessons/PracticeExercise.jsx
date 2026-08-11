import { useState } from 'react';

export default function PracticeExercise({ task, hint }) {
  const [show, setShow] = useState(false);
  return (
    <section className="content-card fade-in" id="practice-exercise">
      <h2 className="section-title">Practice Exercise</h2>
      <div className="practice-card">
        <h6>Try it yourself</h6>
        <p className="practice-task">{task}</p>
        <button className="btn practice-hint-toggle" onClick={() => setShow((s) => !s)}>
          {show ? 'Hide Hint' : 'Show Hint'}
        </button>
        <div className={`practice-hint-box${show ? ' show' : ''}`}>{hint}</div>
      </div>
    </section>
  );
}
