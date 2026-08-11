// ==========================================================================
// Centralized quiz question bank, keyed by topic id (matches TOPICS in
// src/lib/csPlatform.js). Previously each lesson page defined its own
// `quizQuestions` array and rendered <QuizSection> inline; the quiz has
// since moved to its own route (src/pages/QuizPage.jsx), so the question
// data now lives here where both the lesson "Take Quiz" link and the quiz
// route can reference it without duplication.
// ==========================================================================

export const QUIZ_QUESTIONS = {
  arrays: [
    {
      question: 'What is the value at index 3 of the following array?\narr = [1, 4, 9, 8, 6]',
      options: ['8', '1', '9', '6'],
      answer: 0,
      explanation: 'The value at index 3 is 8. Array indexing starts at 0, so index 3 is the 4th element.',
    },
    {
      question: 'What is the time complexity of accessing an element by index in an array?',
      options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
      answer: 2,
      explanation: 'Accessing an array element by index is O(1) because the memory address can be calculated directly from the index.',
    },
    {
      question: 'Which operation is generally the SLOWEST on an array?',
      options: ['Reading the last element', 'Reading the first element', 'Inserting an element in the middle', 'Reading a specific index'],
      answer: 2,
      explanation: 'Inserting in the middle is O(n) because every element after the insertion point must shift over by one position.',
    },
    {
      question: 'Given arr = [5, 12, 8, 20, 3], what is arr.length?',
      options: ['4', '5', '6', 'It depends on the language'],
      answer: 1,
      explanation: 'The array has 5 elements, so its length is 5.',
    },
    {
      question: 'What happens when you access arr[10] on an array with only 5 elements?',
      options: ['It returns 0', 'It throws a syntax error before the program runs', 'It returns undefined (JS) or an out-of-bounds error (many other languages)', 'It automatically resizes the array'],
      answer: 2,
      explanation: 'Accessing an out-of-bounds index returns undefined in JavaScript, while languages like Java or C++ raise an out-of-bounds error/exception.',
    },
  ],

  'linked-lists': [
    {
      question: 'What does each node in a singly linked list store?',
      options: ['Only a value', 'A value and a pointer to the next node', 'A value and its memory address', 'Two values'],
      answer: 1,
      explanation: 'Each node stores its own value plus a reference (pointer) to the next node in the chain.',
    },
    {
      question: 'What is the time complexity of inserting a new node at the HEAD of a linked list?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
      answer: 0,
      explanation: "Inserting at the head only requires updating two pointers — no shifting of other nodes — so it's O(1).",
    },
    {
      question: "Why can't you jump directly to the 5th element of a linked list the way you can with arr[4] in an array?",
      options: [
        "Linked lists don't support numbers",
        "Nodes aren't stored in contiguous memory, so you must follow pointers from the head",
        'Linked lists can only store 4 elements',
        'It is actually possible in O(1)',
      ],
      answer: 1,
      explanation: "There's no direct index-to-address formula for a linked list — you must traverse node by node from the head, which is O(n).",
    },
    {
      question: "What does the 'next' pointer of the LAST node in a singly linked list point to?",
      options: ['The head node', 'Itself', 'null', 'The second-to-last node'],
      answer: 2,
      explanation: "The last node's next pointer is null, which is how code knows it has reached the end of the list.",
    },
    {
      question: 'Which of these is an advantage of a linked list over an array?',
      options: [
        'Faster access by index',
        'Better cache performance',
        'Dynamic size — no need to know the size in advance or reallocate',
        'Uses less memory per element',
      ],
      answer: 2,
      explanation: 'Linked lists grow and shrink one node at a time without ever needing to reallocate or copy the whole structure.',
    },
  ],

  queues: [
    {
      question: 'What ordering principle does a queue follow?',
      options: ['LIFO — Last In, First Out', 'FIFO — First In, First Out', 'Random order', 'Sorted order'],
      answer: 1,
      explanation: 'A queue is First In, First Out: the first element added is the first one removed.',
    },
    {
      question: 'Which end of a queue does enqueue add to, and which end does dequeue remove from?',
      options: ['Enqueue adds to the front, dequeue removes from the rear', 'Enqueue adds to the rear, dequeue removes from the front', 'Both happen at the front', 'Both happen at the rear'],
      answer: 1,
      explanation: 'New elements are enqueued at the rear; the oldest element is dequeued from the front.',
    },
    {
      question: 'What is the time complexity of enqueue and dequeue on a well-implemented queue?',
      options: ['O(n) for both', 'O(1) for both', 'O(log n) for both', 'O(1) enqueue, O(n) dequeue'],
      answer: 1,
      explanation: 'With a proper implementation (e.g. a linked list with head/tail pointers, or a circular buffer), both operations are O(1).',
    },
    {
      question: 'Which real-world scenario is best modeled by a queue?',
      options: ['Undo history in a text editor', 'Function call stack', 'People waiting in line at a ticket counter', 'Sorting a deck of cards'],
      answer: 2,
      explanation: 'A line of people is FIFO — first person in line is served first, exactly like a queue.',
    },
    {
      question: 'What does peek() do on a queue?',
      options: ['Removes and returns the front element', 'Returns the front element without removing it', 'Removes the rear element', 'Empties the whole queue'],
      answer: 1,
      explanation: 'peek() (sometimes called front()) looks at the front element without dequeuing it.',
    },
  ],

  stacks: [
    {
      question: 'What ordering principle does a stack follow?',
      options: ['FIFO — First In, First Out', 'LIFO — Last In, First Out', 'Random order', 'Priority order'],
      answer: 1,
      explanation: 'A stack is Last In, First Out: the most recently pushed element is the first one popped.',
    },
    {
      question: 'What is the time complexity of push and pop on a stack implemented with a dynamic array?',
      options: ['O(n) for both', 'O(1) amortized for both', 'O(log n) for both', 'O(1) push, O(n) pop'],
      answer: 1,
      explanation: 'Both push and pop only touch the top element, so they run in O(1) amortized time.',
    },
    {
      question: 'Which of these is a classic real-world use of a stack?',
      options: ['A ticket queue at a cinema', 'The undo/redo history in a text editor', 'A printer job queue', 'Round-robin CPU scheduling'],
      answer: 1,
      explanation: 'Undo/redo is LIFO — the most recent action is the first one undone, which is exactly stack behavior.',
    },
    {
      question: 'What does peek() (or top()) return on a stack?',
      options: ['The bottom element', 'The top element, without removing it', 'The top element, removing it', 'The average of all elements'],
      answer: 1,
      explanation: 'peek()/top() lets you look at the top element without popping it off the stack.',
    },
    {
      question: 'Which built-in mechanism in most programming languages is itself implemented as a stack?',
      options: ['The heap (dynamic memory)', 'The function call stack', 'The garbage collector', 'The event loop queue'],
      answer: 1,
      explanation: "Function calls push a new frame onto the call stack and pop it off on return — that's why deep recursion can cause a 'stack overflow'.",
    },
  ],

  trees: [
    {
      question: 'In a Binary Search Tree (BST), where do values smaller than a node go?',
      options: ['In the right subtree', 'In the left subtree', 'They replace the node', 'They are rejected'],
      answer: 1,
      explanation: "By BST convention, smaller values go in the left subtree and larger values go in the right subtree of every node.",
    },
    {
      question: 'What is the average time complexity of search in a balanced BST?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
      answer: 2,
      explanation: 'A balanced BST halves the search space at each step, giving O(log n) average search time.',
    },
    {
      question: 'What happens to BST search performance if the tree becomes unbalanced (e.g., a straight line of nodes)?',
      options: ['It stays O(log n)', 'It degrades to O(n), like a linked list', 'It becomes O(1)', 'It becomes impossible'],
      answer: 1,
      explanation: 'An unbalanced BST (e.g., inserting sorted data one by one) degenerates into a linked list shape, making search O(n).',
    },
    {
      question: 'Which traversal visits a BST\'s nodes in ascending sorted order?',
      options: ['Pre-order', 'Post-order', 'In-order', 'Level-order'],
      answer: 2,
      explanation: 'In-order traversal (left, node, right) visits BST nodes in ascending sorted order.',
    },
    {
      question: 'What is the "root" of a tree?',
      options: ['Any leaf node', 'The topmost node, with no parent', 'The deepest node', 'The node with the smallest value'],
      answer: 1,
      explanation: 'The root is the single top-level node that every other node descends from — it has no parent.',
    },
  ],

  graphs: [
    {
      question: 'What is a graph made of?',
      options: ['Rows and columns', 'Vertices (nodes) and edges (connections)', 'Only nodes, no connections', 'Keys and values'],
      answer: 1,
      explanation: 'A graph consists of vertices (nodes) connected by edges, which may or may not have direction or weight.',
    },
    {
      question: 'What is the difference between a directed and an undirected graph?',
      options: [
        'Directed graphs have weighted edges, undirected do not',
        "Directed edges have a one-way direction (A→B doesn't imply B→A); undirected edges go both ways",
        'There is no difference',
        'Undirected graphs cannot have cycles',
      ],
      answer: 1,
      explanation: "In a directed graph, an edge A→B is a one-way connection. In an undirected graph, an edge between A and B means you can travel either way.",
    },
    {
      question: 'Which data structure does Breadth-First Search (BFS) use to decide traversal order?',
      options: ['A stack', 'A queue', 'A binary tree', 'A hash map'],
      answer: 1,
      explanation: 'BFS uses a queue (FIFO), visiting all neighbors at the current depth before moving to the next depth level.',
    },
    {
      question: 'Which data structure does Depth-First Search (DFS) naturally use (explicitly, or via recursion)?',
      options: ['A queue', 'A stack', 'A priority queue', 'A linked list only'],
      answer: 1,
      explanation: 'DFS explores as far as possible along a branch before backtracking — behavior that maps directly onto a stack (or the recursive call stack).',
    },
    {
      question: 'Which of these is a real-world application of graphs?',
      options: ['Sorting a list of numbers', 'Social network friend connections', 'Binary search in a sorted array', 'Reversing a string'],
      answer: 1,
      explanation: 'Social networks are a classic graph: people are vertices, friendships/follows are edges.',
    },
  ],

  recursion: [
    {
      question: 'What are the two essential parts every correct recursive function must have?',
      options: ['A loop and a variable', 'A base case and a recursive case', 'Two return statements', 'An array and an index'],
      answer: 1,
      explanation: 'A base case stops the recursion; a recursive case makes progress toward that base case. Without both, the function never terminates.',
    },
    {
      question: 'What happens if a recursive function has no base case (or the base case is never reached)?',
      options: ['It runs once and stops', 'It causes infinite recursion, eventually a stack overflow', 'It automatically becomes iterative', 'Nothing — JavaScript prevents this'],
      answer: 1,
      explanation: 'Without a reachable base case, each call keeps pushing a new stack frame until the call stack runs out of space.',
    },
    {
      question: 'Where are the local variables and return address of each recursive call stored?',
      options: ['In the heap', 'In a global array', 'On the call stack, as a new frame', 'In the base case'],
      answer: 2,
      explanation: 'Every function call — recursive or not — pushes a new frame onto the call stack holding its local state.',
    },
    {
      question: 'What is the base case of factorial(n)?',
      options: ['n == 0 (or n == 1), returning 1', 'n == 100', 'There is no base case needed', 'n < 0'],
      answer: 0,
      explanation: 'factorial(0) = 1 (or equivalently factorial(1) = 1) is the case that stops the recursive calls.',
    },
    {
      question: 'Which of these problems is naturally suited to a recursive solution?',
      options: ['Adding two numbers', 'Traversing a tree (visiting every node)', 'Printing "Hello World"', 'Checking if a number is even'],
      answer: 1,
      explanation: "Tree traversal mirrors a tree's own recursive structure (a tree is a node plus subtrees, which are themselves trees) — a very natural fit for recursion.",
    },
  ],

  'dynamic-programming': [
    {
      question: 'What two properties must a problem have for Dynamic Programming to apply?',
      options: [
        'It must be sorted and have unique values',
        'Overlapping subproblems and optimal substructure',
        'It must use recursion and arrays',
        'It must be a graph problem',
      ],
      answer: 1,
      explanation: 'DP applies when a problem breaks into subproblems that repeat (overlapping subproblems) and an optimal solution is built from optimal solutions to those subproblems (optimal substructure).',
    },
    {
      question: 'What is "memoization"?',
      options: [
        'Sorting an array before processing it',
        'Caching the results of expensive function calls so repeated calls with the same input return instantly',
        'A way to delete duplicate elements',
        'Converting recursion into a loop automatically',
      ],
      answer: 1,
      explanation: 'Memoization stores (caches) previously computed results, so a function never recomputes the same subproblem twice.',
    },
    {
      question: 'What is the time complexity of computing fibonacci(n) with memoization (or a bottom-up DP table)?',
      options: ['O(2ⁿ)', 'O(n²)', 'O(n)', 'O(log n)'],
      answer: 2,
      explanation: 'With memoization, each of the n subproblems is computed exactly once in O(1) work, giving O(n) total — versus O(2ⁿ) for the naive recursive version.',
    },
    {
      question: "What is the key difference between 'top-down' and 'bottom-up' DP?",
      options: [
        'Top-down uses recursion + memoization; bottom-up fills a table iteratively starting from the base cases',
        'They are exactly the same thing',
        'Bottom-up cannot use arrays',
        'Top-down is always faster',
      ],
      answer: 0,
      explanation: 'Top-down DP is recursion with a cache; bottom-up DP builds the answer iteratively from the smallest subproblems up, usually using a table/array.',
    },
    {
      question: 'Which of these problems is a classic Dynamic Programming problem?',
      options: ['Printing numbers 1 to 10', 'The 0/1 Knapsack problem', 'Reversing a linked list', 'Finding the length of a string'],
      answer: 1,
      explanation: 'The 0/1 Knapsack problem has overlapping subproblems and optimal substructure, and is a textbook DP example.',
    },
  ],

  sorting: [
    {
      question: 'What is the worst-case time complexity of Bubble Sort?',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
      answer: 2,
      explanation: 'Bubble Sort compares and possibly swaps every pair repeatedly, giving O(n²) comparisons in the worst case (reverse-sorted input).',
    },
    {
      question: 'Which sorting algorithm repeatedly picks the smallest remaining element and places it at the front?',
      options: ['Merge Sort', 'Selection Sort', 'Quick Sort', 'Bubble Sort'],
      answer: 1,
      explanation: 'Selection Sort scans the unsorted portion for the minimum value and swaps it into place at the front, one position at a time.',
    },
    {
      question: 'What is the average and best-case time complexity of Merge Sort and Quick Sort?',
      options: ['O(n)', 'O(n²)', 'O(n log n)', 'O(2ⁿ)'],
      answer: 2,
      explanation: 'Both are divide-and-conquer algorithms: they split the input in half repeatedly (log n levels) and do O(n) work per level.',
    },
    {
      question: 'What makes a sorting algorithm "stable"?',
      options: [
        'It never uses recursion',
        'It preserves the relative order of equal elements',
        'It always runs in O(n log n)',
        'It sorts in-place with no extra memory',
      ],
      answer: 1,
      explanation: "A stable sort keeps equal elements in their original relative order — important when sorting records by one field but wanting ties to preserve a previous order.",
    },
    {
      question: "Why is Quick Sort's worst case O(n²), even though it averages O(n log n)?",
      options: [
        'It always is O(n²), the average case claim is wrong',
        'A poor pivot choice (e.g. always picking the smallest/largest element) creates unbalanced partitions',
        'It only works on already-sorted arrays',
        'It uses too much extra memory',
      ],
      answer: 1,
      explanation: "If the pivot is consistently the smallest or largest element (e.g. on already-sorted input with a naive pivot choice), partitions become as unbalanced as possible, degrading to O(n²).",
    },
  ],

  searching: [
    {
      question: 'What is the time complexity of Linear Search on an array of n elements?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      answer: 2,
      explanation: 'Linear search checks each element one by one, so in the worst case it examines all n elements.',
    },
    {
      question: 'What is the ONE requirement Binary Search has that Linear Search does not?',
      options: ['The array must be sorted', 'The array must contain only numbers', 'The array must be small', 'The array must have no duplicates'],
      answer: 0,
      explanation: 'Binary search relies on comparing the middle element and discarding half the range — that logic only works if the data is sorted.',
    },
    {
      question: 'What is the time complexity of Binary Search on a sorted array of n elements?',
      options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
      answer: 1,
      explanation: 'Binary search halves the search range on every comparison, giving O(log n).',
    },
    {
      question: 'In binary search, what happens when the middle element is LESS than the target?',
      options: ['Search the left half next', 'Search the right half next', 'The target does not exist', 'Restart from index 0'],
      answer: 1,
      explanation: 'If the middle value is smaller than the target, the target (if present) must be in the right half, since the array is sorted ascending.',
    },
    {
      question: 'For a small, unsorted array that is searched only once, which is more practical?',
      options: ['Binary Search, always', 'Linear Search — sorting first would cost more than it saves', 'Neither works', 'A hash table is required'],
      answer: 1,
      explanation: "Sorting costs at least O(n log n); if you only search once, a single O(n) linear scan is cheaper than sorting first just to binary search.",
    },
  ],

  greedy: [
    {
      question: 'What defines a "greedy" algorithm?',
      options: [
        'It always tries every possible option before deciding',
        'It makes the locally optimal choice at each step, hoping it leads to a globally optimal solution',
        'It only works on sorted data',
        'It uses recursion exclusively',
      ],
      answer: 1,
      explanation: 'A greedy algorithm picks whatever looks best right now, without reconsidering that choice later.',
    },
    {
      question: 'With US coin denominations (25, 10, 5, 1), does the greedy approach always give the minimum number of coins?',
      options: ['No, never', 'Yes, for this particular set of denominations', 'Only for amounts under 10', 'Only if the amount is even'],
      answer: 1,
      explanation: 'US coin denominations happen to be "canonical" — greedy always finds the optimal (fewest-coin) answer for them. This is not true for every coin system.',
    },
    {
      question: 'Give an example of a coin system where the greedy approach FAILS to find the minimum number of coins.',
      options: [
        'Coins {1, 5, 10, 25} for amount 30',
        'Coins {1, 3, 4} for amount 6 (greedy picks 4+1+1=3 coins; optimal is 3+3=2 coins)',
        'Coins {1, 2, 5} for amount 11',
        'Greedy never fails for coin change',
      ],
      answer: 1,
      explanation: 'With coins {1, 3, 4}, greedy for 6 picks 4, then 1, then 1 (3 coins), but 3+3 uses only 2 coins — greedy is suboptimal here.',
    },
    {
      question: 'Which classic algorithm is a greedy algorithm for finding a Minimum Spanning Tree?',
      options: ['Binary Search', 'Merge Sort', "Kruskal's or Prim's algorithm", 'Bubble Sort'],
      answer: 2,
      explanation: "Both Kruskal's and Prim's algorithms build a Minimum Spanning Tree by greedily picking the cheapest valid edge at each step.",
    },
    {
      question: "Why can't every problem be solved correctly with a greedy approach?",
      options: [
        'Greedy algorithms are always slower than other approaches',
        "A locally optimal choice doesn't always lead to a globally optimal solution — some problems need to consider trade-offs across the whole input (e.g. via DP)",
        'Greedy algorithms only work on strings',
        'They require a sorted input, which is not always available',
      ],
      answer: 1,
      explanation: "Greedy algorithms never backtrack, so if an early locally-best choice blocks a better overall solution, greedy gets stuck with a suboptimal answer — that's exactly when Dynamic Programming is needed instead.",
    },
  ],

  'big-o': [
    {
      question: 'What does Big-O notation describe?',
      options: [
        'The exact number of seconds a program takes to run',
        'How an algorithm\'s running time or memory use grows as the input size grows',
        'The number of lines of code in a program',
        'The programming language used',
      ],
      answer: 1,
      explanation: "Big-O describes an algorithm's growth rate relative to input size, in the worst case — not an exact runtime, which depends on hardware.",
    },
    {
      question: 'Which of these growth rates is the FASTEST (best) as input size n gets very large?',
      options: ['O(n²)', 'O(n log n)', 'O(log n)', 'O(n)'],
      answer: 2,
      explanation: 'From fastest to slowest here: O(log n) < O(n) < O(n log n) < O(n²). Logarithmic growth barely increases even as n grows huge.',
    },
    {
      question: 'What is the time complexity of a single loop that runs n times, doing constant work each iteration?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      answer: 2,
      explanation: 'A single loop over all n elements, with O(1) work per iteration, is O(n) — linear time.',
    },
    {
      question: 'What is the time complexity of two nested loops, each running n times?',
      options: ['O(n)', 'O(n log n)', 'O(2n)', 'O(n²)'],
      answer: 3,
      explanation: 'Nested loops multiply: n iterations of the outer loop × n iterations of the inner loop = n × n = O(n²).',
    },
    {
      question: "When we write Big-O, why do we drop constants and lower-order terms (e.g. 3n² + 5n + 2 becomes O(n²))?",
      options: [
        'Because they equal zero',
        'Because Big-O describes the growth trend for large n, where the highest-order term dominates the total',
        'Because it makes the math easier, with no real justification',
        'Constants and lower terms are never dropped',
      ],
      answer: 1,
      explanation: 'As n grows very large, the highest-order term dwarfs the others — so Big-O keeps only that term to describe the dominant growth trend.',
    },
  ],
};
