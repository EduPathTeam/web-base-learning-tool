import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { apiGet } from '../lib/apiClient';

const PAGE_SIZE = 20;

// Admin-only view of submitted feedback (previously only inspectable by
// querying MySQL directly — see GET /api/v1/feedback in
// server/src/routes/feedback.js, gated by requireAdmin.js).
export default function AdminFeedback() {
  const { user, loading: authLoading } = useAuth();
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    apiGet(`/feedback?page=${page}&limit=${PAGE_SIZE}`)
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
          <h1>Feedback Submissions</h1>
          <p>
            {result ? `${result.total} total submission${result.total === 1 ? '' : 's'}` : ' '}{' '}
            &middot; <Link to="/admin/users">Manage Users</Link>
          </p>

          {error && <p style={{ color: '#e0525f' }}>{error}</p>}
          {loading && !result && <p>Loading…</p>}

          {result && (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table className="table table-striped align-middle">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Category</th>
                      <th>Rating</th>
                      <th>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.items.map((item) => (
                      <tr key={item.id}>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {new Date(item.created_at).toLocaleString()}
                        </td>
                        <td>{item.name}</td>
                        <td>{item.email}</td>
                        <td>{item.category}</td>
                        <td>
                          {'★'.repeat(item.rating)}
                          {'☆'.repeat(5 - item.rating)}
                        </td>
                        <td style={{ maxWidth: '360px' }}>{item.message}</td>
                      </tr>
                    ))}
                    {result.items.length === 0 && (
                      <tr>
                        <td colSpan={6}>No feedback submitted yet.</td>
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
