import { useState } from 'react';

export default function ArrayVisualizer() {
  const [data, setData] = useState([10, 20, 30, 40, 50]);
  const [highlight, setHighlight] = useState(-1);
  const [status, setStatus] = useState(' ');

  function handleAction(action) {
    if (action === 'insert') {
      const raw = window.prompt('Enter a value to insert at the end of the array:');
      if (raw === null || raw.trim() === '') return;
      const value = isNaN(Number(raw)) ? raw.trim() : Number(raw);
      const next = [...data, value];
      setData(next);
      setHighlight(next.length - 1);
      setStatus(`Inserted ${value} at index ${next.length - 1}.`);
    } else if (action === 'delete') {
      if (data.length === 0) { setStatus('The array is already empty.'); return; }
      const removed = data[data.length - 1];
      setData(data.slice(0, -1));
      setHighlight(-1);
      setStatus(`Removed ${removed} from the end of the array.`);
    } else if (action === 'search') {
      const raw = window.prompt('Enter a value to search for:');
      if (raw === null || raw.trim() === '') return;
      const value = isNaN(Number(raw)) ? raw.trim() : Number(raw);
      const foundIndex = data.indexOf(value);
      if (foundIndex === -1) {
        setHighlight(-1);
        setStatus(`${value} was not found in the array.`);
      } else {
        setHighlight(foundIndex);
        setStatus(`Found ${value} at index ${foundIndex}.`);
        setTimeout(() => setHighlight(-1), 1400);
      }
    } else if (action === 'update') {
      if (data.length === 0) { setStatus('The array is empty — nothing to update.'); return; }
      const idxRaw = window.prompt(`Enter an index to update (0 to ${data.length - 1}):`);
      if (idxRaw === null || idxRaw.trim() === '') return;
      const idx = Number(idxRaw);
      if (!Number.isInteger(idx) || idx < 0 || idx >= data.length) { setStatus('That index is out of range.'); return; }
      const valRaw = window.prompt(`Enter the new value for index ${idx}:`);
      if (valRaw === null || valRaw.trim() === '') return;
      const value = isNaN(Number(valRaw)) ? valRaw.trim() : Number(valRaw);
      const next = data.slice();
      next[idx] = value;
      setData(next);
      setHighlight(idx);
      setStatus(`Updated index ${idx} to ${value}.`);
      setTimeout(() => setHighlight(-1), 1400);
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
        <button className="btn array-action-btn" onClick={() => handleAction('insert')}><i className="bi bi-plus-lg"></i> Insert</button>
        <button className="btn array-action-btn" onClick={() => handleAction('delete')}><i className="bi bi-dash-lg"></i> Delete</button>
        <button className="btn array-action-btn" onClick={() => handleAction('search')}><i className="bi bi-search"></i> Search</button>
        <button className="btn array-action-btn" onClick={() => handleAction('update')}><i className="bi bi-pencil"></i> Update</button>
      </div>
      <p className="array-status">{status}</p>
    </section>
  );
}
