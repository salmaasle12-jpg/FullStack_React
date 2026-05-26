/**
 * רכיב תפריט ניווט מעוצב
 * Modern Navigation Menu component
 */
const NavigationMenu = ({ user, onLogout, onToggleRole }) => {
  // אם אין משתמש מחובר, לא מציגים את התפריט
  if (!user) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm mb-4 sticky-top px-3 py-2 border-bottom">
      <div className="container">
        <a className="navbar-brand d-flex align-items-center" href="#">
          <span className="fs-3 me-2">📝</span>
          <span className="fw-bold text-primary">E-Test System</span>
        </a>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarMain">
          <div className="ms-auto d-flex align-items-center gap-3">
            <div className="d-none d-lg-block border-end pe-3 me-1">
              <span className="text-muted small">Logged in as:</span>
              <div className="fw-bold text-dark">
                {user.fullName} {user.role === 'teacher' ? '👩‍🏫' : '🎓'}
              </div>
            </div>
            
            <div className="btn-group shadow-sm rounded-pill overflow-hidden" role="group">
              <button 
                className={`btn btn-sm px-3 ${user.role === 'teacher' ? 'btn-primary' : 'btn-outline-primary border-0'}`}
                onClick={() => onToggleRole('teacher')}
              >
                Teacher
              </button>
              <button 
                className={`btn btn-sm px-3 ${user.role === 'student' ? 'btn-primary' : 'btn-outline-primary border-0'}`}
                onClick={() => onToggleRole('student')}
              >
                Student
              </button>
            </div>

            <button className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-bold" onClick={onLogout}>
              Logout 🔐
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationMenu;
