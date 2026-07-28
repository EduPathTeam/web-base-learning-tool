// ==========================================================================
// Array Data Structure Page - Interaction Script
// ==========================================================================

// ---------- Header scroll effect ----------
// Adds/removes .scrolled on the header once the page scrolls past 40px,
// matching the behavior on the Learn page.
const header = document.getElementById('header');

function handleHeaderScroll() {
  if (!header) return;
  if (window.scrollY > 40) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleHeaderScroll);
handleHeaderScroll(); // run once immediately, in case the page loads already scrolled down

// ---------- Nav pill: hover + active ----------
// This is what actually shows the green pill behind a nav link on hover —
// it was missing from this page's script, so the pill CSS had nothing
// telling it where to go or to become visible.
const nav = document.getElementById('nav');
const navPill = document.getElementById('navPill');
const activePill = document.getElementById('activePill');
const navLinks = nav ? nav.querySelectorAll('a.nav-link') : [];

function movePillTo(pill, link) {
  if (!pill || !link) return;
  pill.style.width = link.offsetWidth + 'px';
  pill.style.transform = `translateX(${link.offsetLeft}px)`;
}

// Hover pill: follows whichever link you're pointing at
navLinks.forEach(link => {
  link.addEventListener('mouseenter', () => {
    movePillTo(navPill, link);
    nav.classList.add('has-hover');
  });
});

if (nav) {
  nav.addEventListener('mouseleave', () => {
    nav.classList.remove('has-hover');
  });
}

// Active pill: locks onto the current page (or current section), persists on click
function setActivePill(animate = true) {
  if (!nav || !activePill) return;
  const currentPath = window.location.pathname.split('/').pop();
  const currentSection = document.body.getAttribute('data-nav-section');

  let activeLink = null;
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href').split('/').pop();
    const linkSection = link.getAttribute('data-section');

    // A link is active if it's the exact current page, OR if this page
    // declared itself part of the same section (e.g. array-page declares
    // data-nav-section="learn" so the Learn link stays highlighted there).
    const matchesPath = linkPath === currentPath;
    const matchesSection = currentSection && linkSection && linkSection === currentSection;

    if (matchesPath || matchesSection) {
      link.classList.add('active');
      activeLink = link;
    } else {
      link.classList.remove('active');
    }
  });

  if (activeLink) {
    if (!animate) activePill.classList.add('no-anim');
    movePillTo(activePill, activeLink);
    activePill.classList.add('show');
    requestAnimationFrame(() => activePill.classList.remove('no-anim'));
  } else {
    activePill.classList.remove('show');
  }
}

setActivePill(false); // snap to position on load, no animation
window.addEventListener('resize', () => setActivePill(false));

