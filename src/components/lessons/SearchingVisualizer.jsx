import { useState } from 'react';

const SORTED = [4, 9, 15, 22, 30, 38, 45, 52, 60, 71];

function binarySearchSteps(arr, target) {
  const steps = [];
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    steps.push({ lo, hi, mid, found: arr[mid] === target });
    if (arr[mid] === target) break;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return steps;
}

export default function SearchingVisualizer() {
  const [target, setTarget] = useState(45);
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [status, setStatus] = useState(' ');

  function run() {
    const s = binarySearchSteps(SORTED, target);
    setSteps(s);
    setStepIndex(-1);
    s.forEach((_, i) => {
      setTimeout(() => {
        setStepIndex(i);
        if (i === s.length - 1) {
          const found = s[i].found;
          setStatus(found ? `Found ${target} in ${s.length} step(s)!` : `${target} is not in the array (${s.length} step(s) checked).`);
        }
      }, i * 900);
    });
  }

  const current = stepIndex >= 0 ? steps[stepIndex] : null;

  return (
    <section className="content-card fade-in" id="visualize-searching">
      <h2 className="section-title">Visualize Binary Search</h2>
      <p className="section-text">Binary search only works on <strong>sorted</strong> data — it halves the search range every step.</p>

      <div className="array-stage">
        <div className="array-boxes">
          {SORTED.map((v, i) => {
            let cls = 'array-box';
            if (current) {
              if (i === current.mid) cls += ' highlight';
              else if (i < current.lo || i > current.hi) cls += '';
            }
            const dimmed = current && (i < current.lo || i > current.hi);
            return (
              <div key={i} className={cls} style={dimmed ? { opacity: 0.3 } : undefined}>{v}</div>
            );
          })}
        </div>
        <div className="array-indexes">{SORTED.map((_, i) => <div key={i} className="array-index">{i}</div>)}</div>
      </div>

      <div className="array-actions">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--gray-text)' }}>
          target =
          <select value={target} onChange={(e) => setTarget(Number(e.target.value))} style={{ padding: '4px 8px', borderRadius: 8, border: '1px solid var(--border-soft)' }}>
            {SORTED.map((v) => <option key={v} value={v}>{v}</option>)}
            <option value={99}>99 (not present)</option>
          </select>
        </label>
        <button className="btn array-action-btn" onClick={run}><i className="bi bi-search"></i> Search</button>
      </div>
      <p className="array-status">{status}</p>
    </section>
  );
}
