import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Registration wired to the real server/ API. A successful registration
// also signs the user in (the backend opens a session on /register), so
// this goes straight to the Dashboard rather than a separate confirmation
// screen — no "check your email" step, since there's nothing to confirm.
export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  function validate() {
    if (!name.trim()) return 'Please enter your name.';
    if (!email.trim() || !EMAIL_RE.test(email.trim())) return 'Please enter a valid email address.';
    if (!password) return 'Please enter a password.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    setError(validationError);
    if (validationError) return;

    setSubmitting(true);
    try {
      await register(email.trim(), password, name.trim());
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button type="button" className="auth-back-link" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left"></i> Back
        </button>
        <Link to="/" className="auth-logo">
          <img src="/images/icon.png" alt="" width="28" height="28" className="auth-logo-icon" />
          Edu<span>Path</span>
        </Link>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Sign up to save your lessons, quiz scores, and progress.</p>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="signupName">Name</label>
            <input
              id="signupName"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="signupEmail">Email</label>
            <input
              id="signupEmail"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="signupPassword">Password</label>
            <input
              id="signupPassword"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              required
            />
            <p className="auth-field-hint">At least 8 characters.</p>
          </div>

          <div className="auth-field">
            <label htmlFor="signupConfirmPassword">Confirm Password</label>
            <input
              id="signupConfirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/sign-in">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