// ---------- Mobile burger menu ----------
const burger = document.getElementById('burger');
const mobileNav = document.getElementById('mobileNav');
if (burger && mobileNav) {
  burger.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
  });
}

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------
     1. FADE-IN ON SCROLL
     Reveals .fade-in elements as they enter the viewport.
  ------------------------------------------------------------------ */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-in').forEach((el) => revealObserver.observe(el));

  /* ------------------------------------------------------------------
     2. SMOOTH SCROLL for in-page anchor links (e.g. "Learn more")
  ------------------------------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      const targetEl = targetId.length > 1 ? document.querySelector(targetId) : null;
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ------------------------------------------------------------------
     3. BUTTON RIPPLE EFFECT
     Applies to every Bootstrap-style button on the page.
  ------------------------------------------------------------------ */
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.style.position = btn.style.position || 'relative';
    btn.style.overflow = 'hidden';

    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);

      ripple.style.position = 'absolute';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      ripple.style.borderRadius = '50%';
      ripple.style.background = 'rgba(255, 255, 255, 0.5)';
      ripple.style.transform = 'scale(0)';
      ripple.style.pointerEvents = 'none';
      ripple.style.transition = 'transform 0.5s ease, opacity 0.5s ease';

      this.appendChild(ripple);
      requestAnimationFrame(() => {
        ripple.style.transform = 'scale(2.5)';
        ripple.style.opacity = '0';
      });

      setTimeout(() => ripple.remove(), 500);
    });
  });

  /* ------------------------------------------------------------------
     4. HERO BUTTONS
  ------------------------------------------------------------------ */
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      // Go back to the previous page (e.g. the lessons list), falling
      // back to the lessons page if there's no browser history.
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = '../learn-page/learn.html';
      }
    });
  }

  const startLearningBtn = document.getElementById('startLearningBtn');
  if (startLearningBtn) {
    startLearningBtn.addEventListener('click', () => {
      document.getElementById('what-is-array').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  const viewExampleBtn = document.getElementById('viewExampleBtn');
  if (viewExampleBtn) {
    viewExampleBtn.addEventListener('click', () => {
      document.getElementById('code-example').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ------------------------------------------------------------------
     5. BOTTOM NAVIGATION CARDS -> redirect to the matching page
  ------------------------------------------------------------------ */
  document.querySelectorAll('.bottom-nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      if (target) {
        window.location.href = target;
      }
    });
  });

  /* ------------------------------------------------------------------
     6. ARRAY VISUALIZATION
     Renders the array as connected boxes and wires up Insert / Delete /
     Search / Update so the visual updates with a small animation.
  ------------------------------------------------------------------ */
  let arrayData = [10, 20, 30, 40, 50];

  const boxesEl = document.getElementById('arrayBoxes');
  const indexesEl = document.getElementById('arrayIndexes');
  const statusEl = document.getElementById('arrayStatus');

  function setStatus(message) {
    if (statusEl) statusEl.textContent = message;
  }

  function renderArray(highlightIndex = -1, popIndex = -1) {
    if (!boxesEl || !indexesEl) return;

    boxesEl.innerHTML = '';
    indexesEl.innerHTML = '';

    arrayData.forEach((value, i) => {
      const box = document.createElement('div');
      box.className = 'array-box';
      box.textContent = value;
      if (i === highlightIndex) box.classList.add('highlight');
      if (i === popIndex) box.classList.add('pop-in');
      boxesEl.appendChild(box);

      const idx = document.createElement('div');
      idx.className = 'array-index';
      idx.textContent = i;
      indexesEl.appendChild(idx);
    });
  }

  renderArray();

  document.querySelectorAll('.array-action-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');

      if (action === 'insert') {
        const raw = window.prompt('Enter a value to insert at the end of the array:');
        if (raw === null || raw.trim() === '') return;
        const value = isNaN(Number(raw)) ? raw.trim() : Number(raw);
        arrayData.push(value);
        renderArray(-1, arrayData.length - 1);
        setStatus(`Inserted ${value} at index ${arrayData.length - 1}.`);
      }

      else if (action === 'delete') {
        if (arrayData.length === 0) {
          setStatus('The array is already empty.');
          return;
        }
        const removed = arrayData.pop();
        renderArray();
        setStatus(`Removed ${removed} from the end of the array.`);
      }

      else if (action === 'search') {
        const raw = window.prompt('Enter a value to search for:');
        if (raw === null || raw.trim() === '') return;
        const value = isNaN(Number(raw)) ? raw.trim() : Number(raw);
        const foundIndex = arrayData.indexOf(value);

        if (foundIndex === -1) {
          renderArray();
          setStatus(`${value} was not found in the array.`);
        } else {
          renderArray(foundIndex);
          setStatus(`Found ${value} at index ${foundIndex}.`);
          // remove the highlight after a moment so it reads as a pulse
          setTimeout(() => renderArray(), 1400);
        }
      }

      else if (action === 'update') {
        if (arrayData.length === 0) {
          setStatus('The array is empty — nothing to update.');
          return;
        }
        const idxRaw = window.prompt(`Enter an index to update (0 to ${arrayData.length - 1}):`);
        if (idxRaw === null || idxRaw.trim() === '') return;
        const idx = Number(idxRaw);

        if (!Number.isInteger(idx) || idx < 0 || idx >= arrayData.length) {
          setStatus('That index is out of range.');
          return;
        }

        const valRaw = window.prompt(`Enter the new value for index ${idx}:`);
        if (valRaw === null || valRaw.trim() === '') return;
        const value = isNaN(Number(valRaw)) ? valRaw.trim() : Number(valRaw);

        arrayData[idx] = value;
        renderArray(idx);
        setStatus(`Updated index ${idx} to ${value}.`);
        setTimeout(() => renderArray(), 1400);
      }
    });
  });

  /* ------------------------------------------------------------------
     7. CODE TEST BUTTON (placeholder interaction)
  ------------------------------------------------------------------ */
  const codeTestBtn = document.getElementById('codeTestBtn');
  if (codeTestBtn) {
    codeTestBtn.addEventListener('click', () => {
      setStatus('Try the same operations above in the live visualizer!');
      document.getElementById('visualize-array').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

});