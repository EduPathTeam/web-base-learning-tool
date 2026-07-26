
  // Scrolled glass effect
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  });
 
  const navLinks = document.querySelectorAll(".nav-link");
  const nav = document.getElementById('nav');
  const pill = document.getElementById('navPill');
  const activePill = document.getElementById('activePill');
 
  // ---------- Active page detection ----------
  function currentFile() {
    const path = window.location.pathname.split('/').pop();
    return path || 'home.html';
  }
 
  function setActiveLink() {
    const current = currentFile();
    let matched = false;
    navLinks.forEach(link => {
      if (link.getAttribute('href') === current) {
        link.classList.add('active');
        matched = true;
      } else {
        link.classList.remove('active');
      }
    });
    // Fallback (e.g. previewing this file directly): highlight Home
    if (!matched) {
      document.querySelectorAll('[data-exact]').forEach(el => el.classList.add('active'));
    }
  }
 
  // Positions the persistent "active page" pill under the current desktop nav link
  function positionActivePill(skipAnim) {
    const activeLink = nav.querySelector('.nav-link.active');
    if (!activeLink) {
      activePill.classList.remove('show');
      return;
    }
    if (skipAnim) activePill.classList.add('no-anim');
 
    const navRect = nav.getBoundingClientRect();
    const r = activeLink.getBoundingClientRect();
    activePill.style.width = r.width + 'px';
    activePill.style.transform = `translateX(${r.left - navRect.left}px)`;
    activePill.classList.add('show');
 
    if (skipAnim) {
      // force reflow so the position applies before re-enabling the transition
      void activePill.offsetWidth;
      activePill.classList.remove('no-anim');
    }
  }
 
  navLinks.forEach(link => {
    link.addEventListener("click", function () {
      navLinks.forEach(item => item.classList.remove("active"));
      this.classList.add("active");
      if (this.closest('#nav')) positionActivePill();
    });
  });
 
  // Sliding hover pill
  const links = nav.querySelectorAll('a.nav-link');
 
  function movePillTo(el) {
    const navRect = nav.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    pill.style.width = r.width + 'px';
    pill.style.transform = `translateX(${r.left - navRect.left}px)`;
  }
 
  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      nav.classList.add('has-hover');
      movePillTo(link);
    });
  });
  nav.addEventListener('mouseleave', () => {
    nav.classList.remove('has-hover');
  });
 
  // Keep the active pill aligned on resize
  window.addEventListener('resize', () => positionActivePill(true));
 
  // Init: mark + position the active page pill without an initial slide-in
  setActiveLink();
  requestAnimationFrame(() => positionActivePill(true));
 
  // Mobile drawer
  const burger = document.getElementById('burger');
  const mobileNav = document.getElementById('mobileNav');
  const burgerIcon = document.getElementById('burgerIcon');
  let open = false;
  burger.addEventListener('click', () => {
    open = !open;
    mobileNav.classList.toggle('open', open);
    burgerIcon.innerHTML = open
      ? '<line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/>'
      : '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>';
  });
// Counter animation for Our Impact
const counters = document.querySelectorAll('.impact-number');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-target'), 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 1400;
      const startTime = performance.now();

      function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.floor(eased * target);
        el.textContent = value.toLocaleString() + suffix;
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = target.toLocaleString() + suffix;
        }
      }
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.4 });
counters.forEach(el => counterObserver.observe(el));