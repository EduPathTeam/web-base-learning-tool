import { useState } from 'react';
import { recordQuizResult } from '../../lib/csPlatform';

const LETTERS = ['A', 'B', 'C', 'D'];

function getPerformanceMessage(percent) {
  if (percent === 100) return '100% — Excellent!';
  if (percent >= 80) return `${percent}% — Great Job!`;
  if (percent >= 60) return `${percent}% — Good Work!`;
  if (percent >= 40) return `${percent}% — Keep Practicing!`;
  return `${percent}% — Try Again!`;
}

// Quiz engine (one question at a time, answer lock-in, live summary, final
// summary, retry). Rendered on its own route (src/pages/QuizPage.jsx),
// separate from the lesson content that teaches the topic.
export default function QuizSection({ topicId, questions }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(() => new Array(questions.length).fill(null));
  const [finished, setFinished] = useState(false);

  const total = questions.length;
  const score = answers.filter((a, i) => a !== null && a === questions[i].answer).length;
  const answeredCount = answers.filter((a) => a !== null).length;
  const incorrectCount = answers.filter((a, i) => a !== null && a !== questions[i].answer).length;
  const livePercent = total ? Math.round((score / total) * 100) : 0;

  const q = questions[currentIndex];
  const selected = answers[currentIndex];
  const isAnswered = selected !== null;
  const isLast = currentIndex === total - 1;

  function selectAnswer(optionIndex) {
    if (isAnswered) return;
    const next = answers.slice();
    next[currentIndex] = optionIndex;
    setAnswers(next);
  }

  function nextQuestion() {
    if (isLast) {
      const percent = Math.round((score / total) * 100);
      recordQuizResult(topicId, percent);
      setFinished(true);
      return;
    }
    setCurrentIndex((i) => i + 1);
  }

  function previousQuestion() {
    if (currentIndex === 0) return;
    setCurrentIndex((i) => i - 1);
  }

  function restartQuiz() {
    setCurrentIndex(0);
    setAnswers(new Array(questions.length).fill(null));
    setFinished(false);
  }

  if (finished) {
    const percent = Math.round((score / total) * 100);
    return (
      <div className="summary-card fade-in visible" style={{ display: 'block' }}>
        <h2 className="summary-title">Quiz Summary</h2>
        <p className="summary-performance-msg">{getPerformanceMessage(percent)}</p>

        <div className="summary-stats-grid">
          <div className="stat-box stat-total">
            <div className="stat-icon"><i className="bi bi-journal-text"></i></div>
            <div className="stat-value">{total}</div>
            <div className="stat-label">Total Questions</div>
          </div>
          <div className="stat-box stat-correct">
            <div className="stat-icon"><i className="bi bi-check-circle-fill"></i></div>
            <div className="stat-value">{score}</div>
            <div className="stat-label">Correct Answers</div>
          </div>
          <div className="stat-box stat-incorrect">
            <div className="stat-icon"><i className="bi bi-x-circle-fill"></i></div>
            <div className="stat-value">{total - score}</div>
            <div className="stat-label">Incorrect Answers</div>
          </div>
          <div className="stat-box stat-score">
            <div className="stat-icon"><i className="bi bi-percent"></i></div>
            <div className="stat-value">{percent}%</div>
            <div className="stat-label">Final Score</div>
          </div>
        </div>

        <div className="summary-actions">
          <button className="btn quiz-retry-btn" onClick={restartQuiz}>
            <i className="bi bi-arrow-clockwise"></i> Retry Quiz
          </button>
        </div>
      </div>
    );
  }

  const lines = q.question.split('\n');

  return (
    <>
      <div className="progress-card fade-in">
        <div className="progress-row">
          <span>Question {currentIndex + 1} of {total}</span>
          <span className="progress-score-label">Score: {score}/{total}</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${((currentIndex + 1) / total) * 100}%` }}></div>
        </div>
      </div>

      <div className="question-card fade-in">
        <p className="question-number">Question {currentIndex + 1}:</p>
        <p className="question-text">
          {lines.map((line, i) =>
            i === 0 ? (
              <span key={i}>{line}</span>
            ) : (
              <span key={i}><br /><span className="code-inline">{line}</span></span>
            )
          )}
        </p>

        <div className="answer-options">
          {q.options.map((optText, optIndex) => {
            let cls = 'answer-option';
            if (isAnswered) {
              if (optIndex === q.answer) cls += ' correct';
              else if (optIndex === selected) cls += ' incorrect';
              else cls += ' faded';
            }
            return (
              <button
                key={optIndex}
                type="button"
                className={cls}
                disabled={isAnswered}
                onClick={() => selectAnswer(optIndex)}
              >
                <span className="opt-letter">{LETTERS[optIndex]}.</span>
                <span>{optText}</span>
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className={`explanation-box show ${selected === q.answer ? 'is-correct' : 'is-incorrect'}`}>
            <i className={`bi ${selected === q.answer ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} explanation-icon`}></i>
            <span>
              <strong>{selected === q.answer ? 'Correct!' : 'Not quite.'}</strong> {q.explanation}
            </span>
          </div>
        )}

        <div className="question-nav-row">
          <button className="btn quiz-nav-btn quiz-prev-btn" onClick={previousQuestion} disabled={currentIndex === 0}>
            <i className="bi bi-arrow-left"></i> Previous question
          </button>
          <button className="btn quiz-nav-btn quiz-next-btn" onClick={nextQuestion} disabled={!isAnswered}>
            {isLast ? <>Finish Quiz <i className="bi bi-flag-fill"></i></> : <>Next question <i className="bi bi-arrow-right"></i></>}
          </button>
        </div>
      </div>

      <div className="live-summary-card fade-in">
        <h3 className="live-summary-title">Quiz summary</h3>
        <div className="live-summary-grid">
          <div className="live-stat live-stat-answered">
            <div className="live-stat-icon"><i className="bi bi-journal-check"></i></div>
            <div>
              <div className="live-stat-label">Question answered:</div>
              <div className="live-stat-value">{answeredCount}/{total}</div>
            </div>
          </div>
          <div className="live-stat live-stat-correct">
            <div className="live-stat-icon"><i className="bi bi-check-circle-fill"></i></div>
            <div>
              <div className="live-stat-label">Correct answers:</div>
              <div className="live-stat-value">{score}</div>
            </div>
          </div>
          <div className="live-stat live-stat-incorrect">
            <div className="live-stat-icon"><i className="bi bi-x-circle-fill"></i></div>
            <div>
              <div className="live-stat-label">Incorrect answers:</div>
              <div className="live-stat-value">{incorrectCount}</div>
            </div>
          </div>
          <div className="live-stat live-stat-score">
            <div className="live-stat-icon"><i className="bi bi-bar-chart-fill"></i></div>
            <div>
              <div className="live-stat-label">Current score:</div>
              <div className="live-stat-value">{livePercent}%</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
