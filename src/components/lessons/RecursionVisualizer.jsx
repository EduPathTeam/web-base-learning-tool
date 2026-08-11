import { useState } from 'react';

// Builds the sequence of call-stack "frames" for factorial(n), step by step,
// so students can see the stack grow (calls) then shrink (returns).
function buildFrames(n) {
  const frames = [];
  for (let i = n; i >= 1; i--) frames.push({ label: `factorial(${i})`, state: 'calling' });
  for (let i = 1; i <= n; i++) frames.push({ label: `factorial(${i}) returns ${factorial(i)}`, state: 'returning', pop: true });
  return frames;
}

function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
}

export default function RecursionVisualizer() {
  const [n, setN] = useState(4);
  const [stack, setStack] = useState([]);
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);

  function start() {
    const frames = buildFrames(n);
    setStack([]);
    setStep(0);
    setRunning(true);

    frames.forEach((frame, i) => {
      setTimeout(() => {
        setStack((s) => (frame.pop ? s.slice(0, -1) : [...s, frame.label]));
        setStep(i + 1);
        if (i === frames.length - 1) setRunning(false);
      }, i * 500);
    });
  }

  return (
    <section className="content-card fade-in" id="visualize-recursion">
      <h2 className="section-title">Visualize the Call Stack</h2>
      <p className="section-text">Watch how <code>factorial(n)</code> builds up stack frames on the way down, then pops them off on the way back up.</p>

      <div className="array-stage">
        <div className="stack-flow">
          <span className="stack-top-label">TOP</span>
          {stack.length === 0 && <span style={{ color: 'var(--gray-text)', fontSize: '0.85rem', marginBottom: 8 }}>(call stack empty)</span>}
          {[...stack].reverse().map((frame, i) => (
            <div key={i} className="stack-box" style={{ width: 220, fontSize: '0.85rem' }}>{frame}</div>
          ))}
          <div className="stack-floor" style={{ width: 240 }}></div>
        </div>
      </div>

      <div className="array-actions">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--gray-text)' }}>
          n =
          <input
            type="number"
            min="1"
            max="6"
            value={n}
            onChange={(e) => setN(Math.max(1, Math.min(6, Number(e.target.value) || 1)))}
            style={{ width: 56, padding: '4px 8px', borderRadius: 8, border: '1px solid var(--border-soft)' }}
          />
        </label>
        <button className="btn array-action-btn" onClick={start} disabled={running}>
          <i className="bi bi-play-fill"></i> Run factorial({n})
        </button>
      </div>
      <p className="array-status">{step > 0 ? `Step ${step}` : ' '}</p>
    </section>
  );
}
