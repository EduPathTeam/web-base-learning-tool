import { useState } from 'react';

// React port of the JS/Python/Java tab switcher added to array.css/learn-common.js.
// `panels` is [{ lang: 'js', label: 'JavaScript', code: <jsx/string> }, ...]
export default function CodeTabs({ panels }) {
  const [active, setActive] = useState(panels[0]?.lang);

  return (
    <>
      <div className="code-tabs">
        {panels.map((p) => (
          <button
            key={p.lang}
            className={`btn code-tab-btn${active === p.lang ? ' active' : ''}`}
            onClick={() => setActive(p.lang)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="code-block">
        {panels.map((p) => (
          <pre key={p.lang} className={`code-panel${active === p.lang ? ' active' : ''}`}>
            <code>{p.code}</code>
          </pre>
        ))}
      </div>
    </>
  );
}
