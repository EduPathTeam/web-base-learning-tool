import { useState } from 'react';

function fibNaiveCalls(n) {
  if (n <= 1) return 1;
  return 1 + fibNaiveCalls(n - 1) + fibNaiveCalls(n - 2);
}

export default function DPVisualizer() {
  const [n, setN] = useState(8);
  const [table, setTable] = useState([1, 1]);

  function buildTable() {
    const next = [1, 1];
    for (let i = 2; i <= n; i++) next.push(next[i - 1] + next[i - 2]);
    setTable(next);
  }

  const naiveCalls = fibNaiveCalls(Math.min(n, 20));

  return (
    <section className="content-card fade-in" id="visualize-dp">
      <h2 className="section-title">Visualize Memoization (Fibonacci)</h2>
      <p className="section-text">
        The DP table below is built bottom-up: each value reuses the two before it, so every value is computed once.
      </p>

      <div className="array-stage">
        <div className="array-boxes">
          {table.slice(0, n + 1).map((v, i) => (
            <div key={i} className="array-box">{v}</div>
          ))}
        </div>
        <div className="array-indexes">
          {table.slice(0, n + 1).map((_, i) => <div key={i} className="array-index">fib({i})</div>)}
        </div>
      </div>

      <div className="array-actions">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--gray-text)' }}>
          n =
          <input
            type="number"
            min="2"
            max="15"
            value={n}
            onChange={(e) => setN(Math.max(2, Math.min(15, Number(e.target.value) || 2)))}
            style={{ width: 56, padding: '4px 8px', borderRadius: 8, border: '1px solid var(--border-soft)' }}
          />
        </label>
        <button className="btn array-action-btn" onClick={buildTable}><i className="bi bi-table"></i> Build DP Table</button>
      </div>
      <p className="array-status">
        Naive recursive fib({Math.min(n, 20)}) would make about {naiveCalls} function calls — the DP table computes
        it with only {n + 1}.
      </p>
    </section>
  );
}
