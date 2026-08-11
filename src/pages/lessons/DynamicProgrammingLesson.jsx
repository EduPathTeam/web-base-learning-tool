import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import LessonHero from '../../components/lessons/LessonHero';
import LessonProgressBar from '../../components/lessons/LessonProgressBar';
import DPVisualizer from '../../components/lessons/DPVisualizer';
import CodeTabs from '../../components/lessons/CodeTabs';
import PracticeExercise from '../../components/lessons/PracticeExercise';
import LessonNav from '../../components/lessons/LessonNav';
import useScrollReveal from '../../hooks/useScrollReveal';
import '../../styles/learn.css';
import '../../styles/array.css';

export default function DynamicProgrammingLesson() {
  useScrollReveal();

  return (
    <div className="page-shell" data-nav-section="learn">
      <Header navSection="learn" />
      <LessonHero
        title="Dynamic Programming"
        subtitle="A technique for solving problems by breaking them into overlapping subproblems, solving each one once, and reusing the results."
      />

      <main className="container page-content page-shell-main">
        <LessonProgressBar topicId="dynamic-programming" lessonUrl="/learn/dynamic-programming" />

        <section className="content-card fade-in" id="learning-objectives">
          <h2 className="section-title">Learning Objectives</h2>
          <ul className="objectives-list">
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Recognize overlapping subproblems and optimal substructure.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Explain memoization (top-down) vs. tabulation (bottom-up).</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Convert a naive exponential recursive solution into a DP one.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Identify real problems that benefit from DP.</li>
          </ul>
        </section>

        <section className="content-card fade-in" id="what-is-dp">
          <div className="row gy-4 align-items-start">
            <div className="col-lg-7">
              <h2 className="section-title">What is Dynamic Programming?</h2>
              <p className="section-text">
                Dynamic Programming (DP) solves a complex problem by breaking it into smaller subproblems, solving
                each subproblem <strong>only once</strong>, and storing (caching) the result. When the same
                subproblem is needed again, it's looked up instead of recomputed.
              </p>
              <p className="section-text">
                DP only helps when subproblems <strong>overlap</strong> — recursion without repeated subproblems
                (like factorial) gets no benefit from it.
              </p>
              <div className="code-badge">fib(5) reuses fib(3) instead of recomputing it 2 separate times</div>
            </div>
            <div className="col-lg-5">
              <div className="mini-visual" style={{ fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: 1.8 }}>
                <div>Naive: fib(5) calls fib(3) TWICE</div>
                <div>DP: fib(3) computed once, reused</div>
              </div>
            </div>
          </div>
        </section>

        <DPVisualizer />

        <section className="content-card fade-in" id="dp-concepts">
          <h2 className="section-title">Key Concepts</h2>
          <div className="row g-3">
            <div className="col-6 col-lg-3"><div className="op-card op-gray"><div className="op-icon"><i className="bi bi-intersect"></i></div><h5>Overlapping Subproblems</h5><p>Same work repeats</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-orange"><div className="op-icon"><i className="bi bi-bricks"></i></div><h5>Optimal Substructure</h5><p>Built from subsolutions</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-pink"><div className="op-icon"><i className="bi bi-arrow-90deg-down"></i></div><h5>Memoization</h5><p>Top-down + cache</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-teal"><div className="op-icon"><i className="bi bi-table"></i></div><h5>Tabulation</h5><p>Bottom-up table</p></div></div>
          </div>
        </section>

        <section className="content-card fade-in" id="time-complexity">
          <h2 className="section-title">Time complexity</h2>
          <div className="table-responsive">
            <table className="table complexity-table mb-0">
              <thead><tr><th>Approach</th><th>Time</th><th>Space</th></tr></thead>
              <tbody>
                <tr><td>Naive recursive fibonacci(n)</td><td>O(2ⁿ)</td><td>O(n)</td></tr>
                <tr><td>Memoized (top-down) fibonacci(n)</td><td>O(n)</td><td>O(n)</td></tr>
                <tr><td>Tabulated (bottom-up) fibonacci(n)</td><td>O(n)</td><td>O(n) or O(1) *</td></tr>
              </tbody>
            </table>
            <p className="section-text" style={{ marginTop: '10px', fontSize: '0.82rem' }}>* O(1) space if only the last two values are kept instead of the full table.</p>
          </div>
        </section>

        <section className="content-card fade-in" id="pros-cons">
          <div className="row">
            <div className="col-md-6">
              <h2 className="section-title">Advantages</h2>
              <ul className="explain-list">
                <li>Turns exponential-time algorithms into polynomial-time</li>
                <li>Guarantees each subproblem is solved only once</li>
                <li>Bottom-up tabulation avoids recursion/call-stack overhead entirely</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h2 className="section-title">Disadvantages</h2>
              <ul className="explain-list">
                <li>Uses extra memory to store subproblem results</li>
                <li>Only applies when subproblems actually overlap</li>
                <li>Identifying the right subproblem/state can be difficult</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="content-card fade-in" id="applications">
          <h2 className="section-title">Applications</h2>
          <ul className="explain-list">
            <li>Shortest path algorithms (Bellman-Ford, Floyd-Warshall)</li>
            <li>The 0/1 Knapsack and coin change problems</li>
            <li>Longest common subsequence — used in diff tools and DNA analysis</li>
            <li>Text editors' spell-check (edit distance)</li>
          </ul>
        </section>

        <section className="fade-in" id="code-example">
          <button className="btn code-example-badge">Code Example</button>
          <div className="row g-4 mt-1">
            <div className="col-lg-6">
              <CodeTabs
                panels={[
                  { lang: 'js', label: 'JavaScript', code: `// Bottom-up (tabulation)
function fib(n) {
  const table = [0, 1];
  for (let i = 2; i <= n; i++) {
    table[i] = table[i - 1] + table[i - 2];
  }
  return table[n];
}

console.log(fib(10)); // 55` },
                  { lang: 'python', label: 'Python', code: `# Top-down with memoization
def fib(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]

print(fib(10))  # 55` },
                  { lang: 'java', label: 'Java', code: `// Bottom-up (tabulation)
int fib(int n) {
    int[] table = new int[n + 1];
    table[0] = 0;
    if (n > 0) table[1] = 1;
    for (int i = 2; i <= n; i++) {
        table[i] = table[i - 1] + table[i - 2];
    }
    return table[n];
}

// fib(10) -> 55` },
                ]}
              />
            </div>
            <div className="col-lg-6">
              <div className="explain-card">
                <p>
                  Both examples avoid recomputing the same Fibonacci number twice — the JavaScript version fills a
                  table from the bottom up, while the Python version caches results as it recurses from the top
                  down. Either way, each value from 0 to n is computed exactly once.
                </p>
                <h6>Key Properties</h6>
                <ul className="explain-list">
                  <li>Only worth it when subproblems overlap</li>
                  <li>Top-down = recursion + cache; bottom-up = iterative table</li>
                  <li>Turns O(2ⁿ) into O(n) for Fibonacci</li>
                </ul>
                <a href="#applications" className="learn-more-link">See where DP is used <i className="bi bi-arrow-right"></i></a>
              </div>
            </div>
          </div>
          <div className="row g-4 mt-1">
            <div className="col-12">
              <div className="code-badge" style={{ display: 'block' }}>Output: 55</div>
            </div>
          </div>
        </section>

        <section className="content-card fade-in" id="summary">
          <h2 className="section-title">Summary</h2>
          <p className="section-text">
            Dynamic Programming trades memory for speed: by caching subproblem results (memoization) or building
            them up in a table (tabulation), it avoids redoing the same work, turning exponential algorithms into
            polynomial ones.
          </p>
        </section>

        <section className="content-card fade-in" id="take-quiz">
          <h2 className="section-title">Ready to test yourself?</h2>
          <p className="section-text">Take the 5-question quiz to check your understanding and save your score to your Dashboard.</p>
          <Link to="/quiz/dynamic-programming" className="btn btn-hero btn-hero-primary">
            <i className="bi bi-patch-question"></i> Take Quiz
          </Link>
        </section>

        <PracticeExercise
          task={<>Write a bottom-up function <code>climbStairs(n)</code> that returns how many distinct ways you can
            climb <code>n</code> stairs, taking either 1 or 2 steps at a time. (Hint: it follows the same recurrence as Fibonacci.)</>}
          hint="ways(n) = ways(n-1) + ways(n-2) — from step n, you either took a final 1-step from n-1, or a final 2-step from n-2. Base cases: ways(0) = 1, ways(1) = 1."
        />

        <LessonNav prev={{ to: '/learn/recursion', label: 'Recursion' }} next={{ to: '/learn/sorting', label: 'Sorting Algorithms' }} />
      </main>

      <Footer />
    </div>
  );
}
