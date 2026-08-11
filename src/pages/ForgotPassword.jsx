import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Calls the real /auth/forgot-password endpoint and shows exactly what it
// says. There's no email provider configured yet, so the actual reset
// link is only logged to the server console (dev-only stand-in) rather
// than emailed — see server/src/routes/auth.js and README.md.
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { requestPasswordReset } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!email.trim() || !EMAIL_RE.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const message = await requestPasswordReset(email.trim());
      setNotice(message);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          Edu<span>Path</span>
        </Link>
        <h1 className="auth-title">Forgot Password?</h1>
        <p className="auth-subtitle">
          Enter your email and we'll let you know how to reset your password.
        </p>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}
        {notice && (
          <div className="auth-success" role="status">
            {notice}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="forgotEmail">Email</label>
            <input
              id="forgotEmail"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>

        <p className="auth-switch">
          <Link to="/sign-in">&larr; Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
