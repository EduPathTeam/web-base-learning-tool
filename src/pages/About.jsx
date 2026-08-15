import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import useScrollReveal from '../hooks/useScrollReveal';
import '../styles/about.css';

const IMPACT_STATS = [
  { icon: 'bi-people-fill', target: 10000, suffix: '+', label: 'Active Students' },
  { icon: 'bi-collection-fill', target: 60, suffix: '+', label: 'Lessons Created' },
  { icon: 'bi-graph-up-arrow', target: 95, suffix: '%', label: 'Avg Success Rate' },
  { icon: 'bi-briefcase-fill', target: 500, suffix: '+', label: 'Career Matches' },
];

function ImpactCounter({ target, suffix, icon, label }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const duration = 1200;
            const start = performance.now();
            function tick(now) {
              const progress = Math.min(1, (now - start) / duration);
              setValue(Math.round(target * progress));
              if (progress < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div className="col-lg-3 col-sm-6 reveal visible" ref={ref}>
      <div className="impact-card">
        <i className={`bi ${icon}`}></i>
        <div className="impact-number">
          {value}
          {suffix}
        </div>
        <div className="impact-label">{label}</div>
      </div>
    </div>
  );
}

export default function About() {
  useScrollReveal();

  return (
    <div className="page-shell">
      <Header />

      <div className="page-shell-main">
        <section
          className="hero-section d-flex align-items-center justify-content-center text-center"
          style={{ paddingTop: '100px' }}
        >
          <div className="container">
            <div className="d-flex flex-column align-items-center justify-content-center gap-3 gap-md-4">
              <div className="reveal visible">
                <h1>About Our Learning Platform</h1>
                <p>
                  Our Platform is designed to help students understand{' '}
                  <span className="text-highlight">Data Structure and Algorithm</span> in a simple
                  and interactive way.
                </p>
                <Link to="/learn" className="btn btn-primary-custom mt-2">
                  Start learning
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="story-section section-pad">
          <div className="container">
            <div className="row align-items-center gy-4">
              <div className="col-lg-6 reveal visible">
                <h2 className="mb-4">Our Story</h2>
                <p>
                  DSA PathFinder was born from a simple observation: too many talented students
                  struggle with Data Structures &amp; Algorithms because traditional learning
                  methods are dry, confusing, and disconnected from real-world applications.
                </p>
                <p>
                  We created a platform that combines interactive visualizations, hands-on coding
                  challenges, and personalized career guidance to make DSA learning engaging and
                  purposeful.
                </p>
                <p>
                  Today, DSA PathFinder aims to serve students worldwide, helping them build strong
                  foundations in computer science while discovering careers in IT, Information
                  Technology Engineering, and Data Science.
                </p>
              </div>
              <div className="col-lg-6 reveal visible">
                <img
                  className="gradient"
                  style={{ borderRadius: 10 }}
                  src="/images/istockphoto-487018282-612x612.jpg"
                  alt="Students collaborating on a laptop"
                  width="460"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="section-pad pt-0">
          <div className="container">
            <div className="mission-card reveal visible">
              <div className="row align-items-center gy-4">
                <div className="col-lg-7">
                  <h2 className="mb-3">Our Mission</h2>
                  <p>
                    Our mission is to make{' '}
                    <span className="text-highlight-blue">Data Structure and Algorithm</span> easy
                    to understand for every student.
                  </p>
                  <p className="mb-0">
                    We provide visual explanations, coding examples, and interactive exercises to
                    improve problem-solving skills.
                  </p>
                </div>
                <div className="col-lg-5">
                  <div className="mission-illustration">
                    <img
                      className="missionImage"
                      src="/images/mission-word-on-wood-table-for-business-concept-free-photo.jpg"
                      alt="Mission statement written on a wooden table"
                      width="490"
                      height="280"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-pad pt-0">
          <div className="container">
            <h2 className="mb-4 reveal visible">What You Can Learn</h2>
            <div className="row gy-4">
              <div className="col-lg-3 col-sm-6 reveal visible">
                <div className="learn-card">
                  <div className="icon-badge badge-peach">
                    <i className="bi bi-archive-fill"></i>
                  </div>
                  <h5>Data Structure</h5>
                  <ul>
                    <li>Array</li>
                    <li>Linked List</li>
                    <li>Queue</li>
                    <li>Stack</li>
                    <li>Tree</li>
                    <li>Graph</li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-3 col-sm-6 reveal visible">
                <div className="learn-card">
                  <div className="icon-badge badge-blue">
                    <i className="bi bi-diagram-3-fill"></i>
                  </div>
                  <h5>Algorithm</h5>
                  <ul>
                    <li>Sorting Algorithms</li>
                    <li>Searching Algorithms</li>
                    <li>Dynamic Programming</li>
                    <li>Greedy Algorithms</li>
                    <li>Recursion</li>
                    <li>Big-O Notation</li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-3 col-sm-6 reveal visible">
                <div className="learn-card">
                  <div className="icon-badge badge-mint">
                    <i className="bi bi-code-slash"></i>
                  </div>
                  <h5>Coding Practice</h5>
                  <ul>
                    <li>Solving Problems</li>
                    <li>Write your own code</li>
                    <li>Test your solution</li>
                  </ul>
                  <Link className="btn btn-primary-custom" to="/learn/array">
                    Try a Lesson
                  </Link>
                </div>
              </div>
              <div className="col-lg-3 col-sm-6 reveal visible">
                <div className="learn-card">
                  <div className="icon-badge badge-lav">
                    <i className="bi bi-magic"></i>
                  </div>
                  <h5>Interactive Learning</h5>
                  <ul>
                    <li>Visual animations</li>
                    <li>Step-by-step Explanations</li>
                    <li>Quizzes and challenges</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

      <section className="section-pad pt-0">
        <div className="container">
          <div className="team-card reveal visible">
            <h4 className="mb-4">Meet Our Team</h4>
            <div className="row gy-3">
              <div className="col-4 team-member">
                <div className="avatar-circle">CM</div>
                <h6>Chantha Sreyneang</h6>
                <div className="role">Frontend Developer</div>
                <div className="desc">Focused on building responsive, user-friendly interfaces and delivering seamless user experiences.</div>
              </div>
              <div className="col-4 team-member">
                <div className="avatar-circle">CS</div>
                <h6>Chey Menghout</h6>
                <div className="role">Backend Developer</div>
                <div className="desc">Responsible for developing secure, scalable backend systems and managing application data flow.</div>
              </div>
              <div className="col-4 team-member">
                <div className="avatar-circle">ML</div>
                <h6>Chang Minhlaing</h6>
                <div className="role">UX/UI Designer</div>
                <div className="desc">Designing intuitive and visually engaging user experiences that enhance learning and accessibility.</div>
              </div>
            </div>
          </div>
        </div>
        </section>

        <section className="stand-for-section section-pad">
          <div className="container text-center">
            <h2 className="reveal visible">What We Stand For</h2>
            <p className="reveal visible">Our guiding principles that drive everything we do</p>
            <div className="row gy-4 mt-2">
              <div className="col-lg-4 reveal visible">
                <div className="value-card">
                  <div className="value-icon badge-blue">
                    <i className="bi bi-bullseye"></i>
                  </div>
                  <h5>Our Mission</h5>
                  <p className="mb-0">
                    To make Data Structures &amp; Algorithms education accessible and engaging for
                    every student, while helping them discover their ideal tech career path.
                  </p>
                </div>
              </div>
              <div className="col-lg-4 reveal visible">
                <div className="value-card">
                  <div className="value-icon badge-lav">
                    <i className="bi bi-eye-fill"></i>
                  </div>
                  <h5>Our Vision</h5>
                  <p className="mb-0">
                    A world where every student has the knowledge and confidence to pursue their
                    dream career in technology, equipped with solid DSA foundations.
                  </p>
                </div>
              </div>
              <div className="col-lg-4 reveal visible">
                <div className="value-card">
                  <div className="value-icon badge-mint">
                    <i className="bi bi-check-circle-fill"></i>
                  </div>
                  <h5>Our Values</h5>
                  <p className="mb-0">
                    Student-first approach, interactive learning, personalized guidance, and making
                    complex concepts simple and fun to learn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-pad">
          <div className="container text-center">
            <h2 className="reveal visible">Our Impact</h2>
            <p className="reveal visible">Goals we're working toward as the platform grows</p>
            <div className="row gy-4 mt-2">
              {IMPACT_STATS.map((s) => (
                <ImpactCounter key={s.label} {...s} />
              ))}
            </div>
          </div>
        </section>

        <section className="cta-section reveal visible">
          <div className="container">
            <h2>Join Our Learning Community</h2>
            <p>
              Start your journey to mastering Data Structures &amp; Algorithms and discovering your
              perfect tech career path today.
            </p>
            <div className="cta-buttons">
              <Link to="/learn" style={{ textDecoration: 'none' }} className="a1 btn-dark-custom">
                Start learning
              </Link>
              <Link
                to="/quiz"
                style={{ textDecoration: 'none' }}
                className="a1 btn-outline-light-custom"
              >
                Take a Quiz
              </Link>
            </div>
          </div>
        </section>

        <Link to="/feedback" className="feedback-fab" title="Send feedback">
          ?
        </Link>
      </div>

      <Footer />
    </div>
  );
}
