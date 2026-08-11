import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import LessonHero from '../../components/lessons/LessonHero';
import LessonProgressBar from '../../components/lessons/LessonProgressBar';
import TreeVisualizer from '../../components/lessons/TreeVisualizer';
import CodeTabs from '../../components/lessons/CodeTabs';
import PracticeExercise from '../../components/lessons/PracticeExercise';
import LessonNav from '../../components/lessons/LessonNav';
import useScrollReveal from '../../hooks/useScrollReveal';
import '../../styles/learn.css';
import '../../styles/array.css';

export default function TreeLesson() {
  useScrollReveal();

  return (
    <div className="page-shell" data-nav-section="learn">
      <Header navSection="learn" />
      <LessonHero
        title="Tree Data Structure"
        subtitle="A hierarchical structure of nodes connected by edges, starting from a single root. Each node can have child nodes, but no cycles."
      />

      <main className="container page-content page-shell-main">
        <LessonProgressBar topicId="trees" lessonUrl="/learn/tree" />

        <section className="content-card fade-in" id="learning-objectives">
          <h2 className="section-title">Learning Objectives</h2>
          <ul className="objectives-list">
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Define trees, nodes, root, leaf, and depth.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Explain the Binary Search Tree ordering rule.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Insert and search values in a BST.</li>
            <li className="objective-item"><span className="objective-icon"><i className="bi bi-check-lg"></i></span> Understand why balance matters for performance.</li>
          </ul>
        </section>

        <section className="content-card fade-in" id="what-is-tree">
          <div className="row gy-4 align-items-start">
            <div className="col-lg-7">
              <h2 className="section-title">What is a Tree?</h2>
              <p className="section-text">
                A tree is a hierarchical data structure made of nodes connected by edges. One node is the
                <strong> root</strong>; every other node has exactly one parent, and nodes with no children are called{' '}
                <strong>leaves</strong>.
              </p>
              <p className="section-text">
                A <strong>Binary Search Tree (BST)</strong> is a tree where each node has at most two children, and
                every left subtree holds smaller values while every right subtree holds larger values.
              </p>
              <div className="code-badge">50 → left: 30, right: 70</div>
            </div>
            <div className="col-lg-5">
              <div className="mini-visual" style={{ textAlign: 'center', fontFamily: 'monospace', lineHeight: 1.8 }}>
                <div>&nbsp;&nbsp;&nbsp;Root</div>
                <div>&nbsp;&nbsp;/&nbsp;&nbsp;\</div>
                <div>&nbsp;A&nbsp;&nbsp;&nbsp;&nbsp;B</div>
                <div>/&nbsp;\</div>
                <div>C&nbsp;&nbsp;D</div>
              </div>
            </div>
          </div>
        </section>

        <TreeVisualizer />

        <section className="content-card fade-in" id="tree-operations">
          <h2 className="section-title">Tree Operations</h2>
          <div className="row g-3">
            <div className="col-6 col-lg-3"><div className="op-card op-gray"><div className="op-icon"><i className="bi bi-arrow-right"></i></div><h5>Traversal</h5><p>In/Pre/Post-order</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-orange"><div className="op-icon"><i className="bi bi-box-arrow-in-down-right"></i></div><h5>Insertion</h5><p>Add a node</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-pink"><div className="op-icon"><i className="bi bi-dash-square"></i></div><h5>Deletion</h5><p>Remove a node</p></div></div>
            <div className="col-6 col-lg-3"><div className="op-card op-teal"><div className="op-icon"><i className="bi bi-search"></i></div><h5>Searching</h5><p>Find a value</p></div></div>
          </div>
        </section>

        <section className="content-card fade-in" id="time-complexity">
          <h2 className="section-title">Time complexity</h2>
          <div className="table-responsive">
            <table className="table complexity-table mb-0">
              <thead><tr><th>Operation</th><th>Balanced BST</th><th>Unbalanced BST (worst case)</th></tr></thead>
              <tbody>
                <tr><td>Search</td><td>O(log n)</td><td>O(n)</td></tr>
                <tr><td>Insert</td><td>O(log n)</td><td>O(n)</td></tr>
                <tr><td>Delete</td><td>O(log n)</td><td>O(n)</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="content-card fade-in" id="pros-cons">
          <div className="row">
            <div className="col-md-6">
              <h2 className="section-title">Advantages</h2>
              <ul className="explain-list">
                <li>O(log n) search/insert/delete when balanced</li>
                <li>In-order traversal yields sorted data</li>
                <li>Naturally represents hierarchical relationships</li>
                <li>Basis for many advanced structures (heaps, tries, B-trees)</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h2 className="section-title">Disadvantages</h2>
              <ul className="explain-list">
                <li>Performance degrades to O(n) if unbalanced</li>
                <li>More complex to implement than arrays or linked lists</li>
                <li>Self-balancing variants (AVL, Red-Black) add implementation overhead</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="content-card fade-in" id="applications">
          <h2 className="section-title">Applications</h2>
          <ul className="explain-list">
            <li>File systems (folders containing files and subfolders)</li>
            <li>Database indexing (B-trees, B+ trees)</li>
            <li>Autocomplete and spell-check (tries)</li>
            <li>Decision trees in machine learning</li>
            <li>HTML/DOM document structure</li>
          </ul>
        </section>

        <section className="fade-in" id="code-example">
          <button className="btn code-example-badge">Code Example</button>
          <div className="row g-4 mt-1">
            <div className="col-lg-6">
              <CodeTabs
                panels={[
                  { lang: 'js', label: 'JavaScript', code: `class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

function insert(node, value) {
  if (!node) return new TreeNode(value);
  if (value < node.value) node.left = insert(node.left, value);
  else if (value > node.value) node.right = insert(node.right, value);
  return node;
}

function search(node, value) {
  if (!node) return false;
  if (node.value === value) return true;
  return value < node.value
    ? search(node.left, value)
    : search(node.right, value);
}` },
                  { lang: 'python', label: 'Python', code: `class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def insert(node, value):
    if node is None:
        return TreeNode(value)
    if value < node.value:
        node.left = insert(node.left, value)
    elif value > node.value:
        node.right = insert(node.right, value)
    return node

def search(node, value):
    if node is None:
        return False
    if node.value == value:
        return True
    return search(node.left, value) if value < node.value else search(node.right, value)` },
                  { lang: 'java', label: 'Java', code: `class TreeNode {
    int value;
    TreeNode left, right;
    TreeNode(int value) { this.value = value; }
}

TreeNode insert(TreeNode node, int value) {
    if (node == null) return new TreeNode(value);
    if (value < node.value) node.left = insert(node.left, value);
    else if (value > node.value) node.right = insert(node.right, value);
    return node;
}

boolean search(TreeNode node, int value) {
    if (node == null) return false;
    if (node.value == value) return true;
    return value < node.value ? search(node.left, value) : search(node.right, value);
}` },
                ]}
              />
            </div>
            <div className="col-lg-6">
              <div className="explain-card">
                <p>
                  Insert and search both work the same way: compare the target value to the current node, then
                  recurse left or right depending on the BST ordering rule. Both operations follow a single root-to-leaf
                  path, which is why their cost is proportional to the tree's <strong>height</strong>, not its size.
                </p>
                <h6>Key Properties</h6>
                <ul className="explain-list">
                  <li>Left subtree &lt; node &lt; right subtree</li>
                  <li>Height determines performance, not node count</li>
                  <li>In-order traversal = sorted output</li>
                  <li>Self-balancing trees keep height at O(log n)</li>
                </ul>
                <a href="#applications" className="learn-more-link">See where trees are used <i className="bi bi-arrow-right"></i></a>
              </div>
            </div>
          </div>
          <div className="row g-4 mt-1">
            <div className="col-12">
              <div className="code-badge" style={{ display: 'block' }}>Output: search(root, 40) → true</div>
            </div>
          </div>
        </section>

        <section className="content-card fade-in" id="summary">
          <h2 className="section-title">Summary</h2>
          <p className="section-text">
            A Binary Search Tree keeps data ordered so that search, insert, and delete all cost O(log n) — as long
            as the tree stays roughly balanced. Trees generalize the idea of "divide and conquer" into a data
            structure, and show up everywhere from file systems to databases.
          </p>
        </section>

        <section className="content-card fade-in" id="take-quiz">
          <h2 className="section-title">Ready to test yourself?</h2>
          <p className="section-text">Take the 5-question quiz to check your understanding and save your score to your Dashboard.</p>
          <Link to="/quiz/trees" className="btn btn-hero btn-hero-primary">
            <i className="bi bi-patch-question"></i> Take Quiz
          </Link>
        </section>

        <PracticeExercise
          task={<>Write a function <code>treeHeight(node)</code> that returns the height of a binary tree (the number
            of edges on the longest root-to-leaf path). An empty tree has height -1, a single node has height 0.</>}
          hint="Use recursion: the height of a node is 1 + the larger of its left and right subtree heights. An empty node returns -1."
        />

        <LessonNav prev={{ to: '/learn/stack', label: 'Stack' }} next={{ to: '/learn/graph', label: 'Graph' }} />
      </main>

      <Footer />
    </div>
  );
}
