import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import QuizSection from '../components/lessons/QuizSection';
import useScrollReveal from '../hooks/useScrollReveal';
import { TOPICS } from '../lib/csPlatform';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import '../styles/learn.css';
import '../styles/array.css';
import '../styles/quiz.css';

// Standalone quiz route (/quiz/:topicId), separate from the lesson page it
// covers. Lessons link here via a "Take Quiz" button instead of embedding
// the quiz inline, so Learn (content) and Quiz (assessment) are two
// distinct steps in the flow: Home -> Learn -> Lesson -> Take Quiz -> Quiz
// page -> Submit -> Score/Feedback -> Dashboard.
export default function QuizPage() {
  useScrollReveal();
  const { topicId } = useParams();
  const topic = TOPICS.find((t) => t.id === topicId);
  const questions = QUIZ_QUESTIONS[topicId];

  if (!topic || !questions) {
    return (
      <div className="page-shell">
        <Header />
        <main className="container page-content page-shell-main" style={{ paddingTop: '140px' }}>
          <section className="content-card fade-in">
            <h1 className="section-title">Quiz not found</h1>
            <p className="section-text">That topic doesn't have a quiz yet.</p>
            <Link to="/quiz" className="btn btn-hero btn-hero-primary">Back to Quizzes</Link>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Header />

      <main className="container page-content page-shell-main" style={{ paddingTop: '140px' }}>
        <section className="content-card fade-in" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <h1 className="section-title" style={{ marginBottom: 4 }}>{topic.name} Quiz</h1>
            <p className="section-text" style={{ margin: 0 }}>5 questions &middot; test what you learned in the {topic.name} lesson.</p>
          </div>
          <Link to={topic.lessonUrl} className="btn btn-hero btn-hero-outline">
            <i className="bi bi-arrow-left"></i> Back to Lesson
          </Link>
        </section>

        <QuizSection topicId={topicId} questions={questions} />
      </main>

      <Footer />
    </div>
  );
}
