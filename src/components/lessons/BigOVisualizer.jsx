import { useState } from 'react';

const CURVES = [
  { key: 'O(1)', color: '#4caf82', fn: () => 1 },
  { key: 'O(log n)', color: '#3fb6a3', fn: (n) => Math.max(1, Math.log2(n)) },
  { key: 'O(n)', color: '#3b62e0', fn: (n) => n },
  { key: 'O(n log n)', color: '#f0954a', fn: (n) => n * Math.max(1, Math.log2(n)) },
  { key: 'O(n²)', color: '#e58a9a', fn: (n) => n * n },
];

const MAX_N = 20;
const WIDTH = 480;
const HEIGHT = 220;

export default function BigOVisualizer() {
  const [n, setN] = useState(10);

  const maxY = MAX_N * MAX_N; // O(n²) at n=20 dominates the scale

  function toPoints(fn) {
    const pts = [];
    for (let i = 1; i <= MAX_N; i++) {
      const x = (i / MAX_N) * (WIDTH - 20) + 10;
      const y = HEIGHT - 10 - (fn(i) / maxY) * (HEIGHT - 20);
      pts.push(`${x},${y}`);
    }
    return pts.join(' ');
  }

  return (
    <section className="content-card fade-in" id="visualize-bigo">
      <h2 className="section-title">Visualize Growth Rates</h2>
      <p className="section-text">Drag the slider to compare how many "steps" each complexity class takes for a given input size n.</p>

      <div className="array-stage" style={{ overflowX: 'auto' }}>
        <svg width={WIDTH} height={HEIGHT} style={{ display: 'block', margin: '0 auto' }}>
          {CURVES.map((c) => (
            <polyline key={c.key} points={toPoints(c.fn)} fill="none" stroke={c.color} strokeWidth="2.5" />
          ))}
          {/* current-n marker */}
          <line x1={(n / MAX_N) * (WIDTH - 20) + 10} y1="0" x2={(n / MAX_N) * (WIDTH - 20) + 10} y2={HEIGHT} stroke="var(--border-soft)" strokeDasharray="4 4" />
        </svg>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 20px', justifyContent: 'center', margin: '10px 0' }}>
        {CURVES.map((c) => (
          <span key={c.key} style={{ fontSize: '0.8rem', color: 'var(--gray-text)' }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: c.color, marginRight: 6 }}></span>
            {c.key}: {Math.round(c.fn(n))} steps
          </span>
        ))}
      </div>

      <div className="array-actions">
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', color: 'var(--gray-text)', width: '100%', justifyContent: 'center' }}>
          n = {n}
          <input type="range" min="1" max={MAX_N} value={n} onChange={(e) => setN(Number(e.target.value))} style={{ width: 200 }} />
        </label>
      </div>
    </section>
  );
}
