import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import useScrollReveal from '../hooks/useScrollReveal';
import '../styles/home.css';

// Only Data Structure & Algorithm is a real, built-out subject this
// semester (see SEMESTER_2_PROJECT_REPORT.md — scope was narrowed to DSA
// only). The other cards stay in the carousel for visual completeness but
// are clearly marked "Coming soon" rather than linking to content that
// doesn't exist, so the carousel never makes a promise it can't keep.
const COURSES = [
  { title: 'Data Structure & Algorithm', icon: 'bi-diagram-3', color: '#8B5CF6', to: '/learn' },
  { title: 'Python', icon: 'bi-filetype-py', color: '#63B3ED', to: null },
  { title: 'Java', icon: 'bi-cup-hot', color: '#E9A23B', to: null },
  { title: 'HTML & CSS', icon: 'bi-code-slash', color: '#F0653D', to: null },
  { title: 'Database', icon: 'bi-hdd-stack', color: '#374151', to: null },
];

// How many cards to show at once, by breakpoint — matches the CSS
// breakpoints in home.css (992px / 576px). Desktop shows 3 (one before and
// one after the selected subject), tablet shows 2, mobile shows 1, so the
// carousel never has to overflow or squeeze cards to fit.
function getVisibleCount() {
  if (typeof window === 'undefined') return 3;
  if (window.innerWidth >= 992) return 3;
  if (window.innerWidth >= 576) return 2;
  return 1;
}

