import { useState } from 'react';

const POSITIONS = {
  A: { x: 160, y: 30 },
  B: { x: 40, y: 120 },
  C: { x: 280, y: 120 },
  D: { x: 100, y: 220 },
  E: { x: 220, y: 220 },
};

const ADJACENCY = {
  A: ['B', 'C'],
  B: ['A', 'D'],
  C: ['A', 'E'],
  D: ['B', 'E'],
  E: ['C', 'D'],
};

const EDGES = [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'E'], ['D', 'E']];

function bfsOrder(start) {
  const visited = new Set([start]);
  const queue = [start];
  const order = [];
  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    for (const next of ADJACENCY[node]) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }
  return order;
}

function dfsOrder(start) {
  const visited = new Set();
  const order = [];
  function walk(node) {
    if (visited.has(node)) return;
    visited.add(node);
    order.push(node);
    ADJACENCY[node].forEach(walk);
  }
  walk(start);
  return order;
}

export default function GraphVisualizer() {
  const [visited, setVisited] = useState([]);
  const [current, setCurrent] = useState(null);
  const [status, setStatus] = useState(' ');

  function runTraversal(kind) {
    const order = kind === 'bfs' ? bfsOrder('A') : dfsOrder('A');
    setVisited([]);
    setStatus(`Running ${kind.toUpperCase()} from A...`);

    order.forEach((node, i) => {
      setTimeout(() => {
        setCurrent(node);
        setVisited((v) => [...v, node]);
        if (i === order.length - 1) {
          setStatus(`${kind.toUpperCase()} order from A: ${order.join(' → ')}`);
          setTimeout(() => setCurrent(null), 600);
        }
      }, i * 650);
    });
  }

  return (
    <section className="content-card fade-in" id="visualize-graph">
      <h2 className="section-title">Visualize the Graph</h2>

      <div className="array-stage">
        <svg width="320" height="260" style={{ display: 'block', margin: '0 auto' }}>
          {EDGES.map(([a, b], i) => (
            <line key={i} x1={POSITIONS[a].x} y1={POSITIONS[a].y} x2={POSITIONS[b].x} y2={POSITIONS[b].y} stroke="var(--border-soft)" strokeWidth="2" />
          ))}
          {Object.entries(POSITIONS).map(([label, pos]) => {
            const isVisited = visited.includes(label);
            const isCurrent = current === label;
            return (
              <g key={label} transform={`translate(${pos.x}, ${pos.y})`}>
                <circle r="20" fill={isCurrent ? 'var(--orange)' : isVisited ? 'var(--teal)' : 'var(--blue)'} />
                <text textAnchor="middle" dy="5" fill="#fff" fontSize="14" fontWeight="700">{label}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="array-actions">
        <button className="btn array-action-btn" onClick={() => runTraversal('bfs')}><i className="bi bi-diagram-3"></i> Run BFS from A</button>
        <button className="btn array-action-btn" onClick={() => runTraversal('dfs')}><i className="bi bi-signpost-split"></i> Run DFS from A</button>
      </div>
      <p className="array-status">{status}</p>
    </section>
  );
}
