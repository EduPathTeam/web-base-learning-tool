import { Link } from 'react-router-dom';

// Same markup/classes/links as the static site's footer (already fixed to
// real paths for the Platform column during the previous static build).
export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="row g-4">
          <div className="col-6 col-lg-3">
            <div className="d-flex align-items-center gap-2 mb-3">
              <img
                src="/images/icon.png"
                alt="Company Logo"
                width="50"
                height="50"
                style={{ borderRadius: '10px' }}
              />
              <strong className="text-white">EduPath</strong>
            </div>
            <p style={{ fontSize: '.8rem', color: '#9aa0bd' }}>
              Empowering high school students to master Data Structures &amp; Algorithms and
              discover their tech path with interactive learning, roadmaps, and personalized
              quizzes.
            </p>
            <p style={{ fontSize: '.78rem', marginBottom: '.2rem' }}>
              <i className="bi bi-envelope-fill me-2"></i>email@gmail.com
            </p>
            <p style={{ fontSize: '.78rem' }}>
              <i className="bi bi-telephone-fill me-2"></i>+855 123456789
            </p>
          </div>
          <div className="col-6 col-lg-3">
            <h6>Platform</h6>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/learn">Learn DSA</Link>
              </li>
              <li>
                <Link to="/quiz">Take quiz</Link>
              </li>
              <li>
                <Link to="/dashboard">Dashboard</Link>
              </li>
            </ul>
          </div>
          <div className="col-6 col-lg-3">
            <h6>Resources</h6>
            <ul>
              <li>
                <a href="#">Major information</a>
              </li>
              <li>
                <a href="#">Career paths</a>
              </li>
              <li>
                <a href="#">Learning materials</a>
              </li>
              <li>
                <a href="#">Practice problem</a>
              </li>
            </ul>
          </div>
          <div className="col-6 col-lg-3">
            <h6>Support</h6>
            <ul>
              <li>
                <a href="#">FeedBack</a>
              </li>
              <li>
                <a href="#">Help Centers</a>
              </li>
              <li>
                <a href="#">Privacy Policy</a>
              </li>
              <li>
                <a href="#">Terms of Service</a>
              </li>
              <li>
                <a href="#">Community</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <div className="footer-social">
            <a href="#">
              <i className="bi bi-facebook"></i>
            </a>
            <a href="#">
              <i className="bi bi-instagram"></i>
            </a>
            <a href="#">
              <i className="bi bi-tiktok"></i>
            </a>
            <a href="#">
              <i className="bi bi-github"></i>
            </a>
            <a href="#">
              <i className="bi bi-google"></i>
            </a>
          </div>
          <span>
            Royal University of Phnom Penh &middot; © 2026 Learning Tool. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
