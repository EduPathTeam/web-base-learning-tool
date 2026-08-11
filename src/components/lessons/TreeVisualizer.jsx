import { useMemo, useState } from 'react';

function insertBST(root, value) {
  if (!root) return { value, left: null, right: null };
  if (value < root.value) return { ...root, left: insertBST(root.left, value) };
  if (value > root.value) return { ...root, right: insertBST(root.right, value) };
  return root; // duplicate, ignore
}

function findPath(root, value, path = []) {
  if (!root) return null;
  path.push(root.value);
  if (root.value === value) return path;
  if (value < root.value) return findPath(root.left, value, path);
  return findPath(root.right, value, path);
}

// Assigns x via in-order position (so the tree reads left-to-right sorted)
// and y via depth, producing a simple layered layout for the SVG.
function layout(root) {
  const nodes = [];
  const edges = [];
  let xCounter = 0;

  function walk(node, depth, parent) {
    if (!node) return;
    walk(node.left, depth + 1, node.value);
    const x = xCounter++;
    nodes.push({ value: node.value, x, y: depth });
    if (parent !== null) edges.push({ from: parent, to: node.value });
    walk(node.right, depth + 1, node.value);
  }
  walk(root, 0, null);
  return { nodes, edges };
}

export default function TreeVisualizer() {
  const [root, setRoot] = useState(() => [50, 30, 70, 20, 40, 60, 80].reduce(insertBST, null));
  const [status, setStatus] = useState(' ');
  const [highlightPath, setHighlightPath] = useState([]);

  const { nodes, edges } = useMemo(() => layout(root), [root]);
  const nodeByValue = useMemo(() => Object.fromEntries(nodes.map((n) => [n.value, n])), [nodes]);

  const spacingX = 64;
  const spacingY = 64;
  const width = Math.max(320, (nodes.length || 1) * spacingX);
  const height = (Math.max(...nodes.map((n) => n.y), 0) + 1) * spacingY + 20;

  function handleAction(action) {
    if (action === 'insert') {
      const raw = window.prompt('Enter a value to insert:');
      if (raw === null || raw.trim() === '' || isNaN(Number(raw))) return;
      const value = Number(raw);
      setRoot((r) => insertBST(r, value));
      setHighlightPath([]);
      setStatus(`Inserted ${value}.`);
    } else if (action === 'search') {
      const raw = window.prompt('Enter a value to search for:');
      if (raw === null || raw.trim() === '' || isNaN(Number(raw))) return;
      const value = Number(raw);
      const path = findPath(root, value);
      if (path) {
        setHighlightPath(path);
        setStatus(`Found ${value} after visiting: ${path.join(' → ')}.`);
        setTimeout(() => setHighlightPath([]), 1800);
      } else {
        setHighlightPath([]);
        setStatus(`${value} was not found in the tree.`);
      }
    } else if (action === 'reset') {
      setRoot([50, 30, 70, 20, 40, 60, 80].reduce(insertBST, null));
      setHighlightPath([]);
      setStatus('Tree reset to the default example.');
    }
  }

  return (
    <section className="content-card fade-in" id="visualize-tree">
      <h2 className="section-title">Visualize the Tree (Binary Search Tree)</h2>

      <div className="array-stage" style={{ overflowX: 'auto' }}>
        <svg width={width} height={height} style={{ display: 'block', margin: '0 auto' }}>
          {edges.map((e, i) => {
            const from = nodeByValue[e.from];
            const to = nodeByValue[e.to];
            if (!from || !to) return null;
            return (
              <line
                key={i}
                x1={from.x * spacingX + spacingX / 2}
                y1={from.y * spacingY + 24}
                x2={to.x * spacingX + spacingX / 2}
                y2={to.y * spacingY + 24}
                stroke="var(--border-soft)"
                strokeWidth="2"
              />
            );
          })}
          {nodes.map((n) => {
            const highlighted = highlightPath.includes(n.value);
            return (
              <g key={n.value} transform={`translate(${n.x * spacingX + spacingX / 2}, ${n.y * spacingY + 24})`}>
                <circle r="20" fill={highlighted ? 'var(--orange)' : 'var(--blue)'} />
                <text textAnchor="middle" dy="5" fill="#fff" fontSize="13" fontWeight="700">{n.value}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="array-actions">
        <button className="btn array-action-btn" onClick={() => handleAction('insert')}><i className="bi bi-plus-lg"></i> Insert</button>
        <button className="btn array-action-btn" onClick={() => handleAction('search')}><i className="bi bi-search"></i> Search</button>
        <button className="btn array-action-btn" onClick={() => handleAction('reset')}><i className="bi bi-arrow-counterclockwise"></i> Reset</button>
      </div>
      <p className="array-status">{status}</p>
    </section>
  );
}
