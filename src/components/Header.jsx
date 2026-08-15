import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';

// React port of learn-common.js's header/nav-pill/burger behavior.
// Same markup/classes as the static site's header so array.css/learn.css
// styling applies unchanged.
const NAV_LINKS = [
  { to: '/', label: 'Home', exact: true },
  { to: '/learn', label: 'Learn', section: 'learn' },
  { to: '/quiz', label: 'Quiz' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/about', label: 'About' },
];

export default function Header({ navSection }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef(null);
  const navPillRef = useRef(null);
  const activePillRef = useRef(null);
  const linkRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  function handleSignOut() {
    logout();
    navigate('/');
  }

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 40);
    }
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function movePillTo(pillEl, linkEl) {
    if (!pillEl || !linkEl) return;
    pillEl.style.width = linkEl.offsetWidth + 'px';
    pillEl.style.transform = `translateX(${linkEl.offsetLeft}px)`;
  }

  function isActive(item) {
    if (item.exact) return location.pathname === '/';
    if (item.section && navSection && item.section === navSection) return true;
    return location.pathname === item.to || location.pathname.startsWith(item.to + '/');
  }

  useEffect(() => {
    const activeIndex = NAV_LINKS.findIndex((item) => isActive(item));
    const activeLink = linkRefs.current[activeIndex];
    if (activeLink && activePillRef.current) {
      activePillRef.current.classList.add('no-anim');
      movePillTo(activePillRef.current, activeLink);
      activePillRef.current.classList.add('show');
      requestAnimationFrame(() => activePillRef.current?.classList.remove('no-anim'));
    } else if (activePillRef.current) {
      activePillRef.current.classList.remove('show');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, navSection]);

  return (
    <header className={`header${scrolled ? ' scrolled' : ''}`} id="header">
      <div className="header-inner">
        <Link to="/" className="logo">
          <img src="/images/icon.png" alt="" width="30" height="30" className="logo-icon" />
          Edu<span className="logo-span">Path</span>
        </Link>

        <nav className="nav" ref={navRef} id="nav">
          <span className="active-pill" ref={activePillRef} id="activePill"></span>
          <span className="nav-pill" ref={navPillRef} id="navPill"></span>
          {NAV_LINKS.map((item, i) => (
            <Link
              key={item.to}
              to={item.to}
              ref={(el) => (linkRefs.current[i] = el)}
              className={`nav-link${isActive(item) ? ' active' : ''}`}
              onMouseEnter={() => {
                movePillTo(navPillRef.current, linkRefs.current[i]);
                navRef.current?.classList.add('has-hover');
              }}
              onMouseLeave={() => navRef.current?.classList.remove('has-hover')}
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <UserMenu user={user} isAdmin={isAdmin} onSignOut={handleSignOut} />
          ) : (
            <Link to="/sign-in" className="login-icon">
              <i className="bi bi-box-arrow-in-right"></i> Sign In
            </Link>
          )}
        </nav>

        <button
          className="burger"
          id="burger"
          aria-label="Menu"
          onClick={() => setMobileOpen((o) => !o)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      <nav className={`mobile-nav${mobileOpen ? ' open' : ''}`} id="mobileNav">
        <div className="mobile-nav-inner">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-link${isActive(item) ? ' active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <UserMenu
              user={user}
              isAdmin={isAdmin}
              onSignOut={handleSignOut}
              onItemClick={() => setMobileOpen(false)}
              inline
            />
          ) : (
            <Link to="/sign-in" className="login-icon" onClick={() => setMobileOpen(false)}>
              <i className="bi bi-box-arrow-in-right"></i> Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
