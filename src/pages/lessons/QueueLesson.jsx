import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import LessonHero from '../../components/lessons/LessonHero';
import LessonProgressBar from '../../components/lessons/LessonProgressBar';
import QueueVisualizer from '../../components/lessons/QueueVisualizer';
import CodeTabs from '../../components/lessons/CodeTabs';
import PracticeExercise from '../../components/lessons/PracticeExercise';
import LessonNav from '../../components/lessons/LessonNav';
import useScrollReveal from '../../hooks/useScrollReveal';
import '../../styles/learn.css';
import '../../styles/array.css';

export default function QueueLesson() {
  useScrollReveal();

  return (
    <div className="page-shell" data-nav-section="learn">
      <Header navSection="learn" />
      <LessonHero
        title="Queue Data Structure"
        subtitle="A linear data structure that follows the First In First Out (FIFO) principle. The first element inserted is the first element removed."
      />

      <main className="container page-content page-shell-main">
        <LessonProgressBar topicId="queues" lessonUrl="/learn/queue" />

        <section className="content-card fade-in" id="learning-objectives">
          <h2 className="section-title">Learning Objectives</h2>
          <ul className="objectives-list">
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Explain the FIFO principle and how it governs a queue.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Perform enqueue, dequeue, and peek operations.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Compare array-based and linked-list-based queue implementations.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Recognize real-world systems that rely on queues.</li>
          </ul>
        </section>

        <section className="content-card fade-in" id="what-is-queue">
          <div className="row gy-4 align-items-start">
            <div className="col-lg-7">
              <h2 className="section-title">What is a Queue?</h2>
              <p className="section-text">A queue is a linear data structure that follows the FIFO (First In First Out) principle.</p>
              <p className="section-text">Elements are inserted at the rear and removed from the front.</p>
              <div className="code-badge">queue = [10, 20, 30, 40]</div>
            </div>
            <div className="col-lg-5">
              <div className="mini-visual">
                <div className="mini-visual-row">
                  <span className="mini-visual-label">Front:</span>
                  <span className="mini-value">10</span>
                  <i className="bi bi-arrow-right"></i>
                  <span className="mini-value">20</span>
                  <i className="bi bi-arrow-right"></i>
                  <span className="mini-value">30</span>
                  <span style={{ marginLeft: 8, fontSize: '0.8rem', color: 'var(--gray-text)' }}>Rear</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <QueueVisualizer />

        <section className="content-card fade-in" id="queue-operations">
          <h2 className="section-title">Queue Operation</h2>
          <div className="row g-3">
            <div className="col-6 col-lg-3"><div className="op-card op-gray"><div className="op-icon"><i className="bi bi-arrow-right"></i></div><h5>Enqueue</h5><p>Add Elements</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-orange"><div className="op-icon"><i className="bi bi-box-arrow-in-down-right"></i></div><h5>Dequeue</h5><p>Remove Element</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-pink"><div className="op-icon"><i className="bi bi-eye"></i></div><h5>Peek</h5><p>View Front</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-teal"><div className="op-icon"><i className="bi bi-question-circle"></i></div><h5>Is Empty</h5><p>Check Queue</p></div></div>
          </div>
        </section>

        <section className="content-card fade-in" id="time-complexity">
          <h2 className="section-title">Time complexity</h2>
          <div className="table-responsive">
            <table className="table complexity-table mb-0">
              <thead><tr><th>Operation</th><th>Array Queue</th><th>Linked Queue</th></tr></thead>
              <tbody>
                <tr><td>Enqueue</td><td>O(1)</td><td>O(1)</td></tr>
                <tr><td>Dequeue</td><td>O(n) *</td><td>O(1)</td></tr>
                <tr><td>Peek</td><td>O(1)</td><td>O(1)</td></tr>
                <tr><td>Search</td><td>O(n)</td><td>O(n)</td></tr>
              </tbody>
            </table>
            <p className="section-text" style={{ marginTop: '10px', fontSize: '0.82rem' }}>* O(1) with a circular buffer or front-index pointer instead of shifting the whole array.</p>
          </div>
        </section>

        <section className="content-card fade-in" id="pros-cons">
          <div className="row">
            <div className="col-md-6">
              <h2 className="section-title">Advantages</h2>
              <ul className="explain-list">
                <li>Simple, predictable FIFO ordering</li>
                <li>O(1) enqueue and (with the right implementation) O(1) dequeue</li>
                <li>Natural fit for task scheduling and buffering</li>
                <li>Easy to implement with either an array or a linked list</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h2 className="section-title">Disadvantages</h2>
              <ul className="explain-list">
                <li>No random access — must dequeue in order to reach inner elements</li>
                <li>A naive array-based queue can be O(n) on dequeue (shifting)</li>
                <li>Fixed-size array queues can overflow without a circular buffer</li>
                <li>Searching for a value is O(n)</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="content-card fade-in" id="applications">
          <h2 className="section-title">Applications</h2>
          <ul className="explain-list">
            <li>CPU task scheduling and print job spooling</li>
            <li>Breadth-First Search (BFS) traversal of trees and graphs</li>
            <li>Message queues / buffering data between producers and consumers</li>
            <li>Handling requests in a web server, in the order they arrive</li>
          </ul>
        </section>

        <section className="fade-in" id="code-example">
          <button className="btn code-example-badge">Code Example</button>
          <div className="row g-4 mt-1">
            <div className="col-lg-6">
              <CodeTabs
                panels={[
                  { lang: 'js', label: 'JavaScript', code: `// Create an empty queue
let queue = [];

// Enqueue elements — O(1)
queue.push(10);
queue.push(20);
queue.push(30);

console.log(queue); // [10, 20, 30]

// Dequeue the front element — O(n) for a plain array
queue.shift();

console.log(queue); // [20, 30]

// Peek at the front element
console.log(queue[0]); // 20` },
                  { lang: 'python', label: 'Python', code: `from collections import deque

# deque gives O(1) enqueue/dequeue from both ends
queue = deque()

queue.append(10)
queue.append(20)
queue.append(30)
print(queue)  # deque([10, 20, 30])

# Dequeue the front element — O(1)
queue.popleft()
print(queue)  # deque([20, 30])

# Peek at the front element
print(queue[0])  # 20` },
                  { lang: 'java', label: 'Java', code: `import java.util.LinkedList;
import java.util.Queue;

Queue<Integer> queue = new LinkedList<>();

queue.offer(10); // enqueue
queue.offer(20);
queue.offer(30);

System.out.println(queue); // [10, 20, 30]

queue.poll(); // dequeue — O(1)
System.out.println(queue); // [20, 30]

System.out.println(queue.peek()); // 20` },
                ]}
              />
            </div>
            <div className="col-lg-6">
              <div className="explain-card">
                <p>
                  A queue only exposes two ends: the <strong>rear</strong>, where new items are enqueued, and the
                  <strong> front</strong>, where the oldest item is dequeued. This restriction is exactly what makes
                  it useful — it guarantees fairness (first come, first served) for anything modeled as a line.
                </p>
                <h6>Key Properties</h6>
                <ul className="explain-list">
                  <li>FIFO ordering</li>
                  <li>Insertion at the rear, removal from the front</li>
                  <li>Use a linked list or circular buffer for true O(1) dequeue</li>
                  <li>The core building block of BFS traversal</li>
                </ul>
                <a href="#applications" className="learn-more-link">See where queues are used <i className="bi bi-arrow-right"></i></a>
              </div>
            </div>
          </div>
          <div className="row g-4 mt-1">
            <div className="col-12">
              <div className="code-badge" style={{ display: 'block' }}>Output: [20, 30] then front is 20</div>
            </div>
          </div>
        </section>

        <section className="content-card fade-in" id="summary">
          <h2 className="section-title">Summary</h2>
          <p className="section-text">
            A queue enforces FIFO ordering: elements leave in the same order they arrived. It's the natural
            structure for anything that needs fairness or ordered processing — task scheduling, buffering, and
            breadth-first traversal all depend on it.
          </p>
        </section>

        <section className="content-card fade-in" id="take-quiz">
          <h2 className="section-title">Ready to test yourself?</h2>
          <p className="section-text">Take the 5-question quiz to check your understanding and save your score to your Dashboard.</p>
          <Link to="/quiz/queues" className="btn btn-hero btn-hero-primary">
            <i className="bi bi-patch-question"></i> Take Quiz
          </Link>
        </section>

        <PracticeExercise
          task={<>Implement a queue using two stacks. Write <code>enqueue(value)</code> and <code>dequeue()</code> functions
            that only use stack operations (push/pop) internally — no array shift/unshift.</>}
          hint="Keep an 'in' stack for enqueue. When dequeue is called and the 'out' stack is empty, pop everything from 'in' onto 'out' (this reverses the order), then pop from 'out'."
        />

        <LessonNav prev={{ to: '/learn/linked-list', label: 'Linked List' }} next={{ to: '/learn/stack', label: 'Stack' }} />
      </main>

      <Footer />
    </div>
  );
}
