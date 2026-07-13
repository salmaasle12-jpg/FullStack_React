import { useState } from 'react'
import './App.css'
import TeacherDashboard from './components/TeacherDashboard'
import StudentPortal from './components/StudentPortal'
import NavigationMenu from './components/NavigationMenu'
import { userService } from './api/userService'
import { notifyService } from './services/notifyService'
import { loggerService } from './services/loggerService'

/**
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
  
  // Form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Handle Login or Registration
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

  // Logout from system
  const handleLogout = () => {
    userService.logout()
    setUser(null)
    notifyService.info('Logged out successfully')
  }

  // If user is not logged in - show login/registration form
  if (!user) {
    return (
      <div className="auth-container d-flex align-items-center justify-content-center min-vh-100 bg-light position-relative overflow-hidden p-3">
        {/* Decorative Background Blobs */}
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ pointerEvents: 'none', zIndex: 0 }}>
          <div className="position-absolute" style={{ top: '-10%', left: '-5%', width: '40%', height: '50%', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>
          <div className="position-absolute" style={{ bottom: '-10%', right: '-5%', width: '45%', height: '55%', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>
        </div>

        <div className="card shadow-premium p-4 p-md-5 w-100 border-0 fade-in position-relative z-index-2" style={{ maxWidth: '460px', borderRadius: '32px', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
          {/* Security Branding */}
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center justify-content-center mb-4 bg-primary bg-opacity-10 rounded-circle" style={{ width: '72px', height: '72px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary-indigo)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h1 className="fw-bold text-dark mb-1 h2" style={{ letterSpacing: '-1.5px' }}>
              E-Test <span style={{ color: 'var(--primary-indigo)' }}>System</span>
            </h1>
            <p className="text-muted small px-3">Secure access to your exams and dashboard</p>
          </div>

          <form onSubmit={handleAuth} className="mt-2">
            {isRegisterMode && (
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted ms-1">Full Name</label>
                <div className="position-relative">
                  <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted opacity-40">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </span>
                  <input
                    className="form-control ps-5"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label small fw-bold text-muted ms-1">Email Address</label>
              <div className="position-relative">
                <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted opacity-40">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </span>
                <input
                  className="form-control ps-5"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-muted ms-1">Password</label>
              <div className="position-relative">
                <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted opacity-40">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input
                  className="form-control ps-5 pe-5"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="btn border-0 position-absolute top-50 end-0 translate-middle-y me-2 p-2 shadow-none text-muted"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ opacity: 0.6 }}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            {isRegisterMode && (
              <div className="mb-4">
                <label className="form-label small fw-bold text-muted ms-1">Account Role</label>
                <div className="position-relative">
                  <span className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted opacity-40">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </span>
                  <select
                    className="form-select ps-5"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="student">Student Portal</option>
                    <option value="teacher">Teacher Dashboard</option>
                  </select>
                </div>
              </div>
            )}

            <button className="btn btn-premium w-100 py-3 mt-2 shadow-lg d-flex align-items-center justify-content-center gap-2" disabled={loading}>
              {loading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                <>
                  <span>{isRegisterMode ? 'Create Account' : 'Sign In'}</span>
                  {!isRegisterMode && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>}
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-4 pt-2 border-top">
            <button
              className="btn btn-link text-decoration-none small fw-bold p-0"
              style={{ color: 'var(--primary-indigo)', fontSize: '0.875rem' }}
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setShowPassword(false);
              }}
            >
              {isRegisterMode
                ? 'Already have an account? Sign In'
                : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100 d-flex flex-column">
      <NavigationMenu 
        user={user} 
        onLogout={handleLogout} 
      />

      <main className="container py-5 fade-in flex-grow-1">
        {user.role === 'teacher' ? <TeacherDashboard /> : <StudentPortal />}
      </main>
      
      <footer className="py-4 text-center text-muted border-top bg-white mt-auto">
        <div className="container">
          <p className="mb-0 small fw-medium">E-Test System © 2026 | Academic Excellence Platform</p>
        </div>
      </footer>
    </div>
  )
}

export default App
