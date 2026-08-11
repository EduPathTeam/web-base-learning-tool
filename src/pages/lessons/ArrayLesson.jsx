import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import LessonHero from '../../components/lessons/LessonHero';
import LessonProgressBar from '../../components/lessons/LessonProgressBar';
import ArrayVisualizer from '../../components/lessons/ArrayVisualizer';
import CodeTabs from '../../components/lessons/CodeTabs';
import PracticeExercise from '../../components/lessons/PracticeExercise';
import LessonNav from '../../components/lessons/LessonNav';
import useScrollReveal from '../../hooks/useScrollReveal';
import '../../styles/learn.css';
import '../../styles/array.css';

export default function ArrayLesson() {
  useScrollReveal();

  return (
    <div className="page-shell" data-nav-section="learn">
      <Header navSection="learn" />
      <LessonHero
        title="Array Data Structure"
        subtitle={<>A collection of elements stored in contiguous memory locations.<br />Each element can be accessed using its index.</>}
      />

      <main className="container page-content page-shell-main">
        <LessonProgressBar topicId="arrays" lessonUrl="/learn/array" />

        <section className="content-card fade-in" id="learning-objectives">
          <h2 className="section-title">Learning Objectives</h2>
          <ul className="objectives-list">
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Explain what an array is and why elements are stored contiguously in memory.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Access, insert, delete, and update elements using an index.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Analyze the time complexity of common array operations.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Identify real-world situations where arrays are the right data structure to use.</li>
          </ul>
        </section>

        <section className="content-card fade-in" id="what-is-array">
          <div className="row gy-4 align-items-start">
            <div className="col-lg-7">
              <h2 className="section-title">What is an Array?</h2>
              <p className="section-text">An array is a linear data structure that stores multiple elements in contiguous memory locations.</p>
              <p className="section-text">Each element is accessed using an index.</p>
              <div className="code-badge">arr = [ 10, 20, 30, 40, 50 ]</div>
            </div>
            <div className="col-lg-5">
              <div className="mini-visual">
                <div className="mini-visual-row">
                  <span className="mini-visual-label">Index:</span>
                  {[0, 1, 2, 3, 4].map((i) => <span key={i} className="mini-index">{i}</span>)}
                </div>
                <div className="mini-visual-row">
                  <span className="mini-visual-label">Value:</span>
                  {[10, 20, 30, 40, 50].map((v) => <span key={v} className="mini-value">{v}</span>)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <ArrayVisualizer />

        <section className="content-card fade-in" id="array-operations">
          <h2 className="section-title">Array Operation</h2>
          <div className="row g-3">
            <div className="col-6 col-lg-3"><div className="op-card op-gray"><div className="op-icon"><i className="bi bi-arrow-right"></i></div><h5>Traversal</h5><p>View Elements</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-orange"><div className="op-icon"><i className="bi bi-box-arrow-in-down-right"></i></div><h5>Insertion</h5><p>Add Elements</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-pink"><div className="op-icon"><i className="bi bi-dash-square"></i></div><h5>Deletion</h5><p>Remove Elements</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-teal"><div className="op-icon"><i className="bi bi-search"></i></div><h5>Searching</h5><p>Find Elements</p></div></div>
          </div>
        </section>

        <section className="content-card fade-in" id="time-complexity">
          <h2 className="section-title">Time complexity</h2>
          <div className="table-responsive">
            <table className="table complexity-table mb-0">
              <thead><tr><th>Operation</th><th>Insert</th><th>Delete</th><th>Search</th></tr></thead>
              <tbody>
                <tr><td>Accesses</td><td>O(n)</td><td>O(n)</td><td>O(1)</td></tr>
                <tr><td>Search</td><td>O(n)</td><td>O(n)</td><td>O(n)</td></tr>
                <tr><td>Insert</td><td>O(n)</td><td>O(n)</td><td>O(n)</td></tr>
                <tr><td>Delete</td><td>O(n)</td><td>O(n)</td><td>O(n)</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="content-card fade-in" id="pros-cons">
          <div className="row">
            <div className="col-md-6">
              <h2 className="section-title">Advantages</h2>
              <ul className="explain-list">
                <li>Constant-time O(1) access to any element via its index</li>
                <li>Simple and predictable memory layout</li>
                <li>Cache-friendly — contiguous memory improves performance</li>
                <li>Easy to iterate over with a loop</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h2 className="section-title">Disadvantages</h2>
              <ul className="explain-list">
                <li>Fixed size in many languages — resizing means copying the whole array</li>
                <li>Inserting/deleting in the middle requires shifting elements — O(n)</li>
                <li>Wastes memory if allocated larger than needed</li>
                <li>Searching for a value (not by index) is O(n) unless sorted</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="content-card fade-in" id="applications">
          <h2 className="section-title">Applications</h2>
          <ul className="explain-list">
            <li>Storing and processing lists of records (student grades, prices, sensor readings)</li>
            <li>Implementing other data structures: stacks, queues, hash tables, heaps</li>
            <li>Image data — pixels stored as 2D/3D arrays</li>
            <li>Lookup tables and matrices in scientific computing</li>
          </ul>
        </section>

        <section className="fade-in" id="code-example">
          <button className="btn code-example-badge">Code Example</button>
          <div className="row g-4 mt-1">
            <div className="col-lg-6">
              <CodeTabs
                panels={[
                  { lang: 'js', label: 'JavaScript', code: `// Creating and using an array
const fruits = ['Apple', 'Banana', 'Cherry'];

// Access by index — O(1)
console.log(fruits[0]); // 'Apple'

// Add to end — O(1) amortized
fruits.push('Date');

// Insert at position — O(n)
fruits.splice(1, 0, 'Blueberry');

// Remove — O(n)
fruits.splice(1, 1);` },
                  { lang: 'python', label: 'Python', code: `# Creating and using a list (Python's dynamic array)
fruits = ['Apple', 'Banana', 'Cherry']

# Access by index — O(1)
print(fruits[0])  # 'Apple'

# Add to end — O(1) amortized
fruits.append('Date')

# Insert at position — O(n)
fruits.insert(1, 'Blueberry')

# Remove by index — O(n)
fruits.pop(1)` },
                  { lang: 'java', label: 'Java', code: `// Creating and using an array
int[] numbers = {10, 20, 30, 40, 50};

// Access by index — O(1)
System.out.println(numbers[0]); // 10

// Update an element — O(1)
numbers[2] = 99;

// Fixed-size arrays can't grow — use ArrayList for that:
import java.util.ArrayList;
ArrayList<Integer> list = new ArrayList<>();
list.add(10);
list.remove(0); // O(n)` },
                ]}
              />
            </div>
            <div className="col-lg-6">
              <div className="explain-card">
                <p>
                  The most fundamental data structure — storing elements in contiguous memory. As an array is a
                  collection of elements stored in contiguous memory locations, each element can be accessed
                  directly using its index (position number), making arrays extremely efficient for random
                  access operations.
                </p>
                <h6>Key Properties</h6>
                <ul className="explain-list">
                  <li>Fixed size in most languages (dynamic arrays like JavaScript's can grow)</li>
                  <li>Elements stored sequentially in memory</li>
                  <li>O(1) access time by index</li>
                  <li>O(n) insertion/deletion in worst case due to shifting elements</li>
                  <li>Arrays are the building block of most other data structures</li>
                </ul>
                <a href="#applications" className="learn-more-link">See where arrays are used <i className="bi bi-arrow-right"></i></a>
              </div>
            </div>
          </div>
          <div className="row g-4 mt-1">
            <div className="col-12">
              <div className="code-badge" style={{ display: 'block' }}>
                Output: Apple<br />
                {"['Apple', 'Blueberry', 'Banana', 'Cherry', 'Date']"}
              </div>
            </div>
          </div>
        </section>

        <section className="content-card fade-in" id="summary">
          <h2 className="section-title">Summary</h2>
          <p className="section-text">
            An array stores elements in contiguous memory and gives O(1) access by index, but O(n) insertion/deletion
            when elements must shift. It is the simplest and most widely used data structure, and understanding it
            is the foundation for learning linked lists, stacks, queues, and beyond.
          </p>
        </section>

        <section className="content-card fade-in" id="take-quiz">
          <h2 className="section-title">Ready to test yourself?</h2>
          <p className="section-text">Take the 5-question quiz to check your understanding and save your score to your Dashboard.</p>
          <Link to="/quiz/arrays" className="btn btn-hero btn-hero-primary">
            <i className="bi bi-patch-question"></i> Take Quiz
          </Link>
        </section>

        <PracticeExercise
          task={<>Write a function <code>secondLargest(arr)</code> that returns the second largest value in an array of
            numbers, without sorting the array. Example: <code>secondLargest([10, 40, 15, 3])</code> should return{' '}
            <code>15</code>.</>}
          hint="Track two variables as you loop once through the array: the largest value seen so far, and the second largest. Update both whenever you find a new largest value."
        />

        <LessonNav prev={{ to: '/learn', label: 'All Lessons' }} next={{ to: '/learn/linked-list', label: 'Linked List' }} />
      </main>

      <Footer />
    </div>
  );
}