// Returns the indices (into COURSES) that should be visible right now, as
// a flat window centered on `current` — e.g. count=3 gives
// [current-1, current, current+1] (wrapped), so the selected card is
// always in the same middle slot and nothing has to reflow around it.
function getVisibleIndices(current, n, count) {
  const shown = Math.min(count, n);
  const before = Math.floor((shown - 1) / 2);
  const indices = [];
  for (let i = -before; i < shown - before; i++) {
    indices.push((((current + i) % n) + n) % n);
  }
  return indices;
}

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [visibleCount, setVisibleCount] = useState(getVisibleCount);
  const timerRef = useRef(null);
  const navigate = useNavigate();
  useScrollReveal([current]);

  useEffect(() => {
    function handleResize() {
      setVisibleCount(getVisibleCount());
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function next() {
    setCurrent((c) => (c + 1) % COURSES.length);
  }
  function prev() {
    setCurrent((c) => (c - 1 + COURSES.length) % COURSES.length);
  }

  function resetAuto() {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 4000);
  }

  useEffect(() => {
    timerRef.current = setInterval(next, 4000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Clicking a side card brings it to center (like the dots); clicking the
  // already-centered card navigates to its subject if one is built yet.
  function handleCardActivate(course, index) {
    if (index !== current) {
      setCurrent(index);
      resetAuto();
      return;
    }
    if (course.to) navigate(course.to);
  }

  function handleCardKeyDown(e, course, index) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardActivate(course, index);
    }
  }

  return (
    <div className="page-shell">
      <Header />

      <div className="page-shell-main">
        <section className="hero">
          <div className="container">
            <div className="carousel-wrap">
              <button
                className="nav-arrow"
                aria-label="Previous"
                onClick={() => {
                  prev();
                  resetAuto();
                }}
              >
                <i className="bi bi-arrow-left"></i>
              </button>
              <div className="carousel-3d">
                <div className="carousel-track">
                  {getVisibleIndices(current, COURSES.length, visibleCount).map((i) => {
                    const c = COURSES[i];
                    const isCentered = i === current;
                    const label = c.to
                      ? isCentered
                        ? `Go to ${c.title} lessons`
                        : `Select ${c.title}`
                      : isCentered
                        ? `${c.title} — coming soon`
                        : `Select ${c.title}`;
                    return (
                      <div
                        key={c.title}
                        className={`course-card${isCentered ? ' is-active' : ''}${isCentered && !c.to ? ' is-soon' : ''}`}
                        role="button"
                        tabIndex={0}
                        aria-label={label}
                        title={isCentered && !c.to ? 'Coming soon' : undefined}
                        onClick={() => handleCardActivate(c, i)}
                        onKeyDown={(e) => handleCardKeyDown(e, c, i)}
                      >
                        <div className="icon-wrap" style={{ background: c.color }}>
                          <i className={`bi ${c.icon}`}></i>
                        </div>
                        <div className="title">{c.title}</div>
                        {isCentered && (
                          <div className="card-cta">
                            {c.to ? (
                              <span className="cta-ready">
                                <i className="bi bi-arrow-right-circle-fill"></i> Start learning
                              </span>
                            ) : (
                              <span className="cta-soon">Coming soon</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <button
                className="nav-arrow"
                aria-label="Next"
                onClick={() => {
                  next();
                  resetAuto();
                }}
              >
                <i className="bi bi-arrow-right"></i>
              </button>
            </div>
            <div className="indicators">
              {COURSES.map((c, i) => (
                <button
                  key={c.title}
                  className={`dot${i === current ? ' active' : ''}`}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => {
                    setCurrent(i);
                    resetAuto();
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="intro">
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-lg-6 fade-in">
                <h1 className="intro-heading">
                  Learn Core Computing Subjects
                  <br />
                  &amp; Discover Your <span className="highlight">Tech Path</span>
                </h1>
                <p className="intro-text">
                  Core computing subjects including data structures, databases, programming, and
                  statistics while discovering the right tech path for your future. Learn through
                  interactive lessons designed to build strong problem-solving and analytical
                  skills.
                </p>
                <button
                  className="btn-start"
                  onClick={() => document.getElementById('features')?.scrollIntoView()}
                >
                  Start learning <i className="bi bi-arrow-right"></i>
                </button>
              </div>
              <div className="col-lg-6 fade-in">
                <div className="subject-grid">
                  <div className="subject-card sc-1">
                    <i className="bi bi-hdd-stack"></i>
                  </div>
                  <div className="subject-card sc-2">
                    <i className="bi bi-diagram-3"></i>
                  </div>
                  <div className="subject-card sc-3">
                    <i className="bi bi-filetype-py"></i>
                  </div>
                  <div className="subject-card sc-4">
                    <i className="bi bi-cup-hot"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="quick-actions">
          <div className="container">
            <div className="row g-3 justify-content-center">
              <div className="col-sm-4 fade-in">
                <button className="qa-btn qa-1" onClick={() => navigate('/learn')}>
                  <i className="bi bi-journal-bookmark"></i> Browse Subjects
                </button>
              </div>
              <div className="col-sm-4 fade-in">
                <button
                  className="qa-btn qa-2"
                  onClick={() =>
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  <i className="bi bi-signpost-split"></i> Explore Learning Paths
                </button>
              </div>
              <div className="col-sm-4 fade-in">
                <button className="qa-btn qa-3" onClick={() => navigate('/dashboard')}>
                  <i className="bi bi-speedometer2"></i> Go to your dashboard
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="features" id="features">
          <div className="container text-center">
            <h2 className="fade-in">Everything You Need to Succeed</h2>
            <p className="subtitle fade-in">
              Comprehensive tools and resources to learn computing subjects and plan your academic
              and professional journey.
            </p>
            <div className="row g-4 mt-4">
              <div className="col-md-4 fade-in">
                <div className="feature-card fc-green">
                  <div className="f-icon" style={{ background: '#fff', color: '#2f9e5c' }}>
                    <i className="bi bi-diagram-3-fill"></i>
                  </div>
                  <h4>Learn DSA</h4>
                  <p>
                    Master data structures and algorithms with interactive lessons and hands-on
                    practice problems.
                  </p>
                  <span className="fc-tag">01</span>
                </div>
              </div>
              <div className="col-md-4 fade-in">
                <div className="feature-card fc-yellow">
                  <div className="f-icon" style={{ background: '#fff', color: '#c99a1e' }}>
                    <i className="bi bi-stars"></i>
                  </div>
                  <h4>Visualizers</h4>
                  <p>
                    Watch algorithms come to life with step-by-step animated visualizations that
                    build intuition.
                  </p>
                  <span className="fc-tag">02</span>
                </div>
              </div>
              <div className="col-md-4 fade-in">
                <div className="feature-card fc-pink">
                  <div className="f-icon" style={{ background: '#fff', color: '#c94b7c' }}>
                    <i className="bi bi-compass"></i>
                  </div>
                  <h4>Discover Your Major</h4>
                  <p>
                    Take a personalized quiz to find out which IT major matches your strengths and
                    interests.
                  </p>
                  <span className="fc-tag">03</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="container fade-in">
            <h2>Ready to Start Your Journey?</h2>
            <p>
              Start with our interactive lessons or jump straight to the visualizer to see
              algorithms in action.
            </p>
            <div className="cta-buttons">
              <button className="btn-outline-cta" onClick={() => navigate('/dashboard')}>
                View dashboard
              </button>
              <div className="cta-divider">
                <span className="line"></span>
                <i className="bi bi-arrow-right"></i>
                <span className="line"></span>
              </div>
              <button className="btn-outline-cta" onClick={() => navigate('/learn')}>
                Explore major
              </button>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
