import React from 'react';

/**
 * רכיב תפריט ניווט
 * Navigation Menu component
 */
const NavigationMenu = ({ user, onLogout, onToggleRole }) => {
  // אם אין משתמש מחובר, לא מציגים את התפריט
  if (!user) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 rounded px-3">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">E-Test System</a>
        
        <div className="d-flex align-items-center">
          <span className="text-light me-3">שלום, {user.fullName} ({user.role})</span>
          
          <div className="btn-group me-3" role="group">
            <button 
              className={`btn btn-outline-info ${user.role === 'teacher' ? 'active' : ''}`}
              onClick={() => onToggleRole('teacher')}
            >
              Teacher View
            </button>
            <button 
              className={`btn btn-outline-info ${user.role === 'student' ? 'active' : ''}`}
              onClick={() => onToggleRole('student')}
            >
              Student View
            </button>
          </div>

          <button className="btn btn-danger" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavigationMenu;
