import { useState } from 'react';
import InlinePrompt from './InlinePrompt';

export default function StackVisualizer() {
  const [data, setData] = useState([10, 20, 30]); // last item = top
  const [status, setStatus] = useState(' ');
  const [prompt, setPrompt] = useState(null);

  function closePrompt() {
    setPrompt(null);
  }

  function handleAction(action) {
    if (action === 'push') {
      setPrompt({
        label: 'Value to push onto the stack',
        placeholder: 'e.g. 25',
        onConfirm: (raw) => {
          const value = isNaN(Number(raw)) ? raw : Number(raw);
          setData([...data, value]);
          setStatus(`Pushed ${value} onto the top.`);
          closePrompt();
        },
      });
    } else if (action === 'pop') {
      if (data.length === 0) { setStatus('The stack is already empty.'); return; }
      const removed = data[data.length - 1];
      setData(data.slice(0, -1));
      setStatus(`Popped ${removed} from the top.`);
    } else if (action === 'peek') {
      if (data.length === 0) { setStatus('The stack is empty — nothing to peek.'); return; }
      setStatus(`Top of stack is ${data[data.length - 1]}.`);
    } else if (action === 'isEmpty') {
      setStatus(data.length === 0 ? 'The stack is empty.' : `The stack is NOT empty (${data.length} element(s)).`);
    }
  }

  const topDown = [...data].reverse();

  return (
    <section className="content-card fade-in" id="visualize-stack">
      <h2 className="section-title">Visualize the Stack</h2>
      <div className="stack-flow">
        <span className="stack-top-label">TOP</span>
        {topDown.length === 0 && <span style={{ color: 'var(--gray-text)', fontSize: '0.85rem', marginBottom: '8px' }}>(empty)</span>}
        {topDown.map((v, i) => (
          <div key={data.length - i} className="stack-box">{v}</div>
        ))}
        <div className="stack-floor"></div>
      </div>

      <div className="array-actions">
        <button className="btn array-action-btn" disabled={!!prompt} onClick={() => handleAction('push')}><i className="bi bi-plus-lg"></i> Push</button>
        <button className="btn array-action-btn" disabled={!!prompt} onClick={() => handleAction('pop')}><i className="bi bi-dash-lg"></i> Pop</button>
        <button className="btn array-action-btn" disabled={!!prompt} onClick={() => handleAction('peek')}><i className="bi bi-eye"></i> Peek</button>
        <button className="btn array-action-btn" disabled={!!prompt} onClick={() => handleAction('isEmpty')}><i className="bi bi-question-circle"></i> Is Empty</button>
      </div>
      {prompt && <InlinePrompt {...prompt} onCancel={closePrompt} />}
      <p className="array-status">{status}</p>
    </section>
  );
}
