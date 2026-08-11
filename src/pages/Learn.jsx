import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import useScrollReveal from '../hooks/useScrollReveal';
import '../styles/learn.css';

const DATA_STRUCTURE_LESSONS = [
  { label: 'Array', to: '/learn/array', ready: true },
  { label: 'Linked List', to: '/learn/linked-list', ready: true },
  { label: 'Queue', to: '/learn/queue', ready: true },
  { label: 'Stack', to: '/learn/stack', ready: true },
  { label: 'Tree', to: '/learn/tree', ready: true },
  { label: 'Graph', to: '/learn/graph', ready: true },
];

const ALGORITHM_LESSONS = [
  { label: 'Recursion', to: '/learn/recursion', ready: true },
  { label: 'Big-O Notation', to: '/learn/big-o', ready: true },
  { label: 'Dynamic Programming', to: '/learn/dynamic-programming', ready: true },
  { label: 'Sorting Algorithm', to: '/learn/sorting', ready: true },
  { label: 'Searching Algorithm', to: '/learn/searching', ready: true },
  { label: 'Greedy Algorithm', to: '/learn/greedy', ready: true },
];

function LessonButton({ lesson }) {
  if (lesson.ready) {
    return <Link to={lesson.to} className="lesson-btn">{lesson.label}</Link>;
  }
  return <button type="button" className="lesson-btn" disabled title="Coming soon">{lesson.label} <small>(soon)</small></button>;
}

export default function Learn() {
  useScrollReveal();

  return (
    <div className="page-shell" data-nav-section="learn">
      <Header navSection="learn" />

      <div className="container-fluid page-wrapper page-shell-main">
        <header className="page-header">
          <h1 className="page-title">lessons</h1>
        </header>

        <div className="content-row">
          <section className="lesson-col">
            <div className="lesson-wrapper">
              <div className="section-header-pill header-green">
                <span className="header-icon"><i className="bi bi-database-fill"></i></span>
                <span className="header-text">Data Structure</span>
              </div>
              <div className="lesson-card card-green">
                {DATA_STRUCTURE_LESSONS.map((l) => <LessonButton key={l.to} lesson={l} />)}
              </div>
            </div>
          </section>

          <div className="divider-col"><div className="vertical-divider"></div></div>

          <section className="lesson-col">
            <div className="lesson-wrapper">
              <div className="section-header-pill header-blue">
                <span className="header-icon"><i className="bi bi-gear-fill"></i></span>
                <span className="header-text">Algorithm</span>
              </div>
              <div className="lesson-card card-blue">
                {ALGORITHM_LESSONS.map((l) => <LessonButton key={l.to} lesson={l} />)}
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
