import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// Shared dropdown for the signed-in user menu, used by Header.jsx in both
// the desktop nav (as a floating panel, position: absolute so it can never
// affect .nav's flex layout — see the flex-wrap nav-overlap bug fixed
// earlier) and the mobile drawer (as an inline accordion, since the
// drawer's overflow: hidden would clip a floating panel).
export default function UserMenu({ user, isAdmin, onSignOut, onItemClick, inline = false }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  function close() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) close();
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        close();
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function handleItemClick(action) {
    close();
    onItemClick?.();
    action?.();
  }

  return (
    <div className="user-menu" ref={containerRef}>
      <button
        type="button"
        ref={triggerRef}
        className="login-icon user-menu-trigger"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <i className="bi bi-person-check-fill"></i> {user.displayName}
        <i className={`bi bi-chevron-down user-menu-caret${open ? ' open' : ''}`}></i>
      </button>
      {open && (
        <div className={`user-menu-dropdown${inline ? ' user-menu-dropdown-inline' : ''}`} role="menu">
          <Link to="/profile" role="menuitem" className="user-menu-item" onClick={() => handleItemClick()}>
            <i className="bi bi-person"></i> Profile
          </Link>
          {isAdmin && (
            <>
              <div className="user-menu-divider"></div>
              <Link to="/admin/users" role="menuitem" className="user-menu-item" onClick={() => handleItemClick()}>
                <i className="bi bi-people"></i> Manage Users
              </Link>
              <Link to="/admin/feedback" role="menuitem" className="user-menu-item" onClick={() => handleItemClick()}>
                <i className="bi bi-chat-left-text"></i> Feedback Submissions
              </Link>
              <Link to="/admin/analytics" role="menuitem" className="user-menu-item" onClick={() => handleItemClick()}>
                <i className="bi bi-graph-up"></i> Platform Analytics
              </Link>
            </>
          )}
          <div className="user-menu-divider"></div>
          <button
            type="button"
            role="menuitem"
            className="user-menu-item user-menu-signout"
            onClick={() => handleItemClick(onSignOut)}
          >
            <i className="bi bi-box-arrow-right"></i> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
