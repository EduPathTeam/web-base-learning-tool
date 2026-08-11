import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import LessonHero from '../../components/lessons/LessonHero';
import LessonProgressBar from '../../components/lessons/LessonProgressBar';
import StackVisualizer from '../../components/lessons/StackVisualizer';
import CodeTabs from '../../components/lessons/CodeTabs';
import PracticeExercise from '../../components/lessons/PracticeExercise';
import LessonNav from '../../components/lessons/LessonNav';
import useScrollReveal from '../../hooks/useScrollReveal';
import '../../styles/learn.css';
import '../../styles/array.css';

export default function StackLesson() {
  useScrollReveal();

  return (
    <div className="page-shell" data-nav-section="learn">
      <Header navSection="learn" />
      <LessonHero
        title="Stack Data Structure"
        subtitle="A linear data structure that follows the Last In First Out (LIFO) principle. The most recently added element is the first one removed."
      />

      <main className="container page-content page-shell-main">
        <LessonProgressBar topicId="stacks" lessonUrl="/learn/stack" />

        <section className="content-card fade-in" id="learning-objectives">
          <h2 className="section-title">Learning Objectives</h2>
          <ul className="objectives-list">
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Explain the LIFO principle and how it governs a stack.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Perform push, pop, and peek operations.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Connect the stack data structure to the function call stack.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Recognize real-world uses of stacks.</li>
          </ul>
        </section>

        <section className="content-card fade-in" id="what-is-stack">
          <div className="row gy-4 align-items-start">
            <div className="col-lg-7">
              <h2 className="section-title">What is a Stack?</h2>
              <p className="section-text">A stack is a linear data structure that follows the LIFO (Last In First Out) principle.</p>
              <p className="section-text">Elements are both inserted and removed from the same end, called the "top".</p>
              <div className="code-badge">stack.push(10) → stack.push(20) → stack.pop() returns 20</div>
            </div>
            <div className="col-lg-5">
              <div className="mini-visual">
                <div className="mini-visual-row">
                  <span className="mini-visual-label">Top →</span>
                  <span className="mini-value">30</span>
                </div>
                <div className="mini-visual-row">
                  <span className="mini-visual-label">&nbsp;</span>
                  <span className="mini-value">20</span>
                </div>
                <div className="mini-visual-row">
                  <span className="mini-visual-label">&nbsp;</span>
                  <span className="mini-value">10</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <StackVisualizer />

        <section className="content-card fade-in" id="stack-operations">
          <h2 className="section-title">Stack Operation</h2>
          <div className="row g-3">
            <div className="col-6 col-lg-3"><div className="op-card op-gray"><div className="op-icon"><i className="bi bi-arrow-up"></i></div><h5>Push</h5><p>Add to Top</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-orange"><div className="op-icon"><i className="bi bi-arrow-down"></i></div><h5>Pop</h5><p>Remove from Top</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-pink"><div className="op-icon"><i className="bi bi-eye"></i></div><h5>Peek</h5><p>View Top</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-teal"><div className="op-icon"><i className="bi bi-question-circle"></i></div><h5>Is Empty</h5><p>Check Stack</p></div></div>
          </div>
        </section>

        <section className="content-card fade-in" id="time-complexity">
          <h2 className="section-title">Time complexity</h2>
          <div className="table-responsive">
            <table className="table complexity-table mb-0">
              <thead><tr><th>Operation</th><th>Array Stack</th><th>Linked Stack</th></tr></thead>
              <tbody>
                <tr><td>Push</td><td>O(1) amortized</td><td>O(1)</td></tr>
                <tr><td>Pop</td><td>O(1)</td><td>O(1)</td></tr>
                <tr><td>Peek</td><td>O(1)</td><td>O(1)</td></tr>
                <tr><td>Search</td><td>O(n)</td><td>O(n)</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="content-card fade-in" id="pros-cons">
          <div className="row">
            <div className="col-md-6">
              <h2 className="section-title">Advantages</h2>
              <ul className="explain-list">
                <li>O(1) push and pop — very fast</li>
                <li>Simple to implement with an array or linked list</li>
                <li>Naturally models "reverse order" problems (undo, backtracking)</li>
                <li>Underpins recursion and expression evaluation</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h2 className="section-title">Disadvantages</h2>
              <ul className="explain-list">
                <li>No random access — can only reach the top element directly</li>
                <li>Searching for a value requires popping everything above it</li>
                <li>Fixed-size array stacks can overflow</li>
                <li>Deep recursion can exhaust the call stack ("stack overflow")</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="content-card fade-in" id="applications">
          <h2 className="section-title">Applications</h2>
          <ul className="explain-list">
            <li>Undo/redo functionality in editors</li>
            <li>Function call management (the call stack), enabling recursion</li>
            <li>Matching/validating parentheses and brackets in code</li>
            <li>Depth-First Search (DFS) traversal of trees and graphs</li>
            <li>Browser "back" button history</li>
          </ul>
        </section>

        <section className="fade-in" id="code-example">
          <button className="btn code-example-badge">Code Example</button>
          <div className="row g-4 mt-1">
            <div className="col-lg-6">
              <CodeTabs
                panels={[
                  { lang: 'js', label: 'JavaScript', code: `// A plain array works well as a stack
let stack = [];

// Push — O(1) amortized
stack.push(10);
stack.push(20);
stack.push(30);

console.log(stack); // [10, 20, 30]

// Pop — O(1)
const top = stack.pop();
console.log(top);   // 30
console.log(stack); // [10, 20]

// Peek at the top
console.log(stack[stack.length - 1]); // 20` },
                  { lang: 'python', label: 'Python', code: `# A Python list works well as a stack
stack = []

# Push — O(1) amortized
stack.append(10)
stack.append(20)
stack.append(30)
print(stack)  # [10, 20, 30]

# Pop — O(1)
top = stack.pop()
print(top)    # 30
print(stack)  # [10, 20]

# Peek at the top
print(stack[-1])  # 20` },
                  { lang: 'java', label: 'Java', code: `import java.util.Deque;
import java.util.ArrayDeque;

Deque<Integer> stack = new ArrayDeque<>();

stack.push(10);
stack.push(20);
stack.push(30);

System.out.println(stack); // [30, 20, 10]

int top = stack.pop(); // O(1)
System.out.println(top);      // 30
System.out.println(stack.peek()); // 20` },
                ]}
              />
            </div>
            <div className="col-lg-6">
              <div className="explain-card">
                <p>
                  A stack only ever exposes one end — the <strong>top</strong>. Every push adds there, every pop
                  removes from there. That single restriction is what gives a stack its LIFO behavior, and it's
                  exactly how your program tracks function calls: each call pushes a frame, each return pops one.
                </p>
                <h6>Key Properties</h6>
                <ul className="explain-list">
                  <li>LIFO ordering</li>
                  <li>Push and pop both happen at the top</li>
                  <li>O(1) push/pop with an array or linked list</li>
                  <li>The basis of recursion and DFS traversal</li>
                </ul>
                <a href="#applications" className="learn-more-link">See where stacks are used <i className="bi bi-arrow-right"></i></a>
              </div>
            </div>
          </div>
          <div className="row g-4 mt-1">
            <div className="col-12">
              <div className="code-badge" style={{ display: 'block' }}>Output: 30 then [10, 20], top peek is 20</div>
            </div>
          </div>
        </section>

        <section className="content-card fade-in" id="summary">
          <h2 className="section-title">Summary</h2>
          <p className="section-text">
            A stack enforces LIFO ordering: the last element in is the first one out. It's a small idea with huge
            reach — it's the mechanism behind function calls, undo history, and depth-first traversal.
          </p>
        </section>

        <section className="content-card fade-in" id="take-quiz">
          <h2 className="section-title">Ready to test yourself?</h2>
          <p className="section-text">Take the 5-question quiz to check your understanding and save your score to your Dashboard.</p>
          <Link to="/quiz/stacks" className="btn btn-hero btn-hero-primary">
            <i className="bi bi-patch-question"></i> Take Quiz
          </Link>
        </section>

        <PracticeExercise
          task={<>Write a function <code>isBalanced(str)</code> that uses a stack to check whether a string's
            parentheses <code>()</code>, <code>{'{}'}</code>, and <code>[]</code> are correctly matched and nested.
            Example: <code>"([{'{}'}])"</code> is balanced, <code>"([)]"</code> is not.</>}
          hint="Push every opening bracket onto the stack. On a closing bracket, pop the stack and check it matches — if it doesn't, or the stack is empty, the string is unbalanced. At the end, the stack must be empty."
        />

        <LessonNav prev={{ to: '/learn/queue', label: 'Queue' }} next={{ to: '/learn/tree', label: 'Tree' }} />
      </main>

      <Footer />
    </div>
  );
}
