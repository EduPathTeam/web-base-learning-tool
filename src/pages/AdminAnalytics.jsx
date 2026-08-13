import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Chart from 'chart.js/auto';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { apiGet } from '../lib/apiClient';
import '../styles/dashboard.css';

// Admin-only, read-only platform aggregates: no per-user drill-down (that's
// /admin/users) and no content editing (a separate, bigger decision not
// made here). Per-topic quiz/completion numbers below `minSampleSize`
// contributing users come back as `null` from the server rather than a
// real number — see server/src/routes/analytics.js's suppressBelowMinSample
// for why (a handful of users touching a topic could otherwise let this
// page reverse-engineer one of their exact scores).
export default function AdminAnalytics() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const signupCanvasRef = useRef(null);
  const signupChartRef = useRef(null);
  const statusCanvasRef = useRef(null);
  const statusChartRef = useRef(null);
  const quizCanvasRef = useRef(null);
  const quizChartRef = useRef(null);
  const completionCanvasRef = useRef(null);
  const completionChartRef = useRef(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    apiGet('/analytics')
      .then((result) => {
        if (!cancelled) setData(result);
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
  }, [isAdmin]);

  useEffect(() => {
    if (!data || !signupCanvasRef.current) return;
    if (signupChartRef.current) signupChartRef.current.destroy();
    signupChartRef.current = new Chart(signupCanvasRef.current.getContext('2d'), {
      type: 'line',
      data: {
        labels: data.signupTrend.map((m) => m.month),
        datasets: [
          {
            label: 'New users',
            data: data.signupTrend.map((m) => m.count),
            borderColor: '#3b6fe0',
            backgroundColor: 'rgba(59, 111, 224, 0.12)',
            pointBackgroundColor: '#3b6fe0',
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.35,
            fill: true,
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 900, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (c) => `${c.parsed.y} new user${c.parsed.y === 1 ? '' : 's'}` },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0, color: '#6b7280' },
            grid: { color: '#eef1f6' },
          },
          x: { ticks: { color: '#6b7280' }, grid: { display: false } },
        },
      },
    });
    return () => signupChartRef.current?.destroy();
  }, [data]);

  useEffect(() => {
    if (!data || !statusCanvasRef.current) return;
    if (statusChartRef.current) statusChartRef.current.destroy();
    statusChartRef.current = new Chart(statusCanvasRef.current.getContext('2d'), {
      type: 'pie',
      data: {
        labels: ['Active', 'Deactivated'],
        datasets: [
          {
            data: [data.users.active, data.users.deactivated],
            backgroundColor: ['#2fb380', '#e0525f'],
            borderColor: '#fff',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 900, easing: 'easeOutQuart' },
        plugins: { legend: { position: 'bottom' } },
      },
    });
    return () => statusChartRef.current?.destroy();
  }, [data]);

  useEffect(() => {
    if (!data || !quizCanvasRef.current) return;
    if (quizChartRef.current) quizChartRef.current.destroy();
    const rows = data.quizAverageByTopic;
    quizChartRef.current = new Chart(quizCanvasRef.current.getContext('2d'), {
      type: 'bar',
      data: {
        labels: rows.map((r) => r.topicName),
        datasets: [
          {
            label: 'Average score',
            data: rows.map((r) => r.avgScore ?? 0),
            backgroundColor: rows.map((r) => (r.avgScore === null ? '#d7dbe3' : '#3b6fe0')),
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 900, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (c) => {
                const r = rows[c.dataIndex];
                return r.avgScore === null
                  ? `Not enough data (${r.userCount} user${r.userCount === 1 ? '' : 's'})`
                  : `${r.avgScore}% average (${r.userCount} user${r.userCount === 1 ? '' : 's'})`;
              },
            },
          },
        },
        scales: {
          x: { min: 0, max: 100, ticks: { color: '#6b7280' }, grid: { color: '#eef1f6' } },
          y: { ticks: { color: '#6b7280' }, grid: { display: false } },
        },
      },
    });
    return () => quizChartRef.current?.destroy();
  }, [data]);

  useEffect(() => {
    if (!data || !completionCanvasRef.current) return;
    if (completionChartRef.current) completionChartRef.current.destroy();
    const rows = data.completionByTopic;
    completionChartRef.current = new Chart(completionCanvasRef.current.getContext('2d'), {
      type: 'bar',
      data: {
        labels: rows.map((r) => r.topicName),
        datasets: [
          {
            label: 'Average completion',
            data: rows.map((r) => r.avgCompletionPct ?? 0),
            backgroundColor: rows.map((r) => (r.avgCompletionPct === null ? '#d7dbe3' : '#2fb380')),
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 900, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (c) => {
                const r = rows[c.dataIndex];
                return r.avgCompletionPct === null
                  ? `Not enough data (${r.usersStarted} user${r.usersStarted === 1 ? '' : 's'} started)`
                  : `${r.avgCompletionPct}% average completion (${r.usersStarted} user${r.usersStarted === 1 ? '' : 's'} started)`;
              },
            },
          },
        },
        scales: {
          x: { min: 0, max: 100, ticks: { color: '#6b7280' }, grid: { color: '#eef1f6' } },
          y: { ticks: { color: '#6b7280' }, grid: { display: false } },
        },
      },
    });
    return () => completionChartRef.current?.destroy();
  }, [data]);

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
          <h1>Platform Analytics</h1>
          <p>
            Read-only, aggregate data across every account. &middot;{' '}
            <Link to="/admin/users">Manage Users</Link> &middot;{' '}
            <Link to="/admin/feedback">View Feedback Submissions</Link>
          </p>

          {error && <p style={{ color: '#e0525f' }}>{error}</p>}
          {loading && !data && <p>Loading…</p>}

          {data && (
            <>
              <section className="row g-3 section-gap">
                <div className="col-6 col-lg-3">
                  <div className="card-panel stat-card hoverable">
                    <div className="stat-value">{data.users.total}</div>
                    <div className="stat-label">Total Users</div>
                  </div>
                </div>
                <div className="col-6 col-lg-3">
                  <div className="card-panel stat-card hoverable">
                    <div className="stat-value">{data.users.active}</div>
                    <div className="stat-label">Active</div>
                  </div>
                </div>
                <div className="col-6 col-lg-3">
                  <div className="card-panel stat-card hoverable">
                    <div className="stat-value">{data.users.deactivated}</div>
                    <div className="stat-label">Deactivated</div>
                  </div>
                </div>
                <div className="col-6 col-lg-3">
                  <div className="card-panel stat-card hoverable">
                    <div className="stat-value">{data.feedback.total}</div>
                    <div className="stat-label">
                      Feedback Submissions
                      {data.feedback.avgRating !== null && ` · ${data.feedback.avgRating}★ avg`}
                    </div>
                  </div>
                </div>
              </section>

              <section className="row g-3 section-gap">
                <div className="col-lg-8">
                  <div className="card-panel chart-card hoverable">
                    <div className="panel-title">
                      <i className="bi bi-graph-up-arrow"></i> Signup Trend
                    </div>
                    <p className="panel-subtitle">New accounts per month, last 12 months</p>
                    <canvas ref={signupCanvasRef} height="110"></canvas>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="card-panel chart-card hoverable">
                    <div className="panel-title">
                      <i className="bi bi-people-fill"></i> Account Status
                    </div>
                    <p className="panel-subtitle">Active vs. deactivated</p>
                    <canvas ref={statusCanvasRef} height="180"></canvas>
                  </div>
                </div>
              </section>

              <section className="row g-3 section-gap">
                <div className="col-lg-6">
                  <div className="card-panel chart-card hoverable">
                    <div className="panel-title">
                      <i className="bi bi-patch-check-fill"></i> Average Quiz Score by Topic
                    </div>
                    <p className="panel-subtitle">
                      Per-user average, then averaged across users &middot; grey bars mean fewer
                      than {data.minSampleSize} users have taken that topic's quiz
                    </p>
                    <canvas ref={quizCanvasRef} height="320"></canvas>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="card-panel chart-card hoverable">
                    <div className="panel-title">
                      <i className="bi bi-journal-check"></i> Average Lesson Completion by Topic
                    </div>
                    <p className="panel-subtitle">
                      % of each topic's lessons completed, averaged across all registered users
                      &middot; grey bars mean fewer than {data.minSampleSize} users have started
                      that topic
                    </p>
                    <canvas ref={completionCanvasRef} height="320"></canvas>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
