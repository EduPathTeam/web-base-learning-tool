import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPatch } from '../lib/apiClient';

const PAGE_SIZE = 20;

// Admin-only user management: view all accounts, promote/demote role,
// deactivate/reactivate. See server/src/routes/users.js for the two
// server-side safety guards this UI mirrors client-side for immediate
// feedback (an admin can never target their own row; the server also
// refuses to drop the active-admin count to zero, surfaced here as
// whatever error message that action returns).
export default function AdminUsers() {
  const { user, loading: authLoading } = useAuth();
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [pendingId, setPendingId] = useState(null);

  const isAdmin = user?.role === 'admin';

  const load = useCallback(() => {
    if (!isAdmin) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    apiGet(`/users?page=${page}&limit=${PAGE_SIZE}`)
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin, page]);

  useEffect(() => load(), [load]);

  async function toggleRole(target) {
    const nextRole = target.role === 'admin' ? 'student' : 'admin';
    const confirmMessage =
      nextRole === 'admin'
        ? `Promote ${target.displayName} to admin?`
        : `Demote ${target.displayName} to student?`;
    if (!window.confirm(confirmMessage)) return;
    setActionError('');
    setPendingId(target.id);
    try {
      await apiPatch(`/users/${target.id}/role`, { role: nextRole });
      load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setPendingId(null);
    }
  }

  async function toggleActive(target) {
    const action = target.isActive ? 'deactivate' : 'reactivate';
    if (action === 'deactivate' && !window.confirm(`Deactivate ${target.displayName}?`)) return;
    setActionError('');
    setPendingId(target.id);
    try {
      await apiPatch(`/users/${target.id}/${action}`, {});
      load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setPendingId(null);
    }
  }

  if (authLoading) {
    return (
      <div className="page-shell">
        <Header />
        <div className="page-shell-main">
          <div className="container section-pad">
            <p>Loading…</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="page-shell">
        <Header />
        <div className="page-shell-main">
          <div className="container section-pad text-center">
            <h1>403 — Admins Only</h1>
            <p>
              {user
                ? "Your account doesn't have admin access."
                : 'Please sign in with an admin account to view this page.'}
            </p>
            <Link to="/" className="btn-primary-custom">
              Back to Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Header />
      <div className="page-shell-main">
        <div className="container section-pad">
          <h1>User Management</h1>
          <p>
            {result ? `${result.total} account${result.total === 1 ? '' : 's'}` : ' '} &middot;{' '}
            <Link to="/admin/feedback">View Feedback Submissions</Link>
          </p>

          {error && <p style={{ color: '#e0525f' }}>{error}</p>}
          {actionError && (
            <p style={{ color: '#e0525f' }} role="alert">
              {actionError}
            </p>
          )}
          {loading && !result && <p>Loading…</p>}

          {result && (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table className="table table-striped align-middle">
                  <thead>
                    <tr>
                      <th>Created</th>
                      <th>Email</th>
                      <th>Display Name</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.items.map((item) => {
                      const isSelf = item.id === user.id;
                      const isPending = pendingId === item.id;
                      return (
                        <tr key={item.id}>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            {new Date(item.createdAt).toLocaleString()}
                          </td>
                          <td>{item.email}</td>
                          <td>{item.displayName}</td>
                          <td>{item.role}</td>
                          <td>{item.isActive ? 'Active' : 'Deactivated'}</td>
                          <td>
                            {isSelf ? (
                              <span className="auth-field-hint" style={{ margin: 0 }}>
                                This is you
                              </span>
                            ) : (
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <button
                                  type="button"
                                  className="btn-quick"
                                  disabled={isPending}
                                  onClick={() => toggleRole(item)}
                                >
                                  {item.role === 'admin' ? 'Demote' : 'Promote'}
                                </button>
                                <button
                                  type="button"
                                  className="btn-quick"
                                  disabled={isPending}
                                  onClick={() => toggleActive(item)}
                                >
                                  {item.isActive ? 'Deactivate' : 'Reactivate'}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {result.items.length === 0 && (
                      <tr>
                        <td colSpan={6}>No accounts found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <button
                  type="button"
                  className="btn-primary-custom"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span>
                  Page {result.page} of {result.totalPages}
                </span>
                <button
                  type="button"
                  className="btn-primary-custom"
                  disabled={page >= result.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
