import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

// Reads the token from the reset link's ?token= query param (the link
// server/src/routes/auth.js emails via Resend — see server/src/lib/email.js)
// and submits it with a new password to /auth/reset-password.
export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  function validate() {
    if (!token) return 'This reset link is missing its token. Please request a new one.';
    if (!password) return 'Please enter a new password.';
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
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <Link to="/" className="auth-logo">
            <img src="/images/icon.png" alt="" width="28" height="28" className="auth-logo-icon" />
            Edu<span>Path</span>
          </Link>
          <h1 className="auth-title">Password Updated</h1>
          <div className="auth-success" role="status">
            Your password has been reset. You can now sign in with your new password.
          </div>
          <button className="auth-submit" type="button" onClick={() => navigate('/sign-in')}>
            Go to Sign In
          </button>
        </div>
      </div>
    );
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
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">Choose a new password for your account.</p>

        {!token && (
          <div className="auth-error" role="alert">
            This link is missing its reset token. Please request a new password reset link.
          </div>
        )}
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="resetPassword">New Password</label>
            <input
              id="resetPassword"
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
            <label htmlFor="resetConfirmPassword">Confirm New Password</label>
            <input
              id="resetConfirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <button className="auth-submit" type="submit" disabled={submitting || !token}>
            {submitting ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>

        <p className="auth-switch">
          <Link to="/forgot-password">Request a new link</Link> &middot;{' '}
          <Link to="/sign-in">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
