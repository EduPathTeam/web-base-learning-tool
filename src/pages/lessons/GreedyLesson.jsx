import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import LessonHero from '../../components/lessons/LessonHero';
import LessonProgressBar from '../../components/lessons/LessonProgressBar';
import GreedyVisualizer from '../../components/lessons/GreedyVisualizer';
import CodeTabs from '../../components/lessons/CodeTabs';
import PracticeExercise from '../../components/lessons/PracticeExercise';
import LessonNav from '../../components/lessons/LessonNav';
import useScrollReveal from '../../hooks/useScrollReveal';
import '../../styles/learn.css';
import '../../styles/array.css';

export default function GreedyLesson() {
  useScrollReveal();

  return (
    <div className="page-shell" data-nav-section="learn">
      <Header navSection="learn" />
      <LessonHero
        title="Greedy Algorithms"
        subtitle="Algorithms that make the best choice available at each step, without reconsidering it later — fast, but not always globally optimal."
      />

      <main className="container page-content page-shell-main">
        <LessonProgressBar topicId="greedy" lessonUrl="/learn/greedy" />

        <section className="content-card fade-in" id="learning-objectives">
          <h2 className="section-title">Learning Objectives</h2>
          <ul className="objectives-list">
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Explain the greedy-choice property.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Trace a greedy coin-change solution by hand.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Identify when greedy succeeds vs. when it fails to find the optimal answer.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Name classic greedy algorithms (Kruskal's, Prim's, Dijkstra's).</li>
          </ul>
        </section>

        <section className="content-card fade-in" id="what-is-greedy">
          <div className="row gy-4 align-items-start">
            <div className="col-lg-7">
              <h2 className="section-title">What is a Greedy Algorithm?</h2>
              <p className="section-text">
                A greedy algorithm builds a solution piece by piece, always choosing the option that looks best{' '}
                <strong>right now</strong> — and never revisits that choice. It's fast and simple, but only correct
                for problems where local optimal choices actually combine into a global optimum.
              </p>
              <div className="code-badge">Making 41¢: pick 25, then 10, then 5, then 1 → 4 coins</div>
            </div>
            <div className="col-lg-5">
              <div className="mini-visual" style={{ fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.8 }}>
                <div>41¢ → 25¢ (largest that fits)</div>
                <div>16¢ → 10¢</div>
                <div>6¢ → 5¢</div>
                <div>1¢ → 1¢</div>
              </div>
            </div>
          </div>
        </section>

        <GreedyVisualizer />

        <section className="content-card fade-in" id="greedy-examples">
          <h2 className="section-title">Classic Greedy Algorithms</h2>
          <div className="row g-3">
            <div className="col-6 col-lg-3"><div className="op-card op-gray"><div className="op-icon"><i className="bi bi-coin"></i></div><h5>Coin Change</h5><p>Fewest coins (canonical sets)</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-orange"><div className="op-icon"><i className="bi bi-diagram-3"></i></div><h5>Kruskal's / Prim's</h5><p>Minimum Spanning Tree</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-pink"><div className="op-icon"><i className="bi bi-signpost-split"></i></div><h5>Dijkstra's</h5><p>Shortest path</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-teal"><div className="op-icon"><i className="bi bi-calendar-check"></i></div><h5>Activity Selection</h5><p>Max non-overlapping tasks</p></div></div>
          </div>
        </section>

        <section className="content-card fade-in" id="time-complexity">
          <h2 className="section-title">Time complexity</h2>
          <div className="table-responsive">
            <table className="table complexity-table mb-0">
              <thead><tr><th>Algorithm</th><th>Time</th></tr></thead>
              <tbody>
                <tr><td>Greedy Coin Change</td><td>O(amount / smallest coin)</td></tr>
                <tr><td>Activity Selection (sorted input)</td><td>O(n log n) for the sort, O(n) to select</td></tr>
                <tr><td>Dijkstra's (with a min-heap)</td><td>O((V + E) log V)</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="content-card fade-in" id="pros-cons">
          <div className="row">
            <div className="col-md-6">
              <h2 className="section-title">Advantages</h2>
              <ul className="explain-list">
                <li>Usually simple to implement and reason about</li>
                <li>Fast — typically O(n log n) or better, no backtracking</li>
                <li>Provably optimal for a well-defined class of problems</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h2 className="section-title">Disadvantages</h2>
              <ul className="explain-list">
                <li>Not correct for every problem — can get stuck with a suboptimal answer</li>
                <li>Requires proving the greedy-choice property holds before trusting it</li>
                <li>When it fails, Dynamic Programming is usually the correct alternative</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="content-card fade-in" id="applications">
          <h2 className="section-title">Applications</h2>
          <ul className="explain-list">
            <li>Making change with standard currency denominations</li>
            <li>Network routing (Dijkstra's shortest path)</li>
            <li>Building minimum-cost networks (Minimum Spanning Trees)</li>
            <li>Huffman coding for data compression</li>
            <li>Scheduling the maximum number of non-overlapping tasks</li>
          </ul>
        </section>

        <section className="fade-in" id="code-example">
          <button className="btn code-example-badge">Code Example</button>
          <div className="row g-4 mt-1">
            <div className="col-lg-6">
              <CodeTabs
                panels={[
                  { lang: 'js', label: 'JavaScript', code: `function greedyChange(amount, coins = [25, 10, 5, 1]) {
  const picks = [];
  let remaining = amount;
  for (const coin of coins) {
    while (remaining >= coin) {
      picks.push(coin);
      remaining -= coin;
    }
  }
  return picks;
}

console.log(greedyChange(41)); // [25, 10, 5, 1]` },
                  { lang: 'python', label: 'Python', code: `def greedy_change(amount, coins=(25, 10, 5, 1)):
    picks = []
    remaining = amount
    for coin in coins:
        while remaining >= coin:
            picks.append(coin)
            remaining -= coin
    return picks

print(greedy_change(41))  # [25, 10, 5, 1]` },
                  { lang: 'java', label: 'Java', code: `List<Integer> greedyChange(int amount, int[] coins) {
    List<Integer> picks = new ArrayList<>();
    int remaining = amount;
    for (int coin : coins) {
        while (remaining >= coin) {
            picks.add(coin);
            remaining -= coin;
        }
    }
    return picks;
}

// greedyChange(41, new int[]{25, 10, 5, 1}) -> [25, 10, 5, 1]` },
                ]}
              />
            </div>
            <div className="col-lg-6">
              <div className="explain-card">
                <p>
                  At every step, the function picks the largest coin that still fits into the remaining amount —
                  never reconsidering that choice. For standard denominations this always finds the minimum number
                  of coins, but that's a property of <em>this specific</em> coin system, not of greedy algorithms in general.
                </p>
                <h6>Key Properties</h6>
                <ul className="explain-list">
                  <li>No backtracking — a choice, once made, is final</li>
                  <li>Fast, but correctness must be proven per-problem</li>
                  <li>Fails on non-canonical coin systems like {'{1, 3, 4}'}</li>
                </ul>
                <a href="#applications" className="learn-more-link">See where greedy algorithms are used <i className="bi bi-arrow-right"></i></a>
              </div>
            </div>
          </div>
          <div className="row g-4 mt-1">
            <div className="col-12">
              <div className="code-badge" style={{ display: 'block' }}>Output: [25, 10, 5, 1]</div>
            </div>
          </div>
        </section>

        <section className="content-card fade-in" id="summary">
          <h2 className="section-title">Summary</h2>
          <p className="section-text">
            Greedy algorithms trade thoroughness for speed: they commit to the best-looking choice at each step and
            never look back. That's optimal for problems with the greedy-choice property (like standard coin
            change or Minimum Spanning Trees) — but can produce wrong answers elsewhere, where Dynamic Programming
            is the safer tool.
          </p>
        </section>

        <section className="content-card fade-in" id="take-quiz">
          <h2 className="section-title">Ready to test yourself?</h2>
          <p className="section-text">Take the 5-question quiz to check your understanding and save your score to your Dashboard.</p>
          <Link to="/quiz/greedy" className="btn btn-hero btn-hero-primary">
            <i className="bi bi-patch-question"></i> Take Quiz
          </Link>
        </section>

        <PracticeExercise
          task={<>Write <code>maxActivities(activities)</code> where each activity is <code>[start, end]</code>. Using a
            greedy strategy (sort by end time, always pick the next activity that starts after the last one picked
            ends), return the maximum number of non-overlapping activities.</>}
          hint="Sort all activities by their end time first. Keep track of the end time of the last picked activity; greedily pick the next activity whose start time is >= that end time."
        />

        <LessonNav prev={{ to: '/learn/searching', label: 'Searching Algorithms' }} next={{ to: '/learn/big-o', label: 'Big-O Notation' }} />
      </main>

      <Footer />
    </div>
  );
}
