import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

// Account management: view email, edit display name, sign out. Email is
// read-only here — see server/src/routes/auth.js's PATCH /me comment for
// why (no email verification in this project, and email doubles as the
// login/password-reset identifier, so an unverified change is a real
// lockout risk).
export default function Profile() {
  const { user, loading, logout, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="page-shell">
        <Header />
        <div className="page-shell-main">
          <div className="auth-page">
            <p>Loading…</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-shell">
        <Header />
        <div className="page-shell-main">
          <div className="auth-page">
            <div className="auth-card">
              <h1 className="auth-title">Sign In Required</h1>
              <p className="auth-subtitle">You need to be signed in to view your profile.</p>
              <Link
                to="/sign-in"
                className="auth-submit"
                style={{ display: 'block', textAlign: 'center' }}
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!displayName.trim()) {
      setError('Display name is required.');
      return;
    }

    setSubmitting(true);
    try {
      await updateProfile(displayName.trim());
      setNotice('Your profile has been updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-shell">
      <Header />
      <div className="page-shell-main">
        <div className="auth-page">
          <div className="auth-card">
            <Link to="/" className="auth-logo">
              Edu<span>Path</span>
            </Link>
            <h1 className="auth-title">Your Profile</h1>
            <p className="auth-subtitle">Manage your account details.</p>

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
                <label htmlFor="profileEmail">Email</label>
                <input id="profileEmail" type="email" value={user.email} disabled readOnly />
                <p className="auth-field-hint">
                  Email can't be changed yet — contact an administrator if you need it updated.
                </p>
              </div>

              <div className="auth-field">
                <label htmlFor="profileDisplayName">Display Name</label>
                <input
                  id="profileDisplayName"
                  type="text"
                  autoComplete="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={submitting}
                  required
                />
              </div>

              <button className="auth-submit" type="submit" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save Changes'}
              </button>
            </form>

            <p className="auth-switch">
              <Link to="/forgot-password">Change Password</Link>
            </p>

            <button
              type="button"
              className="auth-submit"
              style={{
                marginTop: '12px',
                background: 'transparent',
                color: 'inherit',
                border: '1px solid currentColor',
              }}
              onClick={logout}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
