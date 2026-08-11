import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import LessonHero from '../../components/lessons/LessonHero';
import LessonProgressBar from '../../components/lessons/LessonProgressBar';
import SortingVisualizer from '../../components/lessons/SortingVisualizer';
import CodeTabs from '../../components/lessons/CodeTabs';
import PracticeExercise from '../../components/lessons/PracticeExercise';
import LessonNav from '../../components/lessons/LessonNav';
import useScrollReveal from '../../hooks/useScrollReveal';
import '../../styles/learn.css';
import '../../styles/array.css';

export default function SortingLesson() {
  useScrollReveal();

  return (
    <div className="page-shell" data-nav-section="learn">
      <Header navSection="learn" />
      <LessonHero
        title="Sorting Algorithms"
        subtitle="Algorithms that rearrange a collection into a defined order — the building blocks behind search, deduplication, and much more."
      />

      <main className="container page-content page-shell-main">
        <LessonProgressBar topicId="sorting" lessonUrl="/learn/sorting" />

        <section className="content-card fade-in" id="learning-objectives">
          <h2 className="section-title">Learning Objectives</h2>
          <ul className="objectives-list">
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Trace Bubble Sort, Selection Sort, and Merge Sort by hand.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Compare sorting algorithms by time complexity and stability.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Explain why divide-and-conquer sorts outperform simple sorts at scale.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Choose an appropriate sort for a given situation.</li>
          </ul>
        </section>

        <section className="content-card fade-in" id="what-is-sorting">
          <div className="row gy-4 align-items-start">
            <div className="col-lg-7">
              <h2 className="section-title">What is Sorting?</h2>
              <p className="section-text">
                Sorting rearranges a collection of elements into a specific order — usually ascending or descending.
                Simple algorithms like Bubble Sort and Selection Sort compare pairs of elements directly; faster
                algorithms like Merge Sort and Quick Sort use <strong>divide-and-conquer</strong> to cut down the
                number of comparisons needed.
              </p>
              <div className="code-badge">[5, 2, 8, 1] → sort → [1, 2, 5, 8]</div>
            </div>
            <div className="col-lg-5">
              <div className="mini-visual">
                <div className="mini-visual-row"><span className="mini-visual-label">Before:</span><span className="mini-value">5</span><span className="mini-value">2</span><span className="mini-value">8</span><span className="mini-value">1</span></div>
                <div className="mini-visual-row"><span className="mini-visual-label">After:</span><span className="mini-value">1</span><span className="mini-value">2</span><span className="mini-value">5</span><span className="mini-value">8</span></div>
              </div>
            </div>
          </div>
        </section>

        <SortingVisualizer />

        <section className="content-card fade-in" id="sorting-algorithms">
          <h2 className="section-title">Common Sorting Algorithms</h2>
          <div className="row g-3">
            <div className="col-6 col-lg-3"><div className="op-card op-gray"><div className="op-icon"><i className="bi bi-arrow-repeat"></i></div><h5>Bubble Sort</h5><p>Swap adjacent pairs</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-orange"><div className="op-icon"><i className="bi bi-1-circle"></i></div><h5>Selection Sort</h5><p>Pick the minimum</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-pink"><div className="op-icon"><i className="bi bi-diagram-2"></i></div><h5>Merge Sort</h5><p>Divide and merge</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-teal"><div className="op-icon"><i className="bi bi-lightning"></i></div><h5>Quick Sort</h5><p>Partition by pivot</p></div></div>
          </div>
        </section>

        <section className="content-card fade-in" id="time-complexity">
          <h2 className="section-title">Time complexity</h2>
          <div className="table-responsive">
            <table className="table complexity-table mb-0">
              <thead><tr><th>Algorithm</th><th>Best</th><th>Average</th><th>Worst</th><th>Stable?</th></tr></thead>
              <tbody>
                <tr><td>Bubble Sort</td><td>O(n)</td><td>O(n²)</td><td>O(n²)</td><td>Yes</td></tr>
                <tr><td>Selection Sort</td><td>O(n²)</td><td>O(n²)</td><td>O(n²)</td><td>No</td></tr>
                <tr><td>Merge Sort</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n log n)</td><td>Yes</td></tr>
                <tr><td>Quick Sort</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n²)</td><td>No</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="content-card fade-in" id="pros-cons">
          <div className="row">
            <div className="col-md-6">
              <h2 className="section-title">Advantages</h2>
              <ul className="explain-list">
                <li>Simple sorts (Bubble/Selection) are easy to understand and implement</li>
                <li>Merge Sort guarantees O(n log n) even in the worst case, and is stable</li>
                <li>Quick Sort is typically the fastest in practice, sorts in-place</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h2 className="section-title">Disadvantages</h2>
              <ul className="explain-list">
                <li>Bubble/Selection Sort are too slow for large datasets — O(n²)</li>
                <li>Merge Sort needs O(n) extra memory for merging</li>
                <li>Quick Sort's worst case is O(n²) with a poor pivot choice</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="content-card fade-in" id="applications">
          <h2 className="section-title">Applications</h2>
          <ul className="explain-list">
            <li>Preparing data for binary search</li>
            <li>Database ORDER BY queries and indexing</li>
            <li>Displaying leaderboards, search results ranked by relevance</li>
            <li>Removing duplicates (easier once data is sorted)</li>
          </ul>
        </section>

        <section className="fade-in" id="code-example">
          <button className="btn code-example-badge">Code Example</button>
          <div className="row g-4 mt-1">
            <div className="col-lg-6">
              <CodeTabs
                panels={[
                  { lang: 'js', label: 'JavaScript', code: `function bubbleSort(arr) {
  const a = [...arr];
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
      }
    }
  }
  return a;
}

console.log(bubbleSort([5, 2, 8, 1])); // [1, 2, 5, 8]` },
                  { lang: 'python', label: 'Python', code: `def bubble_sort(arr):
    a = arr[:]
    n = len(a)
    for i in range(n - 1):
        for j in range(n - i - 1):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
    return a

print(bubble_sort([5, 2, 8, 1]))  # [1, 2, 5, 8]` },
                  { lang: 'java', label: 'Java', code: `int[] bubbleSort(int[] arr) {
    int[] a = arr.clone();
    for (int i = 0; i < a.length - 1; i++) {
        for (int j = 0; j < a.length - i - 1; j++) {
            if (a[j] > a[j + 1]) {
                int tmp = a[j];
                a[j] = a[j + 1];
                a[j + 1] = tmp;
            }
        }
    }
    return a;
}

// bubbleSort({5, 2, 8, 1}) -> {1, 2, 5, 8}` },
                ]}
              />
            </div>
            <div className="col-lg-6">
              <div className="explain-card">
                <p>
                  Bubble Sort repeatedly walks the array, swapping any adjacent pair that's out of order. After each
                  full pass, the largest unsorted element "bubbles" to its correct position at the end — which is
                  why the inner loop shrinks by one each time.
                </p>
                <h6>Key Properties</h6>
                <ul className="explain-list">
                  <li>Simple but O(n²) — fine for small or nearly-sorted data only</li>
                  <li>Stable — equal elements keep their relative order</li>
                  <li>In-place — needs no extra array</li>
                </ul>
                <a href="#applications" className="learn-more-link">See where sorting is used <i className="bi bi-arrow-right"></i></a>
              </div>
            </div>
          </div>
          <div className="row g-4 mt-1">
            <div className="col-12">
              <div className="code-badge" style={{ display: 'block' }}>Output: [1, 2, 5, 8]</div>
            </div>
          </div>
        </section>

        <section className="content-card fade-in" id="summary">
          <h2 className="section-title">Summary</h2>
          <p className="section-text">
            Sorting algorithms range from simple O(n²) comparisons (Bubble, Selection Sort) to efficient O(n log n)
            divide-and-conquer approaches (Merge, Quick Sort). Picking the right one depends on data size, memory
            constraints, and whether stability matters.
          </p>
        </section>

        <section className="content-card fade-in" id="take-quiz">
          <h2 className="section-title">Ready to test yourself?</h2>
          <p className="section-text">Take the 5-question quiz to check your understanding and save your score to your Dashboard.</p>
          <Link to="/quiz/sorting" className="btn btn-hero btn-hero-primary">
            <i className="bi bi-patch-question"></i> Take Quiz
          </Link>
        </section>

        <PracticeExercise
          task={<>Implement <code>selectionSort(arr)</code>: repeatedly find the minimum value in the unsorted portion
            of the array and swap it into the next sorted position.</>}
          hint="Use two nested loops: the outer loop marks the boundary of the sorted region, the inner loop scans the rest of the array to find the index of the minimum value to swap in."
        />

        <LessonNav prev={{ to: '/learn/dynamic-programming', label: 'Dynamic Programming' }} next={{ to: '/learn/searching', label: 'Searching Algorithms' }} />
      </main>

      <Footer />
    </div>
  );
}
