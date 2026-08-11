import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import LessonHero from '../../components/lessons/LessonHero';
import LessonProgressBar from '../../components/lessons/LessonProgressBar';
import LinkedListVisualizer from '../../components/lessons/LinkedListVisualizer';
import CodeTabs from '../../components/lessons/CodeTabs';
import PracticeExercise from '../../components/lessons/PracticeExercise';
import LessonNav from '../../components/lessons/LessonNav';
import useScrollReveal from '../../hooks/useScrollReveal';
import '../../styles/learn.css';
import '../../styles/array.css';

export default function LinkedListLesson() {
  useScrollReveal();

  return (
    <div className="page-shell" data-nav-section="learn">
      <Header navSection="learn" />
      <LessonHero
        title="Linked List Data Structure"
        subtitle="A chain of nodes where each node stores data and a pointer to the next node. Elements are not stored in contiguous memory."
      />

      <main className="container page-content page-shell-main">
        <LessonProgressBar topicId="linked-lists" lessonUrl="/learn/linked-list" />

        <section className="content-card fade-in" id="learning-objectives">
          <h2 className="section-title">Learning Objectives</h2>
          <ul className="objectives-list">
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Explain how a linked list stores data using nodes and pointers.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Insert and delete nodes at the head, tail, or middle of a list.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Compare a linked list's performance against an array's.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Recognize real-world uses of linked lists.</li>
          </ul>
        </section>

        <section className="content-card fade-in" id="what-is-linked-list">
          <div className="row gy-4 align-items-start">
            <div className="col-lg-7">
              <h2 className="section-title">What is a Linked List?</h2>
              <p className="section-text">
                A linked list is a linear data structure made of <strong>nodes</strong>. Each node holds a piece of
                data and a reference (a "next" pointer) to the following node in the sequence.
              </p>
              <p className="section-text">
                Unlike an array, the nodes are not stored next to each other in memory — they can live anywhere,
                connected only by their pointers. The last node points to <code>null</code>, marking the end of the list.
              </p>
              <div className="code-badge">head → [10|•] → [20|•] → [30|null]</div>
            </div>
            <div className="col-lg-5">
              <div className="mini-visual">
                <div className="mini-visual-row">
                  <span className="mini-visual-label">Node:</span>
                  <span className="mini-value">10</span>
                  <i className="bi bi-arrow-right"></i>
                  <span className="mini-value">20</span>
                  <i className="bi bi-arrow-right"></i>
                  <span className="mini-value">30</span>
                </div>
                <div className="mini-visual-row">
                  <span className="mini-visual-label">&nbsp;</span>
                  <span className="mini-index">head</span>
                  <span className="mini-index">&nbsp;</span>
                  <span className="mini-index">&nbsp;</span>
                  <span className="mini-index">&nbsp;</span>
                  <span className="mini-index">null</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <LinkedListVisualizer />

        <section className="content-card fade-in" id="ll-operations">
          <h2 className="section-title">Linked List Operations</h2>
          <div className="row g-3">
            <div className="col-6 col-lg-3"><div className="op-card op-gray"><div className="op-icon"><i className="bi bi-arrow-right"></i></div><h5>Traversal</h5><p>Follow next pointers</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-orange"><div className="op-icon"><i className="bi bi-box-arrow-in-down-right"></i></div><h5>Insertion</h5><p>Add a node</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-pink"><div className="op-icon"><i className="bi bi-dash-square"></i></div><h5>Deletion</h5><p>Unlink a node</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-teal"><div className="op-icon"><i className="bi bi-search"></i></div><h5>Searching</h5><p>Find a node's value</p></div></div>
          </div>
        </section>

        <section className="content-card fade-in" id="time-complexity">
          <h2 className="section-title">Time complexity</h2>
          <div className="table-responsive">
            <table className="table complexity-table mb-0">
              <thead><tr><th>Operation</th><th>Access</th><th>Insert at Head</th><th>Insert at Tail</th><th>Search</th></tr></thead>
              <tbody><tr><td>Singly Linked List</td><td>O(n)</td><td>O(1)</td><td>O(n) *</td><td>O(n)</td></tr></tbody>
            </table>
            <p className="section-text" style={{ marginTop: '10px', fontSize: '0.82rem' }}>* O(1) if a tail pointer is kept; otherwise O(n) to reach the end.</p>
          </div>
        </section>

        <section className="content-card fade-in" id="pros-cons">
          <div className="row">
            <div className="col-md-6">
              <h2 className="section-title">Advantages</h2>
              <ul className="explain-list">
                <li>Dynamic size — grows and shrinks without reallocating memory</li>
                <li>O(1) insertion/deletion at the head (no shifting)</li>
                <li>No wasted memory from over-allocation</li>
                <li>Easy to implement stacks and queues on top of it</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h2 className="section-title">Disadvantages</h2>
              <ul className="explain-list">
                <li>No random access — must traverse from the head, O(n)</li>
                <li>Extra memory per node for storing the pointer</li>
                <li>Not cache-friendly — nodes are scattered in memory</li>
                <li>Reversing/searching is more complex than with an array</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="content-card fade-in" id="applications">
          <h2 className="section-title">Applications</h2>
          <ul className="explain-list">
            <li>Implementing stacks, queues, and adjacency lists for graphs</li>
            <li>Undo functionality in text editors (doubly linked list)</li>
            <li>Music/video "playlist" next/previous navigation</li>
            <li>Memory allocators — free-block lists in an operating system</li>
          </ul>
        </section>

        <section className="fade-in" id="code-example">
          <button className="btn code-example-badge">Code Example</button>
          <div className="row g-4 mt-1">
            <div className="col-lg-6">
              <CodeTabs
                panels={[
                  { lang: 'js', label: 'JavaScript', code: `// A minimal singly linked list
class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor() { this.head = null; }

  // Insert at head — O(1)
  insertAtHead(value) {
    const node = new Node(value);
    node.next = this.head;
    this.head = node;
  }
}` },
                  { lang: 'python', label: 'Python', code: `# A minimal singly linked list
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    # Insert at head — O(1)
    def insert_at_head(self, value):
        node = Node(value)
        node.next = self.head
        self.head = node` },
                  { lang: 'java', label: 'Java', code: `// A minimal singly linked list
class Node {
    int value;
    Node next;
    Node(int value) { this.value = value; }
}

class LinkedList {
    Node head;

    // Insert at head — O(1)
    void insertAtHead(int value) {
        Node node = new Node(value);
        node.next = head;
        head = node;
    }
}` },
                ]}
              />
            </div>
            <div className="col-lg-6">
              <div className="explain-card">
                <p>
                  Each node owns two things: its <strong>value</strong> and a <strong>pointer to the next node</strong>.
                  Building the list means wiring these pointers together — inserting at the head is just a matter of
                  pointing the new node at the old head, then moving the head pointer, no shifting required.
                </p>
                <h6>Key Properties</h6>
                <ul className="explain-list">
                  <li>Nodes are linked, not contiguous in memory</li>
                  <li>O(1) insertion/deletion at the head</li>
                  <li>O(n) access/search — must traverse from the head</li>
                  <li>The last node's "next" is null</li>
                  <li>A doubly linked list also stores a "previous" pointer</li>
                </ul>
                <a href="#applications" className="learn-more-link">See where linked lists are used <i className="bi bi-arrow-right"></i></a>
              </div>
            </div>
          </div>
          <div className="row g-4 mt-1">
            <div className="col-12">
              <div className="code-badge" style={{ display: 'block' }}>Output: head → 20 → 10 → 30 → null</div>
            </div>
          </div>
        </section>

        <section className="content-card fade-in" id="summary">
          <h2 className="section-title">Summary</h2>
          <p className="section-text">
            A linked list trades an array's fast O(1) index access for fast O(1) insertion/deletion at the head, by
            giving up contiguous memory in favor of nodes connected through pointers. It's the foundation for
            building stacks, queues, and more advanced structures like graphs.
          </p>
        </section>

        <section className="content-card fade-in" id="take-quiz">
          <h2 className="section-title">Ready to test yourself?</h2>
          <p className="section-text">Take the 5-question quiz to check your understanding and save your score to your Dashboard.</p>
          <Link to="/quiz/linked-lists" className="btn btn-hero btn-hero-primary">
            <i className="bi bi-patch-question"></i> Take Quiz
          </Link>
        </section>

        <PracticeExercise
          task={<>Write a function <code>listLength(head)</code> that takes the head node of a linked list and returns
            how many nodes it contains, by traversing the list until you reach <code>null</code>.</>}
          hint={<>Start a counter at 0 and a pointer at the head. While the pointer isn't null, increment the counter and
            move the pointer to <code>pointer.next</code>.</>}
        />

        <LessonNav prev={{ to: '/learn/array', label: 'Array' }} next={{ to: '/learn/queue', label: 'Queue' }} />
      </main>

      <Footer />
    </div>
  );
}
