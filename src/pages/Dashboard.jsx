import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';
import Header from '../components/Header';
import Footer from '../components/Footer';
import useScrollReveal from '../hooks/useScrollReveal';
import useProgressSync from '../hooks/useProgressSync';
import { useAuth } from '../context/AuthContext';
import {
  TOPICS,
  getData,
  saveData,
  computeTotals,
  computeAverageScore,
  computeStreak,
  computeTotalLearningHours,
  computeRecommendedMajor,
  findContinueLearningUrl,
  timeAgo,
} from '../lib/csPlatform';
import '../styles/dashboard.css';
import '../styles/learn.css';

// One color per DSA topic (all 12) so the Time Distribution chart can show
// time logged across the full curriculum, not just a 5-topic subset.
const TIME_COLORS = {
  arrays: '#3b6fe0',
  'linked-lists': '#7b4fd6',
  queues: '#2b9bd6',
  stacks: '#c99a1e',
  trees: '#2fb380',
  graphs: '#e08a2b',
  recursion: '#8a4fe8',
  'dynamic-programming': '#e0525f',
  sorting: '#d9436b',
  searching: '#17c99e',
  greedy: '#5b6ee8',
  'big-o': '#c94b7c',
};

const ACTIVITY_ICON = {
  lesson: { icon: 'bi-check-circle-fill', cls: 'type-lesson' },
  quiz: { icon: 'bi-patch-check-fill', cls: 'type-quiz' },
  start: { icon: 'bi-play-circle-fill', cls: 'type-start' },
  milestone: { icon: 'bi-award-fill', cls: 'type-milestone' },
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const perfCanvasRef = useRef(null);
  const perfChartRef = useRef(null);
  const pieCanvasRef = useRef(null);
  const pieChartRef = useRef(null);

  useEffect(() => {
    const d = getData();
    d.recommendedMajor = computeRecommendedMajor(d);
    saveData(d);
    setData(d);
  }, []);

  // Re-pulls server progress on mount and on tab-focus-regained (see
  // useProgressSync.js) and refreshes this page's state once the merge
  // lands, so a second device's progress shows up without a full
  // sign-out/sign-in. No-ops for guests (no signed-in user to sync).
  useProgressSync(() => setData(getData()));

  useScrollReveal([data]);

  useEffect(() => {
    if (!data || !perfCanvasRef.current) return;
    if (perfChartRef.current) perfChartRef.current.destroy();
    perfChartRef.current = new Chart(perfCanvasRef.current.getContext('2d'), {
      type: 'line',
      data: {
        labels: data.weeklyPerformance.map((_, i) => `Week ${i + 1}`),
        datasets: [
          {
            label: 'Quiz Score',
            data: data.weeklyPerformance,
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
          tooltip: { callbacks: { label: (c) => `${c.parsed.y}% average` } },
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            ticks: { stepSize: 25, color: '#6b7280' },
            grid: { color: '#eef1f6' },
          },
          x: { ticks: { color: '#6b7280' }, grid: { display: false } },
        },
      },
    });
    return () => perfChartRef.current?.destroy();
  }, [data]);

  const pieTopics = useMemo(
    () => TOPICS.filter((t) => Object.prototype.hasOwnProperty.call(TIME_COLORS, t.id)),
    []
  );

  useEffect(() => {
    if (!data || !pieCanvasRef.current) return;
    const values = pieTopics.map(
      (t) => Math.round(((data.learningTimeMinutes[t.id] || 0) / 60) * 10) / 10
    );
    const hasData = values.some((v) => v > 0);
    if (pieChartRef.current) {
      pieChartRef.current.destroy();
      pieChartRef.current = null;
    }
    if (!hasData) return;

    const colors = pieTopics.map((t) => TIME_COLORS[t.id]);
    pieChartRef.current = new Chart(pieCanvasRef.current.getContext('2d'), {
      type: 'pie',
      data: {
        labels: pieTopics.map((t) => t.name),
        datasets: [{ data: values, backgroundColor: colors, borderColor: '#fff', borderWidth: 2 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 900, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => `${c.label}: ${c.parsed}h` } },
        },
      },
    });
    return () => pieChartRef.current?.destroy();
  }, [data, pieTopics]);

  if (!data) return null;

  const { completed, total } = computeTotals(data);
  const avgScore = computeAverageScore(data);
  const streak = computeStreak(data);
  const hours = computeTotalLearningHours(data);
  const rec = data.recommendedMajor;

  const pieValues = pieTopics.map(
    (t) => Math.round(((data.learningTimeMinutes[t.id] || 0) / 60) * 10) / 10
  );
  const pieColors = pieTopics.map((t) => TIME_COLORS[t.id]);
  const pieHasData = pieValues.some((v) => v > 0);

  return (
    <div className="page-shell">
      <Header />
      <div className="dashboard-wrap page-shell-main">
        <header className="dashboard-header">
          <div>
            <h1>Welcome back, {user ? user.displayName : 'Student'}!</h1>
            <p className="subtitle">
              {user ? (
                "Here's your learning progress and achievements."
              ) : (
                <>
                  You're browsing as a guest — progress is saved on this device only.{' '}
                  <a href="/sign-in">Sign in</a> to save it to your account.
                </>
              )}
            </p>
          </div>
          <button
            className="btn btn-continue"
            type="button"
            onClick={() => navigate(findContinueLearningUrl(data))}
          >
            <i className="bi bi-play-fill"></i> Continue Learning
          </button>
        </header>

        <section className="row g-3 section-gap">
          <div className="col-6 col-lg-3">
            <div className="card-panel stat-card hoverable reveal-on-scroll">
              <div className="stat-top">
                <div className="stat-icon bg-blue">
                  <i className="bi bi-journal-check"></i>
                </div>
                <span className="stat-badge">of {total}</span>
              </div>
              <div className="stat-value">{completed}</div>
              <div className="stat-label">Lessons Completed</div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="card-panel stat-card hoverable reveal-on-scroll">
              <div className="stat-top">
                <div className="stat-icon bg-orange">
                  <i className="bi bi-percent"></i>
                </div>
                <span className="stat-badge">Average</span>
              </div>
              <div className="stat-value">{avgScore}%</div>
              <div className="stat-label">Quiz Score Average</div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="card-panel stat-card hoverable reveal-on-scroll">
              <div className="stat-top">
                <div className="stat-icon bg-pink">
                  <i className="bi bi-fire"></i>
                </div>
                <span className="stat-badge">{streak === 1 ? 'Day' : 'Days'}</span>
              </div>
              <div className="stat-value">{streak}</div>
              <div className="stat-label">Current Streak</div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="card-panel stat-card hoverable reveal-on-scroll">
              <div className="stat-top">
                <div className="stat-icon bg-purple">
                  <i className="bi bi-clock-history"></i>
                </div>
                <span className="stat-badge">Hours</span>
              </div>
              <div className="stat-value">{hours}</div>
              <div className="stat-label">Learning Time</div>
            </div>
          </div>
        </section>

        <section className="row g-3 section-gap">
          <div className="col-lg-8">
            <div className="card-panel chart-card hoverable reveal-on-scroll">
              <div className="panel-title">
                <i className="bi bi-graph-up-arrow"></i> Performance Trend
              </div>
              <p className="panel-subtitle">Your quiz scores over the past 6 weeks</p>
              <canvas ref={perfCanvasRef} height="110"></canvas>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card-panel recommend-card reveal-on-scroll">
              <div className="recommend-eyebrow">
                <i className="bi bi-star-fill"></i> Recommended Major
              </div>
              <div className="recommend-major-row">
                <span className="recommend-major-name">{rec ? rec.name : 'Not yet available'}</span>
                <span className="recommend-percent">{rec ? `${rec.percent}%` : ''}</span>
              </div>
              <div className="recommend-progress">
                <span style={{ width: `${rec ? rec.percent : 0}%` }}></span>
              </div>
              <div className="panel-subtitle" style={{ color: '#3c6a1e', marginBottom: '8px' }}>
                Based on:
              </div>
              <ul className="recommend-reasons">
                {rec ? (
                  rec.reasons.map((r) => (
                    <li key={r}>
                      <i className="bi bi-check-circle-fill"></i>
                      <span>{r}</span>
                    </li>
                  ))
                ) : (
                  <li>
                    <i className="bi bi-info-circle-fill"></i>
                    <span>Take a lesson quiz to get a personalized major recommendation.</span>
                  </li>
                )}
              </ul>
              <button className="btn btn-retake" type="button" onClick={() => navigate('/quiz')}>
                Retake Quiz
              </button>
            </div>
          </div>
        </section>

        <section className="row g-3 section-gap">
          <div className="col-lg-8">
            <div className="card-panel hoverable reveal-on-scroll">
              <div className="panel-title">Topic Progress</div>
              <p className="panel-subtitle">Your completion status across DSA topics</p>
              <div>
                {TOPICS.map((topic) => {
                  const c = data.completedLessons[topic.id] || 0;
                  const pct = Math.round((c / topic.total) * 100);
                  return (
                    <a key={topic.id} href={topic.lessonUrl} className="topic-row reveal-on-scroll">
                      <div className="topic-row-top">
                        <span className="topic-name">{topic.name}</span>
                        <span className="topic-count">
                          {c} / {topic.total}
                        </span>
                      </div>
                      <div className="progress-track">
                        <span style={{ width: `${pct}%` }}></span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="col-lg-4 d-flex flex-column gap-3">
            <div className="card-panel hoverable reveal-on-scroll">
              <div className="panel-title">Recent Activity</div>
              <p className="panel-subtitle">Your latest milestones</p>
              <div className="activity-list">
                {data.recentActivity.length === 0 ? (
                  <p className="panel-subtitle" style={{ margin: 0 }}>
                    No activity yet — start a lesson to see it show up here.
                  </p>
                ) : (
                  data.recentActivity.map((item, i) => {
                    const meta = ACTIVITY_ICON[item.type] || ACTIVITY_ICON.lesson;
                    const Tag = item.link ? 'a' : 'div';
                    return (
                      <Tag
                        key={i}
                        className="activity-item reveal-on-scroll"
                        href={item.link || undefined}
                      >
                        <div className={`activity-icon ${meta.cls}`}>
                          <i className={`bi ${meta.icon}`}></i>
                        </div>
                        <div>
                          <div className="activity-text">{item.text}</div>
                          <div className="activity-time">{timeAgo(item.timestamp)}</div>
                        </div>
                      </Tag>
                    );
                  })
                )}
              </div>
            </div>

            <div className="card-panel hoverable reveal-on-scroll">
              <div className="panel-title" style={{ marginBottom: '14px' }}>
                Quick Actions
              </div>
              <div className="quick-actions">
                <button className="btn-quick" type="button" onClick={() => navigate('/learn')}>
                  <i className="bi bi-diagram-3-fill"></i> Browse Lessons
                </button>
                <button className="btn-quick" type="button" onClick={() => navigate('/quiz')}>
                  <i className="bi bi-compass-fill"></i> Take a Quiz
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="row g-3">
          <div className="col-lg-8 mx-lg-auto">
            <div className="card-panel pie-card hoverable reveal-on-scroll">
              <div className="panel-title">
                <i className="bi bi-pie-chart-fill"></i> Time Distribution
              </div>
              <p className="panel-subtitle">Hours spent on each topic</p>
              <canvas
                ref={pieCanvasRef}
                height="220"
                style={{ display: pieHasData ? 'block' : 'none' }}
              ></canvas>
              {!pieHasData && (
                <p className="panel-subtitle" style={{ margin: 0 }}>
                  No learning time logged yet — it'll show up here once you start a lesson.
                </p>
              )}
              {pieHasData && (
                <div className="pie-legend">
                  {pieTopics.map((t, i) => (
                    <span key={t.id}>
                      <span className="dot" style={{ background: pieColors[i] }}></span>
                      {t.name}: {pieValues[i]}h
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
