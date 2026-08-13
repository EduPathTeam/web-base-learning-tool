import { useEffect, useRef, useState } from 'react';

// Shared inline replacement for window.prompt() across the DSA
// visualizers: a small text input with Confirm/Cancel next to the action
// buttons, submitting on Enter and cancelling on Escape. `validate` gets
// the trimmed input and returns an error string (or '' if valid); when
// omitted, empty input is rejected by default.
export default function InlinePrompt({ label, placeholder, onConfirm, onCancel, validate }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function submit() {
    const trimmed = value.trim();
    const validationError = validate ? validate(trimmed) : trimmed === '' ? 'Please enter a value.' : '';
    if (validationError) {
      setError(validationError);
      return;
    }
    onConfirm(trimmed);
  }

  return (
    <div className="inline-prompt">
      {label && <label className="inline-prompt-label">{label}</label>}
      <div className="inline-prompt-row">
        <input
          ref={inputRef}
          type="text"
          className="inline-prompt-input"
          value={value}
          placeholder={placeholder}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              onCancel();
            }
          }}
        />
        <button type="button" className="btn inline-prompt-confirm" onClick={submit}>
          Confirm
        </button>
        <button type="button" className="btn inline-prompt-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
      {error && <p className="inline-prompt-error">{error}</p>}
    </div>
  );
}
