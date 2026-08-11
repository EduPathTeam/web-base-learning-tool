import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import LessonHero from '../../components/lessons/LessonHero';
import LessonProgressBar from '../../components/lessons/LessonProgressBar';
import SearchingVisualizer from '../../components/lessons/SearchingVisualizer';
import CodeTabs from '../../components/lessons/CodeTabs';
import PracticeExercise from '../../components/lessons/PracticeExercise';
import LessonNav from '../../components/lessons/LessonNav';
import useScrollReveal from '../../hooks/useScrollReveal';
import '../../styles/learn.css';
import '../../styles/array.css';

export default function SearchingLesson() {
  useScrollReveal();

  return (
    <div className="page-shell" data-nav-section="learn">
      <Header navSection="learn" />
      <LessonHero
        title="Searching Algorithms"
        subtitle="Algorithms that find a target value within a collection — from simple scans to fast divide-and-conquer lookups."
      />

      <main className="container page-content page-shell-main">
        <LessonProgressBar topicId="searching" lessonUrl="/learn/searching" />

        <section className="content-card fade-in" id="learning-objectives">
          <h2 className="section-title">Learning Objectives</h2>
          <ul className="objectives-list">
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Implement Linear Search and Binary Search.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Explain why Binary Search requires sorted data.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Compare their time complexities.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Choose the right search strategy for a given dataset.</li>
          </ul>
        </section>

        <section className="content-card fade-in" id="what-is-searching">
          <div className="row gy-4 align-items-start">
            <div className="col-lg-7">
              <h2 className="section-title">What is Searching?</h2>
              <p className="section-text">
                Searching is finding whether (and where) a target value exists in a collection.{' '}
                <strong>Linear Search</strong> checks every element one by one — it works on any data, sorted or not.{' '}
                <strong>Binary Search</strong> is far faster but only works on <strong>sorted</strong> data: it
                repeatedly checks the middle element and discards the half that can't contain the target.
              </p>
              <div className="code-badge">Linear: check 0,1,2,... — Binary: check middle, then half again</div>
            </div>
            <div className="col-lg-5">
              <div className="mini-visual" style={{ fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: 1.8 }}>
                <div>[4, 9, 15, 22, 30, 38, 45]</div>
                <div>mid=22 → target &gt; 22 → search right</div>
                <div>[30, 38, 45] → mid=38 → ...</div>
              </div>
            </div>
          </div>
        </section>

        <SearchingVisualizer />

        <section className="content-card fade-in" id="searching-concepts">
          <h2 className="section-title">Search Strategies</h2>
          <div className="row g-3">
            <div className="col-6 col-lg-3"><div className="op-card op-gray"><div className="op-icon"><i className="bi bi-arrow-right"></i></div><h5>Linear Search</h5><p>Check each element</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-orange"><div className="op-icon"><i className="bi bi-arrow-left-right"></i></div><h5>Binary Search</h5><p>Halve the range</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-pink"><div className="op-icon"><i className="bi bi-diagram-3"></i></div><h5>BFS/DFS Search</h5><p>Search a graph/tree</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-teal"><div className="op-icon"><i className="bi bi-hash"></i></div><h5>Hash Lookup</h5><p>O(1) average</p></div></div>
          </div>
        </section>

        <section className="content-card fade-in" id="time-complexity">
          <h2 className="section-title">Time complexity</h2>
          <div className="table-responsive">
            <table className="table complexity-table mb-0">
              <thead><tr><th>Algorithm</th><th>Requires Sorted?</th><th>Best</th><th>Worst</th></tr></thead>
              <tbody>
                <tr><td>Linear Search</td><td>No</td><td>O(1)</td><td>O(n)</td></tr>
                <tr><td>Binary Search</td><td>Yes</td><td>O(1)</td><td>O(log n)</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="content-card fade-in" id="pros-cons">
          <div className="row">
            <div className="col-md-6">
              <h2 className="section-title">Advantages</h2>
              <ul className="explain-list">
                <li>Linear Search works on any data, sorted or not, no setup cost</li>
                <li>Binary Search is dramatically faster on large sorted datasets</li>
                <li>Both are simple to implement correctly</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h2 className="section-title">Disadvantages</h2>
              <ul className="explain-list">
                <li>Linear Search doesn't scale — O(n) is slow for large datasets</li>
                <li>Binary Search requires the data to already be sorted</li>
                <li>Sorting first only pays off if you'll search the same data many times</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="content-card fade-in" id="applications">
          <h2 className="section-title">Applications</h2>
          <ul className="explain-list">
            <li>Looking up a word in a sorted dictionary or phone book</li>
            <li>Database index lookups</li>
            <li>Finding the insertion point to keep an array sorted</li>
            <li>Autocomplete and prefix search systems</li>
          </ul>
        </section>

        <section className="fade-in" id="code-example">
          <button className="btn code-example-badge">Code Example</button>
          <div className="row g-4 mt-1">
            <div className="col-lg-6">
              <CodeTabs
                panels={[
                  { lang: 'js', label: 'JavaScript', code: `function binarySearch(sortedArr, target) {
  let lo = 0, hi = sortedArr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (sortedArr[mid] === target) return mid;
    if (sortedArr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1; // not found
}

console.log(binarySearch([4, 9, 15, 22, 30, 38, 45], 30)); // 4` },
                  { lang: 'python', label: 'Python', code: `def binary_search(sorted_arr, target):
    lo, hi = 0, len(sorted_arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if sorted_arr[mid] == target:
            return mid
        if sorted_arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1  # not found

print(binary_search([4, 9, 15, 22, 30, 38, 45], 30))  # 4` },
                  { lang: 'java', label: 'Java', code: `int binarySearch(int[] sortedArr, int target) {
    int lo = 0, hi = sortedArr.length - 1;
    while (lo <= hi) {
        int mid = (lo + hi) / 2;
        if (sortedArr[mid] == target) return mid;
        if (sortedArr[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1; // not found
}

// binarySearch({4, 9, 15, 22, 30, 38, 45}, 30) -> 4` },
                ]}
              />
            </div>
            <div className="col-lg-6">
              <div className="explain-card">
                <p>
                  Each iteration compares the target to the middle element and throws away the half of the array
                  that can't contain it. That's why binary search only needs about log₂(n) comparisons — for a
                  million elements, that's about 20 steps instead of up to a million.
                </p>
                <h6>Key Properties</h6>
                <ul className="explain-list">
                  <li>Requires sorted input</li>
                  <li>Halves the search space every comparison</li>
                  <li>O(log n) — extremely fast even on huge datasets</li>
                </ul>
                <a href="#applications" className="learn-more-link">See where searching is used <i className="bi bi-arrow-right"></i></a>
              </div>
            </div>
          </div>
          <div className="row g-4 mt-1">
            <div className="col-12">
              <div className="code-badge" style={{ display: 'block' }}>Output: 4</div>
            </div>
          </div>
        </section>

        <section className="content-card fade-in" id="summary">
          <h2 className="section-title">Summary</h2>
          <p className="section-text">
            Linear Search is simple and universal but slow at scale; Binary Search trades a sorting requirement for
            a dramatic O(log n) speedup. Choosing between them comes down to whether the data is sorted and how
            often you'll be searching it.
          </p>
        </section>

        <section className="content-card fade-in" id="take-quiz">
          <h2 className="section-title">Ready to test yourself?</h2>
          <p className="section-text">Take the 5-question quiz to check your understanding and save your score to your Dashboard.</p>
          <Link to="/quiz/searching" className="btn btn-hero btn-hero-primary">
            <i className="bi bi-patch-question"></i> Take Quiz
          </Link>
        </section>

        <PracticeExercise
          task={<>Write a recursive version of <code>binarySearch(sortedArr, target, lo, hi)</code> that returns the
            index of <code>target</code>, or -1 if it isn't found.</>}
          hint="Base case: if lo > hi, return -1. Otherwise compute mid, compare, and recurse into either [lo, mid-1] or [mid+1, hi]."
        />

        <LessonNav prev={{ to: '/learn/sorting', label: 'Sorting Algorithms' }} next={{ to: '/learn/greedy', label: 'Greedy Algorithm' }} />
      </main>

      <Footer />
    </div>
  );
}
