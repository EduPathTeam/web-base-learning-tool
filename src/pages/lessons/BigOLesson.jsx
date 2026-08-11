import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import LessonHero from '../../components/lessons/LessonHero';
import LessonProgressBar from '../../components/lessons/LessonProgressBar';
import BigOVisualizer from '../../components/lessons/BigOVisualizer';
import CodeTabs from '../../components/lessons/CodeTabs';
import PracticeExercise from '../../components/lessons/PracticeExercise';
import LessonNav from '../../components/lessons/LessonNav';
import useScrollReveal from '../../hooks/useScrollReveal';
import '../../styles/learn.css';
import '../../styles/array.css';

export default function BigOLesson() {
  useScrollReveal();

  return (
    <div className="page-shell" data-nav-section="learn">
      <Header navSection="learn" />
      <LessonHero
        title="Big-O Notation"
        subtitle="A way to describe how an algorithm's running time or memory use grows as the input size grows — the common language for comparing algorithm efficiency."
      />

      <main className="container page-content page-shell-main">
        <LessonProgressBar topicId="big-o" lessonUrl="/learn/big-o" />

        <section className="content-card fade-in" id="learning-objectives">
          <h2 className="section-title">Learning Objectives</h2>
          <ul className="objectives-list">
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Read and write Big-O expressions for simple code.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Rank common complexity classes from fastest to slowest.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Explain why constants and lower-order terms are dropped.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Use Big-O to compare two algorithms that solve the same problem.</li>
          </ul>
        </section>

        <section className="content-card fade-in" id="what-is-bigo">
          <div className="row gy-4 align-items-start">
            <div className="col-lg-7">
              <h2 className="section-title">What is Big-O Notation?</h2>
              <p className="section-text">
                Big-O notation describes how an algorithm's resource usage (time or memory) scales as the input
                size <code>n</code> grows, focusing on the <strong>worst case</strong> and the dominant growth trend
                — not exact timings, which depend on hardware and implementation details.
              </p>
              <p className="section-text">
                It lets you compare two algorithms' scalability without running either of them.
              </p>
              <div className="code-badge">3n² + 5n + 2 → simplifies to O(n²)</div>
            </div>
            <div className="col-lg-5">
              <div className="mini-visual" style={{ fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: 1.9 }}>
                <div>O(1) &lt; O(log n) &lt; O(n)</div>
                <div>&lt; O(n log n) &lt; O(n²) &lt; O(2ⁿ)</div>
              </div>
            </div>
          </div>
        </section>

        <BigOVisualizer />

        <section className="content-card fade-in" id="bigo-classes">
          <h2 className="section-title">Common Complexity Classes</h2>
          <div className="row g-3">
            <div className="col-6 col-lg-3"><div className="op-card op-gray"><div className="op-icon"><i className="bi bi-dash"></i></div><h5>O(1)</h5><p>Constant — array index access</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-orange"><div className="op-icon"><i className="bi bi-arrow-left-right"></i></div><h5>O(log n)</h5><p>Logarithmic — binary search</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-pink"><div className="op-icon"><i className="bi bi-arrow-right"></i></div><h5>O(n)</h5><p>Linear — single loop</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-teal"><div className="op-icon"><i className="bi bi-grid-3x3"></i></div><h5>O(n²)</h5><p>Quadratic — nested loops</p></div></div>
          </div>
        </section>

        <section className="content-card fade-in" id="time-complexity">
          <h2 className="section-title">Growth at a glance (n = 1,000)</h2>
          <div className="table-responsive">
            <table className="table complexity-table mb-0">
              <thead><tr><th>Notation</th><th>Name</th><th>Approx. steps at n=1,000</th></tr></thead>
              <tbody>
                <tr><td>O(1)</td><td>Constant</td><td>1</td></tr>
                <tr><td>O(log n)</td><td>Logarithmic</td><td>~10</td></tr>
                <tr><td>O(n)</td><td>Linear</td><td>1,000</td></tr>
                <tr><td>O(n log n)</td><td>Linearithmic</td><td>~10,000</td></tr>
                <tr><td>O(n²)</td><td>Quadratic</td><td>1,000,000</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="content-card fade-in" id="pros-cons">
          <div className="row">
            <div className="col-md-6">
              <h2 className="section-title">Advantages</h2>
              <ul className="explain-list">
                <li>Hardware-independent way to compare algorithms</li>
                <li>Predicts how an algorithm will behave as data grows</li>
                <li>Universal vocabulary used across all of computer science</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h2 className="section-title">Disadvantages</h2>
              <ul className="explain-list">
                <li>Ignores constants, so a "slower" Big-O can be faster for small n in practice</li>
                <li>Worst-case focus can be overly pessimistic for typical inputs</li>
                <li>Doesn't capture real-world factors like cache locality or I/O</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="content-card fade-in" id="applications">
          <h2 className="section-title">Applications</h2>
          <ul className="explain-list">
            <li>Choosing between algorithms/data structures during design (e.g. array vs. hash map)</li>
            <li>Predicting whether code will scale to production-size data</li>
            <li>Communicating algorithm efficiency in technical interviews and code reviews</li>
            <li>Guiding optimization — knowing which part of the code dominates cost</li>
          </ul>
        </section>

        <section className="fade-in" id="code-example">
          <button className="btn code-example-badge">Code Example</button>
          <div className="row g-4 mt-1">
            <div className="col-lg-6">
              <CodeTabs
                panels={[
                  { lang: 'js', label: 'JavaScript', code: `// O(1) — constant time
function first(arr) { return arr[0]; }

// O(n) — linear time
function contains(arr, target) {
  for (const v of arr) {
    if (v === target) return true;
  }
  return false;
}

// O(n^2) — quadratic time
function hasDuplicate(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) return true;
    }
  }
  return false;
}` },
                  { lang: 'python', label: 'Python', code: `# O(1) — constant time
def first(arr):
    return arr[0]

# O(n) — linear time
def contains(arr, target):
    for v in arr:
        if v == target:
            return True
    return False

# O(n^2) — quadratic time
def has_duplicate(arr):
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            if arr[i] == arr[j]:
                return True
    return False` },
                  { lang: 'java', label: 'Java', code: `// O(1) — constant time
int first(int[] arr) { return arr[0]; }

// O(n) — linear time
boolean contains(int[] arr, int target) {
    for (int v : arr) {
        if (v == target) return true;
    }
    return false;
}

// O(n^2) — quadratic time
boolean hasDuplicate(int[] arr) {
    for (int i = 0; i < arr.length; i++) {
        for (int j = i + 1; j < arr.length; j++) {
            if (arr[i] == arr[j]) return true;
        }
    }
    return false;
}` },
                ]}
              />
            </div>
            <div className="col-lg-6">
              <div className="explain-card">
                <p>
                  Count the loops: no loop over the input means O(1); one loop over n elements means O(n); a loop
                  nested inside another loop, each running roughly n times, multiplies to O(n²). This "count the
                  nesting" heuristic covers most everyday code.
                </p>
                <h6>Key Properties</h6>
                <ul className="explain-list">
                  <li>Describes worst-case growth, not an exact runtime</li>
                  <li>Constants and lower-order terms are dropped</li>
                  <li>Nested loops over the same input generally multiply complexities</li>
                </ul>
                <a href="#applications" className="learn-more-link">See where Big-O is used <i className="bi bi-arrow-right"></i></a>
              </div>
            </div>
          </div>
          <div className="row g-4 mt-1">
            <div className="col-12">
              <div className="code-badge" style={{ display: 'block' }}>first → O(1), contains → O(n), hasDuplicate → O(n²)</div>
            </div>
          </div>
        </section>

        <section className="content-card fade-in" id="summary">
          <h2 className="section-title">Summary</h2>
          <p className="section-text">
            Big-O notation is the shared language for describing how an algorithm scales. Learning to recognize
            O(1), O(log n), O(n), O(n log n), and O(n²) patterns in code — and knowing their relative growth — is
            the single most useful skill for reasoning about performance across every data structure and algorithm
            covered in this course.
          </p>
        </section>

        <section className="content-card fade-in" id="take-quiz">
          <h2 className="section-title">Ready to test yourself?</h2>
          <p className="section-text">Take the 5-question quiz to check your understanding and save your score to your Dashboard.</p>
          <Link to="/quiz/big-o" className="btn btn-hero btn-hero-primary">
            <i className="bi bi-patch-question"></i> Take Quiz
          </Link>
        </section>

        <PracticeExercise
          task={<>For each of these, write down its Big-O: (1) printing every element of an array once, (2) checking
            every pair of elements in an array, (3) accessing <code>arr[5]</code> directly, (4) binary searching a
            sorted array.</>}
          hint="(1) One loop over n → O(n). (2) A pair-check is nested loops → O(n²). (3) Direct index access → O(1). (4) Binary search halves the range each step → O(log n)."
        />

        <LessonNav prev={{ to: '/learn/greedy', label: 'Greedy Algorithm' }} next={{ to: '/dashboard', label: 'Dashboard' }} />
      </main>

      <Footer />
    </div>
  );
}
