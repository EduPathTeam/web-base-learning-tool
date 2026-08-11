import { useState } from 'react';

function randomArray() {
  return Array.from({ length: 8 }, () => Math.floor(Math.random() * 90) + 10);
}

// Precompute every intermediate state of a bubble sort pass so we can step
// through it (and animate through it) without re-running the algorithm.
function bubbleSortSteps(input) {
  const arr = [...input];
  const steps = [{ arr: [...arr], compared: [] }];
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({ arr: [...arr], compared: [j, j + 1] });
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        steps.push({ arr: [...arr], compared: [j, j + 1], swapped: true });
      }
    }
  }
  steps.push({ arr: [...arr], compared: [] });
  return steps;
}

export default function SortingVisualizer() {
  const [data, setData] = useState(() => randomArray());
  const [steps, setSteps] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  function newArray() {
    const arr = randomArray();
    setData(arr);
    setSteps(null);
    setStepIndex(0);
  }

  function play() {
    const s = bubbleSortSteps(data);
    setSteps(s);
    setStepIndex(0);
    setPlaying(true);
    s.forEach((_, i) => {
      setTimeout(() => {
        setStepIndex(i);
        if (i === s.length - 1) setPlaying(false);
      }, i * 350);
    });
  }

  const current = steps ? steps[stepIndex] : { arr: data, compared: [] };
  const max = Math.max(...current.arr, 1);

  return (
    <section className="content-card fade-in" id="visualize-sorting">
      <h2 className="section-title">Visualize Bubble Sort</h2>
      <div className="array-stage" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8, height: 160 }}>
        {current.arr.map((v, i) => (
          <div
            key={i}
            style={{
              width: 32,
              height: `${(v / max) * 130 + 10}px`,
              background: current.compared.includes(i) ? 'var(--orange)' : 'var(--blue)',
              borderRadius: '6px 6px 0 0',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 700,
              paddingTop: 4,
              transition: 'height 0.2s ease, background 0.2s ease',
            }}
          >
            {v}
          </div>
        ))}
      </div>

      <div className="array-actions">
        <button className="btn array-action-btn" onClick={play} disabled={playing}><i className="bi bi-play-fill"></i> Sort</button>
        <button className="btn array-action-btn" onClick={newArray} disabled={playing}><i className="bi bi-shuffle"></i> New Random Array</button>
      </div>
      <p className="array-status">
        {playing ? 'Sorting… comparing adjacent bars and swapping when out of order.' : steps ? 'Sorted!' : 'Click Sort to watch Bubble Sort in action.'}
      </p>
    </section>
  );
}
