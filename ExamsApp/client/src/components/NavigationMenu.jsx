/**
 * Modern Navigation Menu component
 */
const NavigationMenu = ({ user, onLogout }) => {
  // If no user is logged in, don't show the menu
  if (!user) return null;

  return (
    <nav className="navbar navbar-light py-2 bg-white sticky-top border-bottom shadow-sm">
      <div className="container d-flex align-items-center justify-content-between">
        {/* Brand */}
        <a className="navbar-brand d-flex align-items-center" href="#" onClick={(e) => e.preventDefault()}>
          <span className="fw-bold fs-5 text-dark" style={{ letterSpacing: '-1.5px' }}>
            E-Test <span style={{ color: 'var(--primary-blue)' }}>System</span>
          </span>
        </a>

        {/* Right Actions - Always Visible */}
        <div className="d-flex align-items-center gap-3">
          {/* Notifications */}
          <button className="nav-icon-btn btn border-0 p-2 shadow-none position-relative bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle" style={{ width: '10px', height: '10px' }}></span>
          </button>

          {/* Profile Section */}
          <div className="d-flex align-items-center border-start ps-3 ms-1">
            <div className="profile-avatar me-2" style={{ width: '34px', height: '34px', fontSize: '0.85rem' }}>
              {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div className="text-start d-none d-sm-block me-3">
              <div className="fw-bold text-dark small" style={{ lineHeight: '1.2' }}>{user.fullName}</div>
              <div className="text-muted" style={{ fontSize: '0.65rem' }}>
                {user.role === 'teacher' ? 'Faculty' : 'Student'}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold d-flex align-items-center gap-2" onClick={onLogout} style={{ fontSize: '0.75rem' }}>
            <span className="d-none d-md-inline">Logout</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavigationMenu;
