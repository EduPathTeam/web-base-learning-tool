import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import useScrollReveal from '../hooks/useScrollReveal';
import { TOPICS, getData } from '../lib/csPlatform';
import '../styles/learn.css';
import '../styles/array.css';
import '../styles/quiz.css';

// Quiz is a separate step from the lesson content: each topic has its own
// standalone quiz page at /quiz/:topicId (src/pages/QuizPage.jsx). This hub
// is the entry point — pick a topic, answer 5 questions, submit, see your
// score, and your best score per topic is saved to the Dashboard.
export default function QuizHub() {
  useScrollReveal();
  const data = getData();

  return (
    <div className="page-shell">
      <Header />

      <main className="container page-content page-shell-main" style={{ paddingTop: '140px' }}>
        <section className="content-card fade-in">
          <h1 className="section-title" style={{ fontSize: '2rem' }}>
            Quizzes
          </h1>
          <p className="section-text">
            Every topic has its own 5-question quiz, separate from its lesson. Pick a topic below to
            start — your best score is saved to your Dashboard automatically.
          </p>
        </section>

        <section className="content-card fade-in">
          <div className="row g-3">
            {TOPICS.map((topic) => {
              const scores = data.quizResults[topic.id] || [];
              const best = scores.length ? Math.max(...scores) : null;
              return (
                <div key={topic.id} className="col-6 col-lg-4">
                  <Link
                    to={topic.quizUrl}
                    className="op-card op-gray"
                    style={{ display: 'block', textDecoration: 'none' }}
                  >
                    <h5 style={{ marginBottom: 4 }}>{topic.name}</h5>
                    <p style={{ margin: 0 }}>
                      {best !== null ? `Best score: ${best}%` : 'Not attempted yet'}
                    </p>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
