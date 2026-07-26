
// ---------- Carousel data ----------
const courses = [
  { title:"Data Structure & Algorithm", icon:"bi-diagram-3", color:"#8B5CF6" },
  { title:"Python", icon:"bi-filetype-py", color:"#63B3ED" },
  { title:"Java", icon:"bi-cup-hot", color:"#E9A23B" },
  { title:"HTML & CSS", icon:"bi-code-slash", color:"#F0653D" },
  { title:"Database", icon:"bi-hdd-stack", color:"#374151" }
];

const track = document.getElementById('track');
const indicatorsWrap = document.getElementById('indicators');
let current = 0;

courses.forEach((c, i) => {
  const card = document.createElement('div');
  card.className = 'course-card';
  card.innerHTML = `
    <div class="icon-wrap" style="background:${c.color}"><i class="bi ${c.icon}"></i></div>
    <div class="title">${c.title}</div>
  `;
  track.appendChild(card);

  const dot = document.createElement('button');
  dot.className = 'dot';
  dot.setAttribute('aria-label', 'Go to slide ' + (i+1));
  dot.addEventListener('click', () => { current = i; render(); resetAuto(); });
  indicatorsWrap.appendChild(dot);
});

const cardEls = () => track.querySelectorAll('.course-card');
const dotEls = () => indicatorsWrap.querySelectorAll('.dot');

function posClass(offset){
  const n = courses.length;
  const o = ((offset % n) + n) % n;
  if(o === 0) return 'pos-center';
  if(o === 1) return 'pos-right1';
  if(o === 2) return 'pos-right2';
  if(o === n-1) return 'pos-left1';
  if(o === n-2) return 'pos-left2';
  return 'pos-hide';
}

function render(){
  cardEls().forEach((card, i) => {
    card.className = 'course-card ' + posClass(i - current);
  });
  dotEls().forEach((d, i) => d.classList.toggle('active', i === current));
}

function next(){ current = (current + 1) % courses.length; render(); }
function prev(){ current = (current - 1 + courses.length) % courses.length; render(); }

document.getElementById('nextBtn').addEventListener('click', () => { next(); resetAuto(); });
document.getElementById('prevBtn').addEventListener('click', () => { prev(); resetAuto(); });

let autoTimer = setInterval(next, 4000);
function resetAuto(){
  clearInterval(autoTimer);
  autoTimer = setInterval(next, 4000);
}

render();

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