import { useNavigate } from 'react-router-dom';

export default function LessonHero({ title, subtitle }) {
  const navigate = useNavigate();

  return (
    <section className="hero-section">
      <div className="container">
        <div className="row align-items-center gy-4">
          <div className="col-lg-7 fade-in">
            <h1 className="hero-title">{title}</h1>
            <p className="hero-subtitle">{subtitle}</p>
            <div className="hero-actions">
              <button className="btn btn-hero btn-hero-outline" onClick={() => navigate(-1)}>
                <i className="bi bi-arrow-left"></i> Back
              </button>
              <button
                className="btn btn-hero btn-hero-primary"
                onClick={() => document.querySelector('.page-content section.content-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                Start learning
              </button>
              <button
                className="btn btn-hero btn-hero-outline"
                onClick={() => document.getElementById('code-example')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                View Example
              </button>
            </div>
          </div>

          <div className="col-lg-5 fade-in">
            <div className="hero-illustration">
              <i className="bi bi-chat-dots-fill bubble bubble-1"></i>
              <span className="bubble bubble-2"></span>
              <span className="bubble bubble-3"></span>

              <svg viewBox="0 0 360 300" className="student-svg" role="img" aria-label="Illustration of a student coding on a laptop">
                <ellipse cx="180" cy="270" rx="140" ry="16" fill="#dfeaff" />
                <rect x="18" y="200" width="34" height="46" rx="6" fill="#c9d8ef" />
                <path d="M35 200 C 10 170, 10 140, 35 120 C 60 140, 60 170, 35 200 Z" fill="#79c58f" />
                <path d="M35 200 C 55 180, 55 150, 35 130" stroke="#5aa876" strokeWidth="3" fill="none" />
                <rect x="120" y="215" width="150" height="14" rx="4" fill="#5b6ee8" />
                <rect x="140" y="150" width="110" height="70" rx="6" fill="#2a3a8f" />
                <rect x="148" y="158" width="94" height="54" rx="3" fill="#eef2ff" />
                <rect x="160" y="168" width="28" height="8" rx="2" fill="#5b6ee8" />
                <rect x="160" y="182" width="60" height="6" rx="2" fill="#9aa8f2" />
                <rect x="160" y="192" width="45" height="6" rx="2" fill="#9aa8f2" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
