import { useState } from 'react';

export default function LinkedListVisualizer() {
  const [data, setData] = useState([10, 20, 30]);
  const [highlight, setHighlight] = useState(-1);
  const [status, setStatus] = useState(' ');

  function handleAction(action) {
    if (action === 'insertHead') {
      const raw = window.prompt('Enter a value to insert at the head:');
      if (raw === null || raw.trim() === '') return;
      const value = isNaN(Number(raw)) ? raw.trim() : Number(raw);
      setData([value, ...data]);
      setHighlight(0);
      setStatus(`Inserted ${value} at the head.`);
    } else if (action === 'insertTail') {
      const raw = window.prompt('Enter a value to insert at the tail:');
      if (raw === null || raw.trim() === '') return;
      const value = isNaN(Number(raw)) ? raw.trim() : Number(raw);
      const next = [...data, value];
      setData(next);
      setHighlight(next.length - 1);
      setStatus(`Inserted ${value} at the tail.`);
    } else if (action === 'delete') {
      if (data.length === 0) { setStatus('The list is already empty.'); return; }
      const raw = window.prompt('Enter the value of the node to delete:');
      if (raw === null || raw.trim() === '') return;
      const value = isNaN(Number(raw)) ? raw.trim() : Number(raw);
      const idx = data.indexOf(value);
      if (idx === -1) { setStatus(`${value} was not found in the list.`); return; }
      setData(data.filter((_, i) => i !== idx));
      setHighlight(-1);
      setStatus(`Deleted node with value ${value}.`);
    } else if (action === 'search') {
      const raw = window.prompt('Enter a value to search for:');
      if (raw === null || raw.trim() === '') return;
      const value = isNaN(Number(raw)) ? raw.trim() : Number(raw);
      const idx = data.indexOf(value);
      if (idx === -1) {
        setHighlight(-1);
        setStatus(`${value} was not found in the list.`);
      } else {
        setHighlight(idx);
        setStatus(`Found ${value} after traversing ${idx + 1} node(s) from the head.`);
        setTimeout(() => setHighlight(-1), 1400);
      }
    }
  }

  return (
    <section className="content-card fade-in" id="visualize-linked-list">
      <h2 className="section-title">Visualize the Linked List</h2>

      <div className="array-stage">
        <div className="array-boxes">
          {data.map((value, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span
                className={`array-box${i === highlight ? ' highlight' : ''}`}
                style={{ borderRadius: '10px', marginRight: '18px' }}
              >
                {value}
              </span>
              {i < data.length - 1 && (
                <i className="bi bi-arrow-right" style={{ fontSize: '1.4rem', color: 'var(--gray-text)', marginRight: '18px' }}></i>
              )}
            </span>
          ))}
          <span style={{ fontSize: '0.85rem', color: 'var(--gray-text)' }}>null</span>
        </div>
      </div>

      <div className="array-actions">
        <button className="btn array-action-btn" onClick={() => handleAction('insertHead')}><i className="bi bi-plus-lg"></i> Insert at Head</button>
        <button className="btn array-action-btn" onClick={() => handleAction('insertTail')}><i className="bi bi-plus-lg"></i> Insert at Tail</button>
        <button className="btn array-action-btn" onClick={() => handleAction('delete')}><i className="bi bi-dash-lg"></i> Delete</button>
        <button className="btn array-action-btn" onClick={() => handleAction('search')}><i className="bi bi-search"></i> Search</button>
      </div>
      <p className="array-status">{status}</p>
    </section>
  );
}
