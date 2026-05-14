import { useState } from 'react'
import './App.css'
import TeacherDashboard from './Components/TeacherDashboard'
import StudentPortal from './Components/StudentPortal'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [role, setRole] = useState('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // טיפול בלחיצה על כפתור התחברות
  const handleLogin = (e) => {
    e.preventDefault()
    setIsLoggedIn(true)
  }

  // אם המשתמש עדיין לא התחבר - מציגים טופס התחברות
  if (!isLoggedIn) {
    return (
      <div className="container mt-5">
        <div className="card shadow p-4 mx-auto" style={{ maxWidth: '400px' }}>
          <h2 className="text-center mb-4">Login</h2>

          <form onSubmit={handleLogin}>
            <input className="form-control mb-3" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="form-control mb-3" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="btn btn-primary w-100">Login</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center bg-dark text-white p-3 rounded">
        <h1>E-Test System</h1>

        <div>
          <button className="btn btn-outline-light me-2" onClick={() => setRole('teacher')}>
            Teacher View
          </button>
          <button className="btn btn-info me-2" onClick={() => setRole('student')}>
            Student View
          </button>
          <button className="btn btn-danger" onClick={() => setIsLoggedIn(false)}>
            Logout
          </button>
        </div>
      </div>

      {role === 'teacher' ? <TeacherDashboard /> : <StudentPortal />}
    </div>
  )
}

export default App