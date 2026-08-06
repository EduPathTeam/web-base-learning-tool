// ==========================================================================
// ARRAY QUIZ — main script
// Handles rendering questions, checking answers, navigation between
// questions, progress bar updates, and the final summary screen.
// ==========================================================================

/* ============================================================
   1. QUESTION DATA
   All quiz content lives here. Add/edit questions by editing
   this array only — nothing is hardcoded in the HTML.
============================================================ */
const quizQuestions = [
  {
    question: "What is the value at index 3 of the following array?\narr = [1, 4, 9, 8, 6]",
    options: ["8", "1", "9", "6"],
    answer: 0,
    explanation: "The value at index 3 is 8. Remember: array indexing starts at 0, so index 3 is the 4th element."
  },
  {
    question: "What is the time complexity of accessing an element by index in an array?",
    options: ["O(n)", "O(log n)", "O(1)", "O(n\u00B2)"],
    answer: 2,
    explanation: "Accessing an array element by index is O(1) — constant time — because the memory address can be calculated directly."
  },
  {
    question: "Which operation is generally the SLOWEST on an array?",
    options: [
      "Reading the last element",
      "Reading the first element",
      "Inserting an element in the middle",
      "Reading a specific index"
    ],
    answer: 2,
    explanation: "Inserting in the middle is O(n) because every element after the insertion point must shift over by one position."
  },
  {
    question: "Given arr = [5, 12, 8, 20, 3], what is arr.length?",
    options: ["4", "5", "6", "It depends on the language"],
    answer: 1,
    explanation: "The array has 5 elements (5, 12, 8, 20, 3), so its length is 5."
  },
  {
    question: "What happens when you try to access arr[10] on an array with only 5 elements?",
    options: [
      "It returns 0",
      "It throws a syntax error before the program runs",
      "It returns undefined (in JavaScript) or causes an out-of-bounds error (in many other languages)",
      "It automatically resizes the array to fit"
    ],
    answer: 2,
    explanation: "Accessing an index outside the array's bounds returns undefined in JavaScript, while languages like Java or C++ raise an out-of-bounds error/exception."
  }
];

/* ============================================================
   2. STATE
============================================================ */
let currentIndex = 0;                                   // which question we're on
let score = 0;                                           // number of correct answers so far
const userAnswers = new Array(quizQuestions.length).fill(null); // stores the selected option index per question, or null if unanswered

/* ============================================================
   3. DOM REFERENCES
============================================================ */
const progressQuestionLabel = document.getElementById('progressQuestionLabel');
const progressScoreLabel = document.getElementById('progressScoreLabel');
const progressFill = document.getElementById('progressFill');

const questionCard = document.getElementById('questionCard');
const questionNumber = document.getElementById('questionNumber');
const questionText = document.getElementById('questionText');
const answerOptionsEl = document.getElementById('answerOptions');
const explanationBox = document.getElementById('explanationBox');

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const summaryCard = document.getElementById('summaryCard');
const summaryPerformanceMsg = document.getElementById('summaryPerformanceMsg');
const statTotal = document.getElementById('statTotal');
const statCorrect = document.getElementById('statCorrect');
const statIncorrect = document.getElementById('statIncorrect');
const statPercent = document.getElementById('statPercent');
const retryBtn = document.getElementById('retryBtn');
const backToLessonBtnSummary = document.getElementById('backToLessonBtnSummary');

const liveSummaryCard = document.getElementById('liveSummaryCard');
const liveAnswered = document.getElementById('liveAnswered');
const liveCorrect = document.getElementById('liveCorrect');
const liveIncorrect = document.getElementById('liveIncorrect');
const liveScorePercent = document.getElementById('liveScorePercent');

/* ============================================================
   4. LOAD / RENDER A QUESTION
============================================================ */
function loadQuestion(index) {
  const q = quizQuestions[index];
  const letters = ['A', 'B', 'C', 'D'];

  // Question text (split on newline so a code-style second line, like
  // "arr = [1, 4, 9, 8, 6]", renders on its own line)
  questionNumber.textContent = `Question ${index + 1}:`;
  const lines = q.question.split('\n');
  questionText.innerHTML = lines
    .map((line, i) => (i === 0 ? line : `<span class="code-inline">${line}</span>`))
    .join('<br>');

  // Build the answer option buttons fresh each time
  answerOptionsEl.innerHTML = '';
  const previousAnswer = userAnswers[index];

  q.options.forEach((optText, optIndex) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'answer-option';
    btn.innerHTML = `<span class="opt-letter">${letters[optIndex]}.</span><span>${optText}</span>`;
    btn.addEventListener('click', () => selectAnswer(optIndex));
    answerOptionsEl.appendChild(btn);
  });

  // If this question was already answered, restore that visual state
  // and lock the options so the answer can't be changed.
  if (previousAnswer !== null) {
    renderAnsweredState(index, previousAnswer);
  } else {
    explanationBox.classList.remove('show', 'is-correct', 'is-incorrect');
    explanationBox.innerHTML = '';
  }

  updateNavButtons();
  updateProgress();
  updateLiveSummary();
}

/* ============================================================
   5. SELECT AN ANSWER
============================================================ */
function selectAnswer(optionIndex) {
  // Ignore clicks if this question has already been answered
  if (userAnswers[currentIndex] !== null) return;

  userAnswers[currentIndex] = optionIndex;

  const q = quizQuestions[currentIndex];
  if (optionIndex === q.answer) {
    score++;
  }

  renderAnsweredState(currentIndex, optionIndex);
  updateNavButtons();
  updateProgress();
  updateLiveSummary();
}

