import { useState } from 'react';
import InlinePrompt from './InlinePrompt';

export default function ArrayVisualizer() {
  const [data, setData] = useState([10, 20, 30, 40, 50]);
  const [highlight, setHighlight] = useState(-1);
  const [status, setStatus] = useState(' ');
  const [prompt, setPrompt] = useState(null);

  function closePrompt() {
    setPrompt(null);
  }

  function handleAction(action) {
    if (action === 'insert') {
      setPrompt({
        label: 'Value to insert at the end of the array',
        placeholder: 'e.g. 25',
        onConfirm: (raw) => {
          const value = isNaN(Number(raw)) ? raw : Number(raw);
          const next = [...data, value];
          setData(next);
          setHighlight(next.length - 1);
          setStatus(`Inserted ${value} at index ${next.length - 1}.`);
          closePrompt();
        },
      });
    } else if (action === 'delete') {
      if (data.length === 0) {
        setStatus('The array is already empty.');
        return;
      }
      const removed = data[data.length - 1];
      setData(data.slice(0, -1));
      setHighlight(-1);
      setStatus(`Removed ${removed} from the end of the array.`);
    } else if (action === 'search') {
      setPrompt({
        label: 'Value to search for',
        placeholder: 'e.g. 25',
        onConfirm: (raw) => {
          const value = isNaN(Number(raw)) ? raw : Number(raw);
          const foundIndex = data.indexOf(value);
          if (foundIndex === -1) {
            setHighlight(-1);
            setStatus(`${value} was not found in the array.`);
          } else {
            setHighlight(foundIndex);
            setStatus(`Found ${value} at index ${foundIndex}.`);
            setTimeout(() => setHighlight(-1), 1400);
          }
          closePrompt();
        },
      });
    } else if (action === 'update') {
      if (data.length === 0) {
        setStatus('The array is empty — nothing to update.');
        return;
      }
      setPrompt({
        label: `Index to update (0 to ${data.length - 1})`,
        placeholder: '0',
        validate: (raw) => {
          if (raw === '') return 'Please enter an index.';
          const idx = Number(raw);
          if (!Number.isInteger(idx) || idx < 0 || idx >= data.length) {
            return `Enter an index between 0 and ${data.length - 1}.`;
          }
          return '';
        },
        onConfirm: (raw) => {
          const idx = Number(raw);
          setPrompt({
            label: `New value for index ${idx}`,
            placeholder: 'e.g. 99',
            onConfirm: (valRaw) => {
              const value = isNaN(Number(valRaw)) ? valRaw : Number(valRaw);
              const next = data.slice();
              next[idx] = value;
              setData(next);
              setHighlight(idx);
              setStatus(`Updated index ${idx} to ${value}.`);
              closePrompt();
            },
          });
        },
      });
    }
  }

  return (
    <section className="content-card fade-in" id="visualize-array">
      <h2 className="section-title">Visualize the Array</h2>

      <div className="array-stage">
        <div className="array-boxes">
          {data.map((value, i) => (
            <div key={i} className={`array-box${i === highlight ? ' highlight' : ''}`}>{value}</div>
          ))}
        </div>
        <div className="array-indexes">
          {data.map((_, i) => <div key={i} className="array-index">{i}</div>)}
        </div>
      </div>

      <div className="array-actions">
        <button className="btn array-action-btn" disabled={!!prompt} onClick={() => handleAction('insert')}><i className="bi bi-plus-lg"></i> Insert</button>
        <button className="btn array-action-btn" disabled={!!prompt} onClick={() => handleAction('delete')}><i className="bi bi-dash-lg"></i> Delete</button>
        <button className="btn array-action-btn" disabled={!!prompt} onClick={() => handleAction('search')}><i className="bi bi-search"></i> Search</button>
        <button className="btn array-action-btn" disabled={!!prompt} onClick={() => handleAction('update')}><i className="bi bi-pencil"></i> Update</button>
      </div>
      {prompt && <InlinePrompt {...prompt} onCancel={closePrompt} />}
      <p className="array-status">{status}</p>
    </section>
  );
}
