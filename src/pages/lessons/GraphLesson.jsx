import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import LessonHero from '../../components/lessons/LessonHero';
import LessonProgressBar from '../../components/lessons/LessonProgressBar';
import GraphVisualizer from '../../components/lessons/GraphVisualizer';
import CodeTabs from '../../components/lessons/CodeTabs';
import PracticeExercise from '../../components/lessons/PracticeExercise';
import LessonNav from '../../components/lessons/LessonNav';
import useScrollReveal from '../../hooks/useScrollReveal';
import '../../styles/learn.css';
import '../../styles/array.css';

export default function GraphLesson() {
  useScrollReveal();

  return (
    <div className="page-shell" data-nav-section="learn">
      <Header navSection="learn" />
      <LessonHero
        title="Graph Data Structure"
        subtitle="A collection of vertices connected by edges, used to model networks and relationships — from social networks to road maps."
      />

      <main className="container page-content page-shell-main">
        <LessonProgressBar topicId="graphs" lessonUrl="/learn/graph" />

        <section className="content-card fade-in" id="learning-objectives">
          <h2 className="section-title">Learning Objectives</h2>
          <ul className="objectives-list">
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Define vertices, edges, directed vs. undirected graphs.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Represent a graph with an adjacency list.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Trace BFS and DFS traversal order.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Identify real-world systems modeled as graphs.</li>
          </ul>
        </section>

        <section className="content-card fade-in" id="what-is-graph">
          <div className="row gy-4 align-items-start">
            <div className="col-lg-7">
              <h2 className="section-title">What is a Graph?</h2>
              <p className="section-text">
                A graph is a set of <strong>vertices</strong> (nodes) connected by <strong>edges</strong>. Unlike a
                tree, a graph has no single root and can contain cycles — any vertex can connect to any other.
              </p>
              <p className="section-text">
                Graphs can be <strong>directed</strong> (edges have a one-way direction) or <strong>undirected</strong>
                {' '}(edges go both ways), and edges can optionally carry a <strong>weight</strong> (e.g. distance, cost).
              </p>
              <div className="code-badge">{"graph = { A: [B, C], B: [A, D], ... }"}</div>
            </div>
            <div className="col-lg-5">
              <div className="mini-visual" style={{ textAlign: 'center', fontFamily: 'monospace' }}>
                <div>A ─── B</div>
                <div>│&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│</div>
                <div>C ─── D</div>
              </div>
            </div>
          </div>
        </section>

        <GraphVisualizer />

        <section className="content-card fade-in" id="graph-operations">
          <h2 className="section-title">Graph Operations</h2>
          <div className="row g-3">
            <div className="col-6 col-lg-3"><div className="op-card op-gray"><div className="op-icon"><i className="bi bi-diagram-3"></i></div><h5>BFS</h5><p>Breadth-first traversal</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-orange"><div className="op-icon"><i className="bi bi-signpost-split"></i></div><h5>DFS</h5><p>Depth-first traversal</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-pink"><div className="op-icon"><i className="bi bi-plus-square"></i></div><h5>Add Edge</h5><p>Connect two vertices</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-teal"><div className="op-icon"><i className="bi bi-search"></i></div><h5>Search</h5><p>Find a path</p></div></div>
          </div>
        </section>

        <section className="content-card fade-in" id="time-complexity">
          <h2 className="section-title">Time complexity</h2>
          <div className="table-responsive">
            <table className="table complexity-table mb-0">
              <thead><tr><th>Operation</th><th>Adjacency List</th><th>Adjacency Matrix</th></tr></thead>
              <tbody>
                <tr><td>BFS / DFS</td><td>O(V + E)</td><td>O(V²)</td></tr>
                <tr><td>Add Edge</td><td>O(1)</td><td>O(1)</td></tr>
                <tr><td>Check if edge exists</td><td>O(degree of V)</td><td>O(1)</td></tr>
              </tbody>
            </table>
            <p className="section-text" style={{ marginTop: '10px', fontSize: '0.82rem' }}>V = number of vertices, E = number of edges.</p>
          </div>
        </section>

        <section className="content-card fade-in" id="pros-cons">
          <div className="row">
            <div className="col-md-6">
              <h2 className="section-title">Advantages</h2>
              <ul className="explain-list">
                <li>Models real relationships and networks directly</li>
                <li>Adjacency lists are memory-efficient for sparse graphs</li>
                <li>BFS finds shortest paths in unweighted graphs</li>
                <li>Foundation for pathfinding (Dijkstra, A*) and network flow</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h2 className="section-title">Disadvantages</h2>
              <ul className="explain-list">
                <li>Can be more complex to implement and reason about than trees</li>
                <li>Adjacency matrices waste memory on sparse graphs — O(V²)</li>
                <li>Cycles require extra care (visited-tracking) to avoid infinite loops</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="content-card fade-in" id="applications">
          <h2 className="section-title">Applications</h2>
          <ul className="explain-list">
            <li>Social networks (friends, followers)</li>
            <li>GPS navigation and shortest-path routing</li>
            <li>Web page links (the web itself is a graph)</li>
            <li>Recommendation systems</li>
            <li>Network topology (computer networks, circuits)</li>
          </ul>
        </section>

        <section className="fade-in" id="code-example">
          <button className="btn code-example-badge">Code Example</button>
          <div className="row g-4 mt-1">
            <div className="col-lg-6">
              <CodeTabs
                panels={[
                  { lang: 'js', label: 'JavaScript', code: `const graph = { A: ['B', 'C'], B: ['A', 'D'], C: ['A'], D: ['B'] };

// Breadth-First Search — uses a queue
function bfs(start) {
  const visited = new Set([start]);
  const queue = [start];
  const order = [];

  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    for (const next of graph[node]) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }
  return order;
}

console.log(bfs('A')); // ['A', 'B', 'C', 'D']` },
                  { lang: 'python', label: 'Python', code: `from collections import deque

graph = {'A': ['B', 'C'], 'B': ['A', 'D'], 'C': ['A'], 'D': ['B']}

def bfs(start):
    visited = {start}
    queue = deque([start])
    order = []

    while queue:
        node = queue.popleft()
        order.append(node)
        for next_node in graph[node]:
            if next_node not in visited:
                visited.add(next_node)
                queue.append(next_node)
    return order

print(bfs('A'))  # ['A', 'B', 'C', 'D']` },
                  { lang: 'java', label: 'Java', code: `Map<String, List<String>> graph = Map.of(
    "A", List.of("B", "C"),
    "B", List.of("A", "D"),
    "C", List.of("A"),
    "D", List.of("B")
);

List<String> bfs(String start) {
    Set<String> visited = new HashSet<>(Set.of(start));
    Queue<String> queue = new LinkedList<>(List.of(start));
    List<String> order = new ArrayList<>();

    while (!queue.isEmpty()) {
        String node = queue.poll();
        order.add(node);
        for (String next : graph.get(node)) {
            if (visited.add(next)) queue.offer(next);
        }
    }
    return order;
}` },
                ]}
              />
            </div>
            <div className="col-lg-6">
              <div className="explain-card">
                <p>
                  Traversal is the core operation on a graph: visit every reachable vertex exactly once. BFS
                  (queue-based) expands outward level by level and is ideal for shortest paths. DFS (stack/recursion-based)
                  dives as deep as possible before backtracking, and is often simpler to write recursively.
                </p>
                <h6>Key Properties</h6>
                <ul className="explain-list">
                  <li>Vertices + edges, optionally directed and/or weighted</li>
                  <li>Adjacency list: memory-efficient, O(V+E) traversal</li>
                  <li>BFS → shortest path in unweighted graphs</li>
                  <li>DFS → good for cycle detection, topological sort</li>
                </ul>
                <a href="#applications" className="learn-more-link">See where graphs are used <i className="bi bi-arrow-right"></i></a>
              </div>
            </div>
          </div>
          <div className="row g-4 mt-1">
            <div className="col-12">
              <div className="code-badge" style={{ display: 'block' }}>Output: ['A', 'B', 'C', 'D']</div>
            </div>
          </div>
        </section>

        <section className="content-card fade-in" id="summary">
          <h2 className="section-title">Summary</h2>
          <p className="section-text">
            A graph generalizes trees by allowing any vertex to connect to any other, with no single root and
            possible cycles. BFS and DFS are the two fundamental ways to explore one, and together they underpin
            pathfinding, network analysis, and much of what makes maps and social networks work.
          </p>
        </section>

        <section className="content-card fade-in" id="take-quiz">
          <h2 className="section-title">Ready to test yourself?</h2>
          <p className="section-text">Take the 5-question quiz to check your understanding and save your score to your Dashboard.</p>
          <Link to="/quiz/graphs" className="btn btn-hero btn-hero-primary">
            <i className="bi bi-patch-question"></i> Take Quiz
          </Link>
        </section>

        <PracticeExercise
          task={<>Given an adjacency list graph and a start vertex, write <code>hasPath(graph, start, target)</code> that
            returns true if <code>target</code> is reachable from <code>start</code>, using either BFS or DFS.</>}
          hint="Reuse a standard BFS/DFS traversal, but stop early and return true as soon as you dequeue/visit the target node. If the traversal finishes without finding it, return false."
        />

        <LessonNav prev={{ to: '/learn/tree', label: 'Tree' }} next={{ to: '/learn/recursion', label: 'Recursion' }} />
      </main>

      <Footer />
    </div>
  );
}
