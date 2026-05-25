import { useState, useEffect } from 'react'
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
  const [user, setUser] = useState(null)
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // פרטי טופס
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [fullName, setFullName] = useState('')

  // בדיקה אם יש משתמש מחובר בטעינה ראשונית
  useEffect(() => {
    const loggedInUser = userService.getLoggedinUser()
    if (loggedInUser) {
      setUser(loggedInUser)
      loggerService.info("User session restored", loggedInUser)
    }
  }, [])

  // טיפול בהתחברות או הרשמה
  const handleAuth = async (e) => {
    e.preventDefault()

    if (!email || !password || (isRegisterMode && !fullName)) {
      notifyService.error('אנא מלא את כל השדות')
      return
    }

    setLoading(true)
    try {
      let loggedUser;
      if (isRegisterMode) {
        loggedUser = await userService.register({ email, password, role, fullName })
        notifyService.success('נרשמת בהצלחה!')
      } else {
        loggedUser = await userService.login(email, password)
        notifyService.success(`ברוך הבא, ${loggedUser.fullName}`)
      }
      setUser(loggedUser)
    } catch (err) {
      notifyService.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // התנתקות
  const handleLogout = () => {
    userService.logout()
    setUser(null)
    notifyService.info('התנתקת מהמערכת')
  }

  // החלפת תצוגה (למטרות פיתוח/הדגמה)
  const handleToggleRole = (newRole) => {
    setUser({ ...user, role: newRole })
  }

  // אם המשתמש עדיין לא התחבר - מציגים טופס התחברות/הרשמה
  if (!user) {
    return (
      <div className="container mt-5">
        <div className="card shadow p-4 mx-auto" style={{ maxWidth: '430px' }}>
          <h2 className="text-center mb-4">
            {isRegisterMode ? 'Register' : 'Login'}
          </h2>

          <form onSubmit={handleAuth}>
            {isRegisterMode && (
              <input
                className="form-control mb-3"
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            )}

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

            {isRegisterMode && (
              <select
                className="form-select mb-3"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            )}

            <button className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Processing...' : (isRegisterMode ? 'Register' : 'Login')}
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
      <NavigationMenu 
        user={user} 
        onLogout={handleLogout} 
        onToggleRole={handleToggleRole} 
      />

      <main>
        {user.role === 'teacher' ? <TeacherDashboard /> : <StudentPortal />}
      </main>
      
      <footer className="mt-5 text-center text-muted">
        <p>&copy; 2026 E-Test System - Modular React Demo</p>
      </footer>
    </div>
  )
}

export default App
