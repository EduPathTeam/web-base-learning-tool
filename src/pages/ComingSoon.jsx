import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/learn.css';

// Honest placeholder for pages not yet migrated to React (standalone Quiz
// hub, Sign In, Feedback, About, Test Code). Says clearly what it is —
// not a fake working feature.
export default function ComingSoon({ title }) {
  return (
    <div className="page-shell">
      <Header />
      <main className="container page-content page-shell-main" style={{ paddingTop: '160px', textAlign: 'center' }}>
        <h1>{title}</h1>
        <p style={{ color: '#5a5f73' }}>This page hasn't been migrated to the new React frontend yet.</p>
        <Link to="/" className="btn btn-hero btn-hero-primary" style={{ display: 'inline-block', marginTop: '16px' }}>
          Back to Home
        </Link>
      </main>
      <Footer />
    </div>
  );
}
