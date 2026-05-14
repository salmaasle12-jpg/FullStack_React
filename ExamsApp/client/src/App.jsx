import React, { useState } from 'react';
import TeacherDashboard from './components/TeacherDashboard';
import StudentPortal from './components/StudentPortal';

function App() {
  const [role, setRole] = useState('student'); // Default role

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-dark bg-dark mb-4 shadow-sm">
        <div className="container">
          <span className="navbar-brand h1 mb-0">E-Test System</span>
          <div className="d-flex">
            <button 
              className={`btn ${role === 'teacher' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
              onClick={() => setRole('teacher')}
            >
              Teacher View
            </button>
            <button 
              className={`btn ${role === 'student' ? 'btn-info text-white' : 'btn-outline-info'}`}
              onClick={() => setRole('student')}
            >
              Student View
            </button>
          </div>
        </div>
      </nav>

      <main className="container pb-5">
        {role === 'teacher' ? (
          <TeacherDashboard />
        ) : (
          <StudentPortal />
        )}
      </main>

      <footer className="footer mt-auto py-3 bg-white border-top text-center fixed-bottom">
        <div className="container">
          <span className="text-muted small">© 2026 E-Test System. Prepared for Backend Integration.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
