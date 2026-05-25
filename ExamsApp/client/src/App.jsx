import { useState } from 'react'
import './App.css'
import TeacherDashboard from './Components/TeacherDashboard'
import StudentPortal from './Components/StudentPortal'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [role, setRole] = useState('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  // טיפול בהתחברות או הרשמה
  const handleAuth = (e) => {
    e.preventDefault()

    if (!email || !password) {
      setMessage('Please enter email and password')
      return
    }

    setMessage('')
    setIsLoggedIn(true)
  }

  // אם המשתמש עדיין לא התחבר - מציגים טופס התחברות/הרשמה
  if (!isLoggedIn) {
    return (
      <div className="container mt-5">
        <div className="card shadow p-4 mx-auto" style={{ maxWidth: '430px' }}>
          <h2 className="text-center mb-4">
            {isRegisterMode ? 'Register' : 'Login'}
          </h2>

          {message && <div className="alert alert-danger">{message}</div>}

          <form onSubmit={handleAuth}>
            <input
              className="form-control mb-3"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="form-control mb-3"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <select
              className="form-select mb-3"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>

            <button className="btn btn-primary w-100">
              {isRegisterMode ? 'Register' : 'Login'}
            </button>
          </form>

          <button
            className="btn btn-link w-100 mt-3"
            onClick={() => setIsRegisterMode(!isRegisterMode)}
          >
            {isRegisterMode
              ? 'Already have an account? Login'
              : 'New user? Register'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center bg-dark text-white p-3 rounded">
        <h1>E-Test System</h1>

        <div>
          <button
            className="btn btn-outline-light me-2"
            onClick={() => setRole('teacher')}
          >
            Teacher View
          </button>

          <button
            className="btn btn-info me-2"
            onClick={() => setRole('student')}
          >
            Student View
          </button>

          <button
            className="btn btn-danger"
            onClick={() => setIsLoggedIn(false)}
          >
            Logout
          </button>
        </div>
      </div>

      {role === 'teacher' ? <TeacherDashboard /> : <StudentPortal />}
    </div>
  )
}

export default App