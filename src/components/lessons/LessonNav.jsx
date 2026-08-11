import { Link } from 'react-router-dom';

export default function LessonNav({ prev, next }) {
  return (
    <section className="fade-in" id="lesson-nav">
      <div className="lesson-nav-row">
        {prev ? (
          <Link to={prev.to} className="lesson-nav-link prev">
            <span className="lesson-nav-label">
              <i className="bi bi-arrow-left"></i> Previous
            </span>
            <span className="lesson-nav-title">{prev.label}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={next.to} className="lesson-nav-link next">
            <span className="lesson-nav-label">
              Next <i className="bi bi-arrow-right"></i>
            </span>
            <span className="lesson-nav-title">{next.label}</span>
          </Link>
        ) : (
          <span />
        )}
      </div>
    </section>
  );
}
