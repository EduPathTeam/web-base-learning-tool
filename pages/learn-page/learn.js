// ---------- Fade in on scroll ----------
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// ---------- Header scroll effect ----------
const header = document.getElementById('header');

function handleHeaderScroll() {
  if (window.scrollY > 40) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleHeaderScroll);
handleHeaderScroll(); // run once immediately, in case the page loads already scrolled down

// ---------- Nav pill: hover + active ----------
const nav = document.getElementById('nav');
const navPill = document.getElementById('navPill');
const activePill = document.getElementById('activePill');
const navLinks = nav.querySelectorAll('a.nav-link');

// Move a pill element to sit exactly behind a given link
function movePillTo(pill, link) {
  pill.style.width = link.offsetWidth + 'px';
  pill.style.transform = `translateX(${link.offsetLeft}px)`;
}

// ---------- Hover pill: follows whichever link you're pointing at ----------
navLinks.forEach(link => {
  link.addEventListener('mouseenter', () => {
    movePillTo(navPill, link);
    nav.classList.add('has-hover');
  });
});

nav.addEventListener('mouseleave', () => {
  nav.classList.remove('has-hover');
});

// ---------- Active pill: locks onto the current page, persists on click ----------
function setActivePill(animate = true) {
  const currentPath = window.location.pathname.split('/').pop();

  let activeLink = null;
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href').split('/').pop();
    if (linkPath === currentPath) {
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
    // re-enable animation after the instant snap, so future moves are smooth
    requestAnimationFrame(() => activePill.classList.remove('no-anim'));
  } else {
    activePill.classList.remove('show');
  }
}

// Run on load (no animation — snap straight to position)
setActivePill(false);

// Re-run on resize, since link widths/positions shift
window.addEventListener('resize', () => setActivePill(false));

// ==========================================================================
// Lessons UI - Interaction Script
// Handles click selection state and simple hover-driven feedback for
// the lesson buttons in both the Data Structure and Algorithm sections.
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const allLessonButtons = document.querySelectorAll('.lesson-btn');

  allLessonButtons.forEach((button) => {
    // Click interaction: mark the clicked button as "selected" within its
    // own card, and remove the selected state from its siblings.
    button.addEventListener('click', () => {
      const parentCard = button.closest('.lesson-card');
      const siblingButtons = parentCard.querySelectorAll('.lesson-btn');

      siblingButtons.forEach((sibling) => sibling.classList.remove('is-selected'));
      button.classList.add('is-selected');

      const lessonName = button.getAttribute('data-lesson');
      console.log(`Lesson selected: ${lessonName}`);
    });

    // Optional: add a subtle "pressed" class while the mouse is down,
    // giving immediate tactile feedback before the CSS transition kicks in.
    button.addEventListener('mousedown', () => {
      button.classList.add('is-pressed');
    });

    button.addEventListener('mouseup', () => {
      button.classList.remove('is-pressed');
    });

    button.addEventListener('mouseleave', () => {
      button.classList.remove('is-pressed');
    });
  });
});