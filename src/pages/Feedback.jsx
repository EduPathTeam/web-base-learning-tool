import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import useScrollReveal from '../hooks/useScrollReveal';
import { submitFeedback as saveFeedbackLocally } from '../lib/feedbackStore';
import { apiPost } from '../lib/apiClient';
import '../styles/learn.css';
import '../styles/feedback.css';

export default function Feedback() {
  useScrollReveal();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('General Feedback');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      // Real submission to the server/ API (persisted to MySQL). Also kept
      // in localStorage as a local copy the way the rest of this app's
      // progress data works, but the server call is what actually counts.
      await apiPost('/feedback', { name, email, category, rating, message });
      saveFeedbackLocally({ name, email, category, rating, message });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Could not send feedback — please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setName('');
    setEmail('');
    setCategory('General Feedback');
    setRating(0);
    setMessage('');
    setSubmitted(false);
  }

  const displayRating = hoverRating || rating;

  return (
    <div className="page-shell">
      <Header />

      <div className="page-shell-main">
        <section className="hero-section section-pad" style={{ paddingTop: '140px' }}>
          <div className="container text-center">
            <div className="reveal visible">
              <h1>We'd Love to Hear From You</h1>
              <p>
                Your feedback helps us make{' '}
                <span className="text-highlight">Data Structure and Algorithm</span> learning even
                easier for every student.
              </p>
            </div>
          </div>
        </section>

        <section className="section-pad">
          <div className="container">
            <div className="reveal visible">
              {!submitted ? (
                <div className="feedback-card" id="feedbackFormWrap">
                  <form onSubmit={handleSubmit}>
                    <h3 className="mb-4 text-center">Share Your Feedback</h3>
                    <div className="row gy-3">
                      <div className="col-md-6">
                        <label className="form-label-custom" htmlFor="fbName">
                          Your Name
                        </label>
                        <input
                          type="text"
                          className="form-control-custom"
                          id="fbName"
                          placeholder="e.g. Sokha Chan"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label-custom" htmlFor="fbEmail">
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="form-control-custom"
                          id="fbEmail"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label-custom" htmlFor="fbCategory">
                          Feedback Category
                        </label>
                        <select
                          className="form-select-custom"
                          id="fbCategory"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                        >
                          <option>General Feedback</option>
                          <option>Bug Report</option>
                          <option>Feature Request</option>
                          <option>Lesson / Content Issue</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label-custom">
                          How would you rate your experience?
                        </label>
                        <div className="star-rating" onMouseLeave={() => setHoverRating(0)}>
                          {[1, 2, 3, 4, 5].map((v) => (
                            <i
                              key={v}
                              className={`bi ${v <= displayRating ? 'bi-star-fill' : 'bi-star'}`}
                              onMouseEnter={() => setHoverRating(v)}
                              onClick={() => setRating(v)}
                            ></i>
                          ))}
                        </div>
                      </div>
                      <div className="col-12">
                        <label className="form-label-custom" htmlFor="fbMessage">
                          Your Message
                        </label>
                        <textarea
                          className="form-control-custom"
                          id="fbMessage"
                          placeholder="Tell us what you loved, or what we can improve..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          required
                        ></textarea>
                      </div>
                      {error && (
                        <div className="col-12 text-center">
                          <p style={{ color: '#e0525f', fontSize: '0.85rem', margin: 0 }}>
                            {error}
                          </p>
                        </div>
                      )}
                      <div className="col-12 text-center mt-3">
                        <button type="submit" className="btn-primary-custom" disabled={submitting}>
                          {submitting ? 'Sending…' : 'Send Feedback'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="feedback-card">
                  <div className="success-wrap">
                    <div className="success-check">
                      <i className="bi bi-check-lg"></i>
                    </div>
                    <h3>Thank You!</h3>
                    <p className="mb-3">
                      Your feedback has been saved. This project doesn't have a server yet, so it's
                      stored in your browser for now rather than sent anywhere — but it's real, not
                      simulated.
                    </p>
                    <button type="button" className="btn-primary-custom" onClick={resetForm}>
                      Send More Feedback
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="why-section section-pad">
          <div className="container text-center">
            <h2 className="reveal visible">Why Your Feedback Matters</h2>
            <p className="reveal visible">Every message shapes how we build DSA PathFinder</p>
            <div className="row gy-4 mt-2">
              <div className="col-lg-4 reveal visible">
                <div className="why-card">
                  <div className="why-icon badge-blue">
                    <i className="bi bi-lightbulb-fill"></i>
                  </div>
                  <h5>Shape the Platform</h5>
                  <p className="mb-0">
                    Your ideas directly influence new lessons, features, and tools we build next.
                  </p>
                </div>
              </div>
              <div className="col-lg-4 reveal visible">
                <div className="why-card">
                  <div className="why-icon badge-lav">
                    <i className="bi bi-tools"></i>
                  </div>
                  <h5>Faster Fixes</h5>
                  <p className="mb-0">
                    Bug reports help our team catch and resolve issues quickly for every student.
                  </p>
                </div>
              </div>
              <div className="col-lg-4 reveal visible">
                <div className="why-card">
                  <div className="why-icon badge-mint">
                    <i className="bi bi-mortarboard-fill"></i>
                  </div>
                  <h5>Better Content</h5>
                  <p className="mb-0">
                    Lesson feedback helps us make explanations clearer and more useful for learning.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
