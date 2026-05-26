import { useState } from 'react'
import './App.css'
import TeacherDashboard from './components/TeacherDashboard'
import StudentPortal from './components/StudentPortal'
import NavigationMenu from './components/NavigationMenu'
import { userService } from './api/userService'
import { notifyService } from './services/notifyService'
import { loggerService } from './services/loggerService'

/**
 * הרכיב הראשי של המערכת
 * Main App component
 */
function App() {
  const [user, setUser] = useState(() => {
    const loggedInUser = userService.getLoggedinUser()
    if (loggedInUser) {
      loggerService.info("User session restored", loggedInUser)
    }
    return loggedInUser
  })
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // פרטי טופס
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [fullName, setFullName] = useState('')

  // טיפול בהתחברות או הרשמה
  const handleAuth = async (e) => {
    e.preventDefault()

    if (!email || !password || (isRegisterMode && !fullName)) {
      notifyService.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      let loggedUser;
      if (isRegisterMode) {
        loggedUser = await userService.register({ email, password, role, fullName })
        notifyService.success('Registered successfully!')
      } else {
        loggedUser = await userService.login(email, password)
        notifyService.success(`Welcome, ${loggedUser.fullName}`)
      }
      setUser(loggedUser)
    } catch (err) {
      notifyService.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // התנתקות מהמערכת
  const handleLogout = () => {
    userService.logout()
    setUser(null)
    notifyService.info('Logged out successfully')
  }

  // החלפת תצוגה (למטרות פיתוח/הדגמה)
  const handleToggleRole = (newRole) => {
    setUser({ ...user, role: newRole })
  }

  // אם המשתמש עדיין לא התחבר - מציגים טופס התחברות/הרשמה מעוצב באנגלית
  if (!user) {
    return (
      <div className="auth-container fade-in">
        <div className="card shadow-lg p-4 mx-auto border-0" style={{ maxWidth: '450px', borderRadius: '20px' }}>
          <div className="text-center mb-4">
            <div className="display-4 mb-2">🔐</div>
            <h2 className="fw-bold text-primary">
              {isRegisterMode ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-muted">Digital Examination System</p>
          </div>

          <form onSubmit={handleAuth}>
            {isRegisterMode && (
              <div className="mb-3">
                <label className="form-label fw-semibold">Full Name</label>
                <input
                  className="form-control shadow-sm"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="mb-3">
              <label className="form-label fw-semibold">Email Address</label>
              <input
                className="form-control shadow-sm"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Password</label>
              <input
                className="form-control shadow-sm"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {isRegisterMode && (
              <div className="mb-4">
                <label className="form-label fw-semibold">I am a:</label>
                <select
                  className="form-select shadow-sm"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="student">Student 🎓</option>
                  <option value="teacher">Teacher 👩‍🏫</option>
                </select>
              </div>
            )}

            <button className="btn btn-primary w-100 py-3 shadow-sm fw-bold mb-3" disabled={loading}>
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (isRegisterMode ? 'Register Now' : 'Login')}
            </button>
          </form>

          <div className="text-center">
            <button
              className="btn btn-link text-decoration-none fw-semibold"
              onClick={() => setIsRegisterMode(!isRegisterMode)}
            >
              {isRegisterMode
                ? 'Already have an account? Login here'
                : "New user? Create an account"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100 bg-light">
      <NavigationMenu 
        user={user} 
        onLogout={handleLogout} 
        onToggleRole={handleToggleRole} 
      />

      <main className="container py-4 fade-in">
        {user.role === 'teacher' ? <TeacherDashboard /> : <StudentPortal />}
      </main>
      
      <footer className="py-4 text-center text-muted border-top bg-white mt-auto">
        <p className="mb-0">© 2026 E-Test System | Advanced Examination Platform</p>
      </footer>
    </div>
  )
}

export default App
