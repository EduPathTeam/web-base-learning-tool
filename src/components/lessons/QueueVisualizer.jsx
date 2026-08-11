import { useState } from 'react';

export default function QueueVisualizer() {
  const [data, setData] = useState([10, 20, 30, 40]);
  const [status, setStatus] = useState(' ');

  function handleAction(action) {
    if (action === 'enqueue') {
      const raw = window.prompt('Enter a value to enqueue (add to the rear):');
      if (raw === null || raw.trim() === '') return;
      const value = isNaN(Number(raw)) ? raw.trim() : Number(raw);
      setData([...data, value]);
      setStatus(`Enqueued ${value} at the rear.`);
    } else if (action === 'dequeue') {
      if (data.length === 0) { setStatus('The queue is already empty.'); return; }
      const [removed, ...rest] = data;
      setData(rest);
      setStatus(`Dequeued ${removed} from the front.`);
    } else if (action === 'peek') {
      if (data.length === 0) { setStatus('The queue is empty — nothing to peek.'); return; }
      setStatus(`Front of queue is ${data[0]}.`);
    } else if (action === 'isEmpty') {
      setStatus(data.length === 0 ? 'The queue is empty.' : `The queue is NOT empty (${data.length} element(s)).`);
    }
  }

  return (
    <section className="content-card fade-in" id="visualize-queue">
      <h2 className="section-title">Visualize the Queue</h2>
      <div className="mini-visual">
        <div className="queue-flow">
          <span className="queue-label">Front</span>
          <div className="queue-items">
            {data.map((v, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
                <span className="mini-value">{v}</span>
                {i < data.length - 1 && <i className="bi bi-arrow-right" style={{ margin: '0 8px' }}></i>}
              </span>
            ))}
            {data.length === 0 && <span style={{ color: 'var(--gray-text)', fontSize: '0.85rem' }}>(empty)</span>}
          </div>
          <span className="queue-label">Rear</span>
        </div>
      </div>

      <div className="array-actions">
        <button className="btn array-action-btn" onClick={() => handleAction('enqueue')}><i className="bi bi-plus-lg"></i> Enqueue</button>
        <button className="btn array-action-btn" onClick={() => handleAction('dequeue')}><i className="bi bi-dash-lg"></i> Dequeue</button>
        <button className="btn array-action-btn" onClick={() => handleAction('peek')}><i className="bi bi-eye"></i> Peek</button>
        <button className="btn array-action-btn" onClick={() => handleAction('isEmpty')}><i className="bi bi-question-circle"></i> Is Empty</button>
      </div>
      <p className="array-status">{status}</p>
    </section>
  );
}
