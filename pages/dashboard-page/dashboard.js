/* ==========================================================================
   CS Learning Platform — Student Dashboard
   js/dashboard.js

   ------------------------------------------------------------------------
   INTEGRATION WITH LESSON / QUIZ PAGES
   ------------------------------------------------------------------------
   This file owns the platform's single source of truth in localStorage
   under the key `CSPlatform.STORAGE_KEY` ("csPlatformData"). Every other
   page in the project (lessons/*.html, quizzes/*.html, career-quiz.html,
   visualizer.html, major.html) should read/write progress through the
   same helper functions so the dashboard always reflects reality without
   any manual syncing.

   To integrate a lesson page:
     1. Include this script: <script src="../js/dashboard.js"></script>
     2. When the student finishes the lesson, call:
          CSPlatform.markLessonComplete('arrays');   // topic id
          CSPlatform.setLastLesson('arrays', 'lessons/array.html');

   To integrate a quiz page:
        CSPlatform.recordQuizResult('arrays', 87);   // topic id, score 0-100

   Both helpers automatically:
       - update completed-lesson counts / quiz score history
       - push a Recent Activity entry
       - recompute the learning streak
       - recompute the recommended major
       - persist everything to localStorage

   The dashboard re-reads localStorage on every page load (and Bootstrap
   pages navigate as full page loads), so no cross-tab messaging is
   required for this project's scope.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * 1. CONFIG — topics, lesson URLs, quiz URLs
   * ------------------------------------------------------------------ */
  const TOPICS = [
    { id: "arrays", name: "Arrays", total: 10, lessonUrl: "lessons/array.html", quizUrl: "quizzes/array-quiz.html" },
    { id: "linked-lists", name: "Linked Lists", total: 10, lessonUrl: "lessons/linked-list.html", quizUrl: "quizzes/linked-list-quiz.html" },
    { id: "stacks-queues", name: "Stacks & Queues", total: 10, lessonUrl: "lessons/stack.html", quizUrl: "quizzes/stack-quiz.html" },
    { id: "trees", name: "Trees", total: 10, lessonUrl: "lessons/tree.html", quizUrl: "quizzes/tree-quiz.html" },
    { id: "graphs", name: "Graphs", total: 10, lessonUrl: "lessons/graph.html", quizUrl: "quizzes/graph-quiz.html" },
    { id: "sorting", name: "Sorting", total: 10, lessonUrl: "lessons/sorting.html", quizUrl: "quizzes/sorting-quiz.html" },
  ];

  const FIRST_LESSON_URL = "lessons/array.html";
  // v2: bumped so any browser that already has old seeded demo data
  // (from before the dashboard was switched to a true empty start)
  // simply won't find this key and will get a fresh, real, all-zero state.
  const STORAGE_KEY = "csPlatformData_v2";

  // Majors the recommendation engine can choose from, each with the topic
  // ids it weighs most heavily (based on completion % + average quiz score).
  const MAJORS = [
    {
      name: "Data Science",
      weightTopics: ["arrays", "trees", "sorting"],
      reasons: [
        "Strong performance in algorithm complexity",
        "High engagement with data structures",
        "Excellent analytical problem-solving",
      ],
    },
    {
      name: "Software Engineering",
      weightTopics: ["linked-lists", "stacks-queues", "graphs"],
      reasons: [
        "Consistent progress across core data structures",
        "Solid grasp of memory and reference-based structures",
        "Good balance across multiple topics",
      ],
    },
    {
      name: "Artificial Intelligence",
      weightTopics: ["graphs", "trees", "sorting"],
      reasons: [
        "High accuracy on graph and tree traversal quizzes",
        "Comfortable with recursive problem-solving",
        "Fast completion time on optimization topics",
      ],
    },
  ];

  /* ------------------------------------------------------------------ *
   * 2. DEFAULT DATA (used only the very first time the dashboard loads,
   *    i.e. when localStorage is empty). This is a genuinely EMPTY
   *    state — zero lessons, zero quizzes, no activity — so a student
   *    who hasn't done anything yet sees an honest "just getting
   *    started" dashboard instead of fabricated progress. Real numbers
   *    only appear once CSPlatform.markLessonComplete() /
   *    recordQuizResult() are called from the lesson/quiz pages.
   * ------------------------------------------------------------------ */
  function buildDefaultData() {
    const emptyPerTopic = {};
    TOPICS.forEach((t) => (emptyPerTopic[t.id] = 0));

    return {
      completedLessons: { ...emptyPerTopic },
      quizResults: {}, // topicId -> array of scores, only added once a quiz is taken
      weeklyPerformance: [0, 0, 0, 0, 0, 0],
      learningTimeMinutes: { ...emptyPerTopic },
      activeDates: [],
      recentActivity: [],
      lastLesson: null,
      recommendedMajor: null, // stays null until at least one quiz is recorded
    };
  }

  function isoDaysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  }

  /* ------------------------------------------------------------------ *
   * 3. STORAGE HELPERS
   * ------------------------------------------------------------------ */
  function getData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const fresh = buildDefaultData();
        saveData(fresh);
        return fresh;
      }
      return JSON.parse(raw);
    } catch (err) {
      console.warn("CSPlatform: could not read localStorage, using defaults.", err);
      return buildDefaultData();
    }
  }

  function saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn("CSPlatform: could not persist to localStorage.", err);
    }
  }

  /* ------------------------------------------------------------------ *
   * 4. PUBLIC INTEGRATION API (window.CSPlatform)
   *    Lesson/quiz pages call these to update platform state.
   * ------------------------------------------------------------------ */
  function markLessonComplete(topicId) {
    const data = getData();
    const topic = TOPICS.find((t) => t.id === topicId);
    if (!topic) return;

    const current = data.completedLessons[topicId] || 0;
    data.completedLessons[topicId] = Math.min(current + 1, topic.total);

    pushActivity(data, {
      type: "lesson",
      text: `Completed a lesson in ${topic.name}`,
      link: topic.lessonUrl,
    });

    recordActiveDate(data);
    data.recommendedMajor = computeRecommendedMajor(data);
    saveData(data);
    return data;
  }

  function recordQuizResult(topicId, score) {
    const data = getData();
    const topic = TOPICS.find((t) => t.id === topicId);
    if (!topic) return;

    if (!data.quizResults[topicId]) data.quizResults[topicId] = [];
    data.quizResults[topicId].push(Math.max(0, Math.min(100, score)));

    pushActivity(data, {
      type: "quiz",
      text: `${score >= 60 ? "Passed" : "Attempted"} ${topic.name} Quiz (${score}%)`,
      link: topic.quizUrl,
    });

    // Roll the new score into this week's average performance bucket.
    const weekly = data.weeklyPerformance.slice();
    weekly[weekly.length - 1] = Math.round((weekly[weekly.length - 1] + score) / 2);
    data.weeklyPerformance = weekly;

    recordActiveDate(data);
    data.recommendedMajor = computeRecommendedMajor(data);
    saveData(data);
    return data;
  }

  function setLastLesson(topicId, url) {
    const data = getData();
    data.lastLesson = { topicId, url };
    saveData(data);
    return data;
  }

  function addLearningMinutes(topicId, minutes) {
    const data = getData();
    data.learningTimeMinutes[topicId] = (data.learningTimeMinutes[topicId] || 0) + minutes;
    saveData(data);
    return data;
  }

  function pushActivity(data, entry) {
    data.recentActivity.unshift({
      type: entry.type,
      text: entry.text,
      link: entry.link || null,
      timestamp: Date.now(),
    });
    data.recentActivity = data.recentActivity.slice(0, 8);
  }

  function recordActiveDate(data) {
    const today = isoDaysAgo(0);
    if (!data.activeDates.includes(today)) {
      data.activeDates.unshift(today);
      data.activeDates = data.activeDates.slice(0, 60);
    }
  }

  /* ------------------------------------------------------------------ *
   * 5. DERIVED STATS
   * ------------------------------------------------------------------ */
  function computeTotals(data) {
    let completed = 0;
    let total = 0;
    TOPICS.forEach((t) => {
      completed += data.completedLessons[t.id] || 0;
      total += t.total;
    });
    return { completed, total };
  }

  function computeAverageScore(data) {
    const all = [];
    Object.values(data.quizResults).forEach((arr) => all.push(...arr));
    if (!all.length) return 0;
    const sum = all.reduce((a, b) => a + b, 0);
    return Math.round(sum / all.length);
  }

  function computeStreak(data) {
    const dates = new Set(data.activeDates);
    let streak = 0;
    let cursor = 0;
    // Count backwards from today while each day is present in activeDates.
    while (dates.has(isoDaysAgo(cursor))) {
      streak += 1;
      cursor += 1;
    }
    return streak;
  }

  function computeTotalLearningHours(data) {
    const totalMinutes = Object.values(data.learningTimeMinutes).reduce((a, b) => a + b, 0);
    return Math.round((totalMinutes / 60) * 10) / 10;
  }

  function computeRecommendedMajor(data) {
    const hasAnyQuizData = Object.values(data.quizResults).some((arr) => arr.length > 0);
    if (!hasAnyQuizData) return null; // nothing to base a recommendation on yet

    let best = null;
    let bestScore = -1;

    MAJORS.forEach((major) => {
      let score = 0;
      let weightCount = 0;
      major.weightTopics.forEach((topicId) => {
        const topic = TOPICS.find((t) => t.id === topicId);
        const completedPct = ((data.completedLessons[topicId] || 0) / topic.total) * 100;
        const quizScores = data.quizResults[topicId] || [];
        const avgQuiz = quizScores.length
          ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length
          : 0;
        score += completedPct * 0.5 + avgQuiz * 0.5;
        weightCount += 1;
      });
      const normalized = weightCount ? score / weightCount : 0;
      if (normalized > bestScore) {
        bestScore = normalized;
        best = major;
      }
    });

    return {
      name: best.name,
      percent: Math.max(60, Math.min(98, Math.round(bestScore))),
      reasons: best.reasons,
    };
  }

  function findContinueLearningUrl(data) {
    // 1. Prefer the last lesson the student was on, if it isn't finished.
    if (data.lastLesson && data.lastLesson.topicId) {
      const topic = TOPICS.find((t) => t.id === data.lastLesson.topicId);
      if (topic && (data.completedLessons[topic.id] || 0) < topic.total) {
        return data.lastLesson.url || topic.lessonUrl;
      }
    }
    // 2. Otherwise, first topic that isn't fully completed.
    const inProgress = TOPICS.find((t) => (data.completedLessons[t.id] || 0) < t.total);
    if (inProgress) return inProgress.lessonUrl;

    // 3. Everything is complete — send them back to the very first lesson.
    return FIRST_LESSON_URL;
  }

  /* ------------------------------------------------------------------ *
   * 6. RENDERING
   * ------------------------------------------------------------------ */
  function renderStats(data) {
    const { completed, total } = computeTotals(data);
    document.getElementById("statLessonsCompleted").textContent = completed;
    document.getElementById("statLessonsBadge").textContent = `of ${total}`;

    const avgScore = computeAverageScore(data);
    document.getElementById("statQuizAverage").textContent = `${avgScore}%`;

    const streak = computeStreak(data);
    document.getElementById("statStreak").textContent = streak;
    document.getElementById("statStreakBadge").textContent = streak === 1 ? "Day" : "Days";

    const hours = computeTotalLearningHours(data);
    document.getElementById("statLearningTime").textContent = hours;
  }

  function renderRecommendation(data) {
    const rec = data.recommendedMajor;
    const list = document.getElementById("recommendReasons");

    if (!rec) {
      // No quiz taken yet — show an honest empty state instead of a guess.
      document.getElementById("recommendMajorName").textContent = "Not yet available";
      document.getElementById("recommendPercent").textContent = "";
      document.getElementById("recommendProgressBar").style.width = "0%";
      list.innerHTML = `<li><i class="bi bi-info-circle-fill"></i><span>Take the career quiz to get a personalized major recommendation.</span></li>`;
      return;
    }

    document.getElementById("recommendMajorName").textContent = rec.name;
    document.getElementById("recommendPercent").textContent = `${rec.percent}%`;
    document.getElementById("recommendProgressBar").style.width = `${rec.percent}%`;

    list.innerHTML = "";
    rec.reasons.forEach((reason) => {
      const li = document.createElement("li");
      li.innerHTML = `<i class="bi bi-check-circle-fill"></i><span>${escapeHtml(reason)}</span>`;
      list.appendChild(li);
    });
  }

  function renderTopicProgress(data) {
    const container = document.getElementById("topicProgressList");
    container.innerHTML = "";

    TOPICS.forEach((topic) => {
      const completed = data.completedLessons[topic.id] || 0;
      const pct = Math.round((completed / topic.total) * 100);

      const a = document.createElement("a");
      a.href = topic.lessonUrl;
      a.className = "topic-row reveal-on-scroll";
      a.innerHTML = `
        <div class="topic-row-top">
          <span class="topic-name">${escapeHtml(topic.name)}</span>
          <span class="topic-count">${completed} / ${topic.total}</span>
        </div>
        <div class="progress-track">
          <span style="width:${pct}%"></span>
        </div>
      `;
      container.appendChild(a);
    });
  }

  const ACTIVITY_ICON = {
    lesson: { icon: "bi-check-circle-fill", cls: "type-lesson" },
    quiz: { icon: "bi-patch-check-fill", cls: "type-quiz" },
    start: { icon: "bi-play-circle-fill", cls: "type-start" },
    milestone: { icon: "bi-award-fill", cls: "type-milestone" },
  };

  function renderActivity(data) {
    const list = document.getElementById("activityList");
    list.innerHTML = "";

    if (!data.recentActivity.length) {
      list.innerHTML = `<p class="panel-subtitle" style="margin:0;">No activity yet — start a lesson to see it show up here.</p>`;
      return;
    }

    data.recentActivity.forEach((item) => {
      const meta = ACTIVITY_ICON[item.type] || ACTIVITY_ICON.lesson;
      const el = document.createElement(item.link ? "a" : "div");
      el.className = "activity-item reveal-on-scroll";
      if (item.link) el.href = item.link;

      el.innerHTML = `
        <div class="activity-icon ${meta.cls}"><i class="bi ${meta.icon}"></i></div>
        <div>
          <div class="activity-text">${escapeHtml(item.text)}</div>
          <div class="activity-time">${timeAgo(item.timestamp)}</div>
        </div>
      `;
      list.appendChild(el);
    });
  }

  /* ------------------------------------------------------------------ *
   * 7. CHARTS (Chart.js)
   * ------------------------------------------------------------------ */
  let performanceChart = null;
  let timeChart = null;

  function renderPerformanceChart(data) {
    const ctx = document.getElementById("performanceChart").getContext("2d");
    const labels = data.weeklyPerformance.map((_, i) => `Week ${i + 1}`);

    if (performanceChart) performanceChart.destroy();
    performanceChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Quiz Score",
            data: data.weeklyPerformance,
            borderColor: "#3b6fe0",
            backgroundColor: "rgba(59, 111, 224, 0.12)",
            pointBackgroundColor: "#3b6fe0",
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.35,
            fill: true,
            borderWidth: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 900, easing: "easeOutQuart" },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (c) => `${c.parsed.y}% average` },
          },
        },
        scales: {
          y: {
            min: 0,
            max: 100,
            ticks: { stepSize: 25, color: "#6b7280" },
            grid: { color: "#eef1f6" },
          },
          x: {
            ticks: { color: "#6b7280" },
            grid: { display: false },
          },
        },
      },
    });
  }

  const TIME_COLORS = {
    arrays: "#3b6fe0",
    "linked-lists": "#7b4fd6",
    trees: "#2fb380",
    graphs: "#e08a2b",
    sorting: "#d9436b",
  };

  function renderTimeChart(data) {
    // Spec: pie shows Arrays, Linked Lists, Trees, Graphs, Sorting.
    const pieTopics = TOPICS.filter((t) => t.id !== "stacks-queues");
    const labels = pieTopics.map((t) => t.name);
    const values = pieTopics.map((t) => Math.round(((data.learningTimeMinutes[t.id] || 0) / 60) * 10) / 10);
    const colors = pieTopics.map((t) => TIME_COLORS[t.id]);

    const canvas = document.getElementById("timeChart");
    const legend = document.getElementById("pieLegend");
    const hasData = values.some((v) => v > 0);

    if (!hasData) {
      canvas.style.display = "none";
      legend.innerHTML = "";
      let empty = document.getElementById("timeChartEmpty");
      if (!empty) {
        empty = document.createElement("p");
        empty.id = "timeChartEmpty";
        empty.className = "panel-subtitle";
        empty.style.margin = "0";
        canvas.insertAdjacentElement("afterend", empty);
      }
      empty.textContent = "No learning time logged yet — it'll show up here once you start a lesson.";
      if (timeChart) { timeChart.destroy(); timeChart = null; }
      return;
    }

    const existingEmpty = document.getElementById("timeChartEmpty");
    if (existingEmpty) existingEmpty.remove();
    canvas.style.display = "block";

    const ctx = canvas.getContext("2d");
    if (timeChart) timeChart.destroy();
    timeChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [{ data: values, backgroundColor: colors, borderColor: "#fff", borderWidth: 2 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 900, easing: "easeOutQuart" },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => `${c.label}: ${c.parsed}h` } },
        },
      },
    });

    renderPieLegend(pieTopics, values, colors);
  }

  function renderPieLegend(pieTopics, values, colors) {
    const legend = document.getElementById("pieLegend");
    legend.innerHTML = pieTopics
      .map(
        (t, i) =>
          `<span><span class="dot" style="background:${colors[i]}"></span>${escapeHtml(t.name)}: ${values[i]}h</span>`
      )
      .join("");
  }

  /* ------------------------------------------------------------------ *
   * 8. EVENTS
   * ------------------------------------------------------------------ */
  function bindEvents(data) {
    document.getElementById("btnContinueLearning").addEventListener("click", () => {
      window.location.href = findContinueLearningUrl(data);
    });

    document.getElementById("btnRetakeQuiz").addEventListener("click", () => {
      window.location.href = "career-quiz.html";
    });

    document.getElementById("btnOpenVisualizer").addEventListener("click", () => {
      window.location.href = "visualizer.html";
    });

    document.getElementById("btnExploreMajor").addEventListener("click", () => {
      window.location.href = "major.html";
    });
  }

  /* ------------------------------------------------------------------ *
   * 9. SCROLL REVEAL ANIMATION
   * ------------------------------------------------------------------ */
  function initScrollReveal() {
    const targets = document.querySelectorAll(".reveal-on-scroll");
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    targets.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------ *
   * 10. UTILITIES
   * ------------------------------------------------------------------ */
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function timeAgo(timestamp) {
    const diffMs = Date.now() - timestamp;
    const minutes = Math.round(diffMs / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.round(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  /* ------------------------------------------------------------------ *
   * 11. INIT
   * ------------------------------------------------------------------ */
  function init() {
    // Only run the full dashboard render on pages that have the dashboard
    // DOM in place. On lesson/quiz pages that merely include this script
    // for the CSPlatform API, these elements won't exist — skip quietly.
    if (!document.getElementById("statLessonsCompleted")) return;

    const data = getData();
    recordActiveDate(data);
    data.recommendedMajor = computeRecommendedMajor(data);
    saveData(data);

    renderStats(data);
    renderRecommendation(data);
    renderTopicProgress(data);
    renderActivity(data);
    renderPerformanceChart(data);
    renderTimeChart(data);
    bindEvents(data);
    initScrollReveal();
  }

  document.addEventListener("DOMContentLoaded", init);

  /* ------------------------------------------------------------------ *
   * 12. EXPOSE PUBLIC API
   * ------------------------------------------------------------------ */
  window.CSPlatform = {
    STORAGE_KEY,
    TOPICS,
    getData,
    saveData,
    markLessonComplete,
    recordQuizResult,
    setLastLesson,
    addLearningMinutes,
    findContinueLearningUrl,
  };
})();