// Paints the correct/incorrect colors on every option button, disables
// them, and shows the explanation box. Used both right after a click and
// when navigating back to an already-answered question.
function renderAnsweredState(index, selectedIndex) {
  const q = quizQuestions[index];
  const optionButtons = answerOptionsEl.querySelectorAll('.answer-option');
  const isCorrect = selectedIndex === q.answer;

  optionButtons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.answer) {
      btn.classList.add('correct');
    } else if (i === selectedIndex) {
      btn.classList.add('incorrect');
    } else {
      btn.classList.add('faded');
    }
  });

  explanationBox.classList.add('show');
  explanationBox.classList.toggle('is-correct', isCorrect);
  explanationBox.classList.toggle('is-incorrect', !isCorrect);
  explanationBox.innerHTML = isCorrect
    ? `<i class="bi bi-check-circle-fill explanation-icon"></i><span><strong>Correct!</strong> ${q.explanation}</span>`
    : `<i class="bi bi-x-circle-fill explanation-icon"></i><span><strong>Not quite.</strong> ${q.explanation}</span>`;
}

/* ============================================================
   6. PROGRESS BAR
============================================================ */
function updateProgress() {
  const total = quizQuestions.length;
  progressQuestionLabel.textContent = `Question ${currentIndex + 1} of ${total}`;
  progressScoreLabel.textContent = `Score: ${score}/${total}`;
  const percent = ((currentIndex + 1) / total) * 100;
  progressFill.style.width = `${percent}%`;
}

/* ============================================================
   7. LIVE SUMMARY (updates as the user progresses)
============================================================ */
function updateLiveSummary() {
  const answeredCount = userAnswers.filter((a) => a !== null).length;
  const incorrectCount = userAnswers.filter(
    (a, i) => a !== null && a !== quizQuestions[i].answer
  ).length;
  const percent = quizQuestions.length
    ? Math.round((score / quizQuestions.length) * 100)
    : 0;

  liveAnswered.textContent = `${answeredCount}/${quizQuestions.length}`;
  liveCorrect.textContent = score;
  liveIncorrect.textContent = incorrectCount;
  liveScorePercent.textContent = `${percent}%`;
}

/* ============================================================
   8. NAV BUTTON STATES (enable/disable, relabel Next -> Finish)
============================================================ */
function updateNavButtons() {
  prevBtn.disabled = currentIndex === 0;

  const isAnswered = userAnswers[currentIndex] !== null;
  const isLastQuestion = currentIndex === quizQuestions.length - 1;

  nextBtn.disabled = !isAnswered;

  if (isLastQuestion) {
    nextBtn.innerHTML = 'Finish Quiz <i class="bi bi-flag-fill"></i>';
  } else {
    nextBtn.innerHTML = 'Next question <i class="bi bi-arrow-right"></i>';
  }
}

/* ============================================================
   9. NEXT / PREVIOUS QUESTION
============================================================ */
function nextQuestion() {
  const isLastQuestion = currentIndex === quizQuestions.length - 1;

  if (isLastQuestion) {
    finishQuiz();
    return;
  }

  currentIndex++;
  loadQuestion(currentIndex);
}

function previousQuestion() {
  if (currentIndex === 0) return;
  currentIndex--;
  loadQuestion(currentIndex);
}

/* ============================================================
   10. FINISH QUIZ -> show summary screen
============================================================ */
function finishQuiz() {
  const total = quizQuestions.length;
  const incorrect = total - score;
  const percent = Math.round((score / total) * 100);

  statTotal.textContent = total;
  statCorrect.textContent = score;
  statIncorrect.textContent = incorrect;
  statPercent.textContent = `${percent}%`;

  summaryPerformanceMsg.textContent = getPerformanceMessage(percent);

  // Hide the in-progress views, show the summary
  questionCard.style.display = 'none';
  liveSummaryCard.style.display = 'none';
  document.getElementById('progressCard').style.display = 'none';
  summaryCard.style.display = 'block';
  summaryCard.classList.add('visible');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getPerformanceMessage(percent) {
  if (percent === 100) return '100% — Excellent!';
  if (percent >= 80) return `${percent}% — Great Job!`;
  if (percent >= 60) return `${percent}% — Good Work!`;
  if (percent >= 40) return `${percent}% — Keep Practicing!`;
  return `${percent}% — Try Again!`;
}

/* ============================================================
   11. RESTART QUIZ
============================================================ */
function restartQuiz() {
  currentIndex = 0;
  score = 0;
  userAnswers.fill(null);

  summaryCard.style.display = 'none';
  summaryCard.classList.remove('visible');
  questionCard.style.display = 'block';
  liveSummaryCard.style.display = 'block';
  document.getElementById('progressCard').style.display = 'block';

  loadQuestion(currentIndex);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================================================
   12. EVENT LISTENERS
============================================================ */
prevBtn.addEventListener('click', previousQuestion);
nextBtn.addEventListener('click', nextQuestion);
retryBtn.addEventListener('click', restartQuiz);

// "Back to Lesson" on the summary screen just follows its href normally,
// but we still want the fade-in treatment consistent with everything else.
backToLessonBtnSummary.addEventListener('click', () => {
  // no preventDefault — let the link navigate normally
});

/* ============================================================
   13. FADE-IN ON LOAD
============================================================ */
document.querySelectorAll('.fade-in').forEach((el, i) => {
  setTimeout(() => el.classList.add('visible'), i * 80);
});

/* ============================================================
   14. INITIALIZE
============================================================ */
loadQuestion(currentIndex);