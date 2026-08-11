import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import LessonHero from '../../components/lessons/LessonHero';
import LessonProgressBar from '../../components/lessons/LessonProgressBar';
import RecursionVisualizer from '../../components/lessons/RecursionVisualizer';
import CodeTabs from '../../components/lessons/CodeTabs';
import PracticeExercise from '../../components/lessons/PracticeExercise';
import LessonNav from '../../components/lessons/LessonNav';
import useScrollReveal from '../../hooks/useScrollReveal';
import '../../styles/learn.css';
import '../../styles/array.css';

export default function RecursionLesson() {
  useScrollReveal();

  return (
    <div className="page-shell" data-nav-section="learn">
      <Header navSection="learn" />
      <LessonHero
        title="Recursion"
        subtitle="A technique where a function solves a problem by calling itself on a smaller version of the same problem, until it reaches a base case."
      />

      <main className="container page-content page-shell-main">
        <LessonProgressBar topicId="recursion" lessonUrl="/learn/recursion" />

        <section className="content-card fade-in" id="learning-objectives">
          <h2 className="section-title">Learning Objectives</h2>
          <ul className="objectives-list">
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Identify the base case and recursive case of a function.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Trace how the call stack grows and shrinks during recursion.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Write simple recursive functions (factorial, sum, Fibonacci).</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Recognize when recursion is (and isn't) the right tool.</li>
          </ul>
        </section>

        <section className="content-card fade-in" id="what-is-recursion">
          <div className="row gy-4 align-items-start">
            <div className="col-lg-7">
              <h2 className="section-title">What is Recursion?</h2>
              <p className="section-text">
                Recursion is when a function calls itself to solve a smaller instance of the same problem. Each
                call must move closer to a <strong>base case</strong> — the condition that stops the recursion and
                returns a value without calling itself again.
              </p>
              <p className="section-text">
                Every recursive call pushes a new frame onto the call stack; when a call returns, its frame is popped.
              </p>
              <div className="code-badge">factorial(4) = 4 × factorial(3) = 4 × 3 × factorial(2) = ...</div>
            </div>
            <div className="col-lg-5">
              <div className="mini-visual" style={{ fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.8 }}>
                <div>factorial(4)</div>
                <div>&nbsp;&nbsp;→ factorial(3)</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;→ factorial(2)</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ factorial(1) = 1 (base case)</div>
              </div>
            </div>
          </div>
        </section>

        <RecursionVisualizer />

        <section className="content-card fade-in" id="recursion-concepts">
          <h2 className="section-title">Key Concepts</h2>
          <div className="row g-3">
            <div className="col-6 col-lg-3"><div className="op-card op-gray"><div className="op-icon"><i className="bi bi-flag"></i></div><h5>Base Case</h5><p>Stops the recursion</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-orange"><div className="op-icon"><i className="bi bi-arrow-repeat"></i></div><h5>Recursive Case</h5><p>Calls itself, smaller input</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-pink"><div className="op-icon"><i className="bi bi-layers"></i></div><h5>Call Stack</h5><p>Tracks pending calls</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-teal"><div className="op-icon"><i className="bi bi-arrow-return-left"></i></div><h5>Unwinding</h5><p>Returns combine results</p></div></div>
          </div>
        </section>

        <section className="content-card fade-in" id="time-complexity">
          <h2 className="section-title">Time complexity</h2>
          <div className="table-responsive">
            <table className="table complexity-table mb-0">
              <thead><tr><th>Function</th><th>Time</th><th>Space (call stack)</th></tr></thead>
              <tbody>
                <tr><td>factorial(n)</td><td>O(n)</td><td>O(n)</td></tr>
                <tr><td>Naive fibonacci(n)</td><td>O(2ⁿ)</td><td>O(n)</td></tr>
                <tr><td>Binary search (recursive)</td><td>O(log n)</td><td>O(log n)</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="content-card fade-in" id="pros-cons">
          <div className="row">
            <div className="col-md-6">
              <h2 className="section-title">Advantages</h2>
              <ul className="explain-list">
                <li>Often shorter and closer to the mathematical definition of a problem</li>
                <li>Natural fit for recursively-structured data (trees, graphs, nested lists)</li>
                <li>Simplifies divide-and-conquer algorithms (merge sort, quicksort)</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h2 className="section-title">Disadvantages</h2>
              <ul className="explain-list">
                <li>Each call uses stack memory — risk of stack overflow for deep recursion</li>
                <li>Can be slower than an iterative equivalent due to call overhead</li>
                <li>Naive recursive solutions can repeat work (see Dynamic Programming)</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="content-card fade-in" id="applications">
          <h2 className="section-title">Applications</h2>
          <ul className="explain-list">
            <li>Tree and graph traversal (DFS)</li>
            <li>Divide-and-conquer algorithms: merge sort, quicksort, binary search</li>
            <li>Parsing nested structures (JSON, file directories, mathematical expressions)</li>
            <li>Backtracking problems (mazes, puzzles like N-Queens)</li>
          </ul>
        </section>

        <section className="fade-in" id="code-example">
          <button className="btn code-example-badge">Code Example</button>
          <div className="row g-4 mt-1">
            <div className="col-lg-6">
              <CodeTabs
                panels={[
                  { lang: 'js', label: 'JavaScript', code: `function factorial(n) {
  if (n <= 1) return 1;       // base case
  return n * factorial(n - 1); // recursive case
}

console.log(factorial(4)); // 24` },
                  { lang: 'python', label: 'Python', code: `def factorial(n):
    if n <= 1:            # base case
        return 1
    return n * factorial(n - 1)  # recursive case

print(factorial(4))  # 24` },
                  { lang: 'java', label: 'Java', code: `int factorial(int n) {
    if (n <= 1) return 1;         // base case
    return n * factorial(n - 1);  // recursive case
}

// factorial(4) -> 24` },
                ]}
              />
            </div>
            <div className="col-lg-6">
              <div className="explain-card">
                <p>
                  <code>factorial(4)</code> calls <code>factorial(3)</code>, which calls <code>factorial(2)</code>,
                  which calls <code>factorial(1)</code> — the base case, which returns immediately. Then each
                  pending multiplication resolves on the way back up: 1, then 2×1=2, then 3×2=6, then 4×6=24.
                </p>
                <h6>Key Properties</h6>
                <ul className="explain-list">
                  <li>Must always make progress toward the base case</li>
                  <li>Each call gets its own local variables (its own stack frame)</li>
                  <li>Can be rewritten iteratively — recursion is a choice, not a requirement</li>
                </ul>
                <a href="#applications" className="learn-more-link">See where recursion is used <i className="bi bi-arrow-right"></i></a>
              </div>
            </div>
          </div>
          <div className="row g-4 mt-1">
            <div className="col-12">
              <div className="code-badge" style={{ display: 'block' }}>Output: 24</div>
            </div>
          </div>
        </section>

        <section className="content-card fade-in" id="summary">
          <h2 className="section-title">Summary</h2>
          <p className="section-text">
            Recursion solves a problem by breaking it into a smaller version of itself, until a base case stops the
            chain. It trades explicit loops for stack-managed calls — elegant for tree-shaped and divide-and-conquer
            problems, but something to watch for stack depth and repeated work.
          </p>
        </section>

        <section className="content-card fade-in" id="take-quiz">
          <h2 className="section-title">Ready to test yourself?</h2>
          <p className="section-text">Take the 5-question quiz to check your understanding and save your score to your Dashboard.</p>
          <Link to="/quiz/recursion" className="btn btn-hero btn-hero-primary">
            <i className="bi bi-patch-question"></i> Take Quiz
          </Link>
        </section>

        <PracticeExercise
          task={<>Write a recursive function <code>sumArray(arr)</code> that returns the sum of all numbers in an array,
            without using a loop.</>}
          hint="Base case: an empty array sums to 0. Recursive case: return the first element plus sumArray of the rest of the array."
        />

        <LessonNav prev={{ to: '/learn/graph', label: 'Graph' }} next={{ to: '/learn/dynamic-programming', label: 'Dynamic Programming' }} />
      </main>

      <Footer />
    </div>
  );
}
