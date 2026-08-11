import { useState } from 'react';

const COINS = [25, 10, 5, 1];

function greedyChange(amount) {
  let remaining = amount;
  const picks = [];
  for (const coin of COINS) {
    while (remaining >= coin) {
      picks.push(coin);
      remaining -= coin;
    }
  }
  return picks;
}

export default function GreedyVisualizer() {
  const [amount, setAmount] = useState(41);
  const [picks, setPicks] = useState([]);
  const [status, setStatus] = useState(' ');

  function run() {
    const result = greedyChange(amount);
    setPicks(result);
    setStatus(`Greedy picked ${result.length} coin(s) to make ${amount}¢: ${result.map((c) => `${c}¢`).join(' + ')}`);
  }

  return (
    <section className="content-card fade-in" id="visualize-greedy">
      <h2 className="section-title">Visualize a Greedy Choice (Coin Change)</h2>
      <p className="section-text">
        Using coins {COINS.map((c) => `${c}¢`).join(', ')}, the greedy strategy always picks the largest coin that
        still fits.
      </p>

      <div className="array-stage">
        <div className="array-boxes">
          {picks.map((c, i) => (
            <div key={i} className="array-box" style={{ background: 'var(--teal)' }}>{c}¢</div>
          ))}
          {picks.length === 0 && <span style={{ color: 'var(--gray-text)', fontSize: '0.85rem' }}>Click "Make Change" to see the coins picked</span>}
        </div>
      </div>

      <div className="array-actions">
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--gray-text)' }}>
          amount (¢) =
          <input
            type="number"
            min="1"
            max="99"
            value={amount}
            onChange={(e) => setAmount(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
            style={{ width: 64, padding: '4px 8px', borderRadius: 8, border: '1px solid var(--border-soft)' }}
          />
        </label>
        <button className="btn array-action-btn" onClick={run}><i className="bi bi-coin"></i> Make Change</button>
      </div>
      <p className="array-status">{status}</p>
    </section>
  );
}
