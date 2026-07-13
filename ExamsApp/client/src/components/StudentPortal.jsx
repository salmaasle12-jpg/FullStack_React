import { useState, useEffect, useCallback, useRef } from 'react';
import { examService } from '../api/examService';
import { userService } from '../api/userService';
import { loggerService } from '../services/loggerService';
import { notifyService } from '../services/notifyService';

/**
 * Static 3D-Style Educational Illustration for Student Hero
 */
const StudentHeroIllustration = () => {
  return (
    <div style={{ maxWidth: '280px', width: '100%' }} className="d-flex align-items-center justify-content-end ms-auto">
      <svg width="100%" height="auto" viewBox="0 0 280 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <filter id="iconShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Stacked Books */}
        <g transform="translate(40, 80)" filter="url(#iconShadow)">
          <rect x="0" y="30" width="100" height="20" rx="4" fill="#FBBF24" />
          <rect x="5" y="30" width="90" height="5" rx="1" fill="#D97706" />
          
          <rect x="10" y="10" width="90" height="20" rx="4" fill="#34D399" />
          <rect x="15" y="10" width="80" height="5" rx="1" fill="#059669" />
        </g>

        {/* Graduation Cap */}
        <g transform="translate(100, 30)" filter="url(#iconShadow)">
          <path d="M70 0L0 30L70 60L140 30L70 0Z" fill="#1F2937" />
          <path d="M25 38V60C25 60 25 72 70 72C115 72 115 60 115 60V38L70 56L25 38Z" fill="#111827" />
          <path d="M140 30V65" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
          <circle cx="140" cy="65" r="6" fill="#FBBF24" />
          <circle cx="70" cy="30" r="4" fill="#374151" />
        </g>

        {/* Open Book in front */}
        <g transform="translate(140, 90)" filter="url(#iconShadow)">
          <path d="M0 10C0 10 30 0 55 10V60C30 50 0 60 0 60V10Z" fill="#F8FAFC" />
          <path d="M110 10C110 10 80 0 55 10V60C80 50 110 60 110 60V10Z" fill="#FFFFFF" />
          <path d="M55 10V60" stroke="#E2E8F0" strokeWidth="1.5" />
          <path d="M10 20H45M10 30H45M10 40H30M65 20H100M65 30H100M65 40H80" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          <path d="M0 10L55 0L110 10V14L55 4L0 14V10Z" fill="url(#bookGrad)" />
        </g>

        {/* Decorative elements */}
        <circle cx="20" cy="150" r="3" fill="white" opacity="0.4" />
        <circle cx="250" cy="20" r="4" fill="white" opacity="0.3" />
        <path d="M260 140L262 144L266 145L262 146L260 150L258 146L254 145L258 144L260 140Z" fill="white" opacity="0.5" />
      </svg>
    </div>
  );
};

/**
 * Student Portal - Includes exam execution and history display
 */
const StudentPortal = () => {
  const [exams, setExams] = useState([]);
  const [activeExam, setActiveExam] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [view, setView] = useState('dashboard'); // 'dashboard', 'exam', or 'review'
  const [currentResult, setCurrentResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const timerRef = useRef(null);
  const user = userService.getLoggedinUser();

  // Load results history and all exams
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [resultsData, examsData] = await Promise.all([
        examService.getResultsByStudent(user.id),
        examService.getAllExams()
      ]);
      setResults(resultsData);
      setExams(examsData);
    } catch (err) {
      loggerService.error("Failed to load data", err);
      notifyService.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Timer logic
  useEffect(() => {
    if (view === 'exam' && timeLeft > 0 && !isSubmitting) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitExam(); // Auto-submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [view, timeLeft, isSubmitting]);

  // Start exam - load questions
  const handleStartExam = async (id) => {
    if (!id) return;
    
    // Check if user already submitted this exam
    const alreadySubmitted = results.some(r => r.examId === id);
    if (alreadySubmitted) {
      notifyService.error("You have already submitted this exam. Each exam can only be taken once.");
      return;
    }

    setLoading(true);
    try {
      const data = await examService.getExamById(id);
      
      // Check status
      if (data.status !== 'active') {
        notifyService.error(`This exam is ${data.status || 'not active'} and cannot be started.`);
        return;
      }

      setActiveExam(data);
      setUserAnswers({});
      setTimeLeft((data.timeLimit || 30) * 60);
      setView('exam');
      setIsSubmitting(false);
      notifyService.success(`Exam "${data.title}" loaded. Good luck!`);
    } catch {
      notifyService.error("Exam not found or error loading");
    } finally {
      setLoading(false);
    }
  };

  // Update selected answer
  const handleAnswerSelect = (questionId, optionIdx) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  // Submit exam and calculate score
  const handleSubmitExam = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    clearInterval(timerRef.current);

    // Ensure all questions are answered (only if manual submit)
    const answeredCount = Object.keys(userAnswers).length;
    if (timeLeft > 0 && answeredCount < activeExam.questions.length) {
      if (!window.confirm("You haven't answered all questions. Submit anyway?")) {
        setIsSubmitting(false);
        return;
      }
    }

    let correctCount = 0;
    activeExam.questions.forEach(q => {
      if (userAnswers[q.id] === q.answer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / activeExam.questions.length) * 100);
    const passingGrade = activeExam.passingGrade || 60;
    const isPassed = score >= passingGrade;

    const result = {
      studentId: user.id,
      studentName: user.fullName,
      examId: activeExam.id,
      examTitle: activeExam.title,
      score,
      totalQuestions: activeExam.questions.length,
      correctAnswers: correctCount,
      passingGrade,
      isPassed,
      userAnswers: { ...userAnswers }
    };

    try {
      const savedResult = await examService.saveResult(result);
      notifyService.success(`Exam submitted! Your score: ${score}% - ${isPassed ? 'Passed' : 'Failed'}`);
      
      setCurrentResult({ ...savedResult, questions: activeExam.questions });
      setActiveExam(null);
      setView('review');
      loadData();
    } catch {
      notifyService.error("Failed to save exam result");
      setIsSubmitting(false);
    }
  };

  // Format time MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const ReviewView = () => (
    <div className="fade-in container pb-5">
      <div className="card border-0 shadow-lg mb-4 overflow-hidden rounded-4">
        <div className={`card-header text-white p-5 text-center ${currentResult.isPassed ? 'bg-success' : 'bg-danger'}`}
             style={{ background: currentResult.isPassed ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)' }}>
          <span className="badge bg-white bg-opacity-25 rounded-pill px-4 py-2 mb-3 fw-bold text-uppercase letter-spacing-1">Performance Review</span>
          <h2 className="display-5 fw-bold mb-1">{currentResult.examTitle}</h2>
          <div className="display-1 fw-bold my-3" style={{ textShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>{currentResult.score}%</div>
          <h3 className="mb-0 fw-bold letter-spacing-1">{currentResult.isPassed ? 'PROVISIONALLY PASSED ✅' : 'RETAKE RECOMMENDED ❌'}</h3>
          <p className="mb-0 opacity-75 mt-3 fw-medium">Minimum Passing Requirement: {currentResult.passingGrade}%</p>
        </div>
        <div className="card-body p-4 p-md-5 bg-white">
          <div className="d-flex justify-content-between align-items-center mb-5 border-bottom pb-3">
            <h4 className="fw-bold mb-0 text-dark">Detailed Question Analysis</h4>
            <div className="text-muted small fw-bold">{currentResult.correctAnswers} / {currentResult.totalQuestions} Correct</div>
          </div>

          {currentResult.questions.map((q, idx) => {
            const studentAns = currentResult.userAnswers[q.id];
            const isCorrect = studentAns === q.answer;
            return (
              <div key={q.id} className={`mb-5 p-4 p-md-5 border rounded-4 shadow-sm transition-all ${isCorrect ? 'border-success' : 'border-danger'}`}
                   style={{ backgroundColor: isCorrect ? '#F0FDF4' : '#FEF2F2', borderLeftWidth: '8px !important' }}>
                <h5 className="fw-bold mb-4 d-flex align-items-start">
                  <span className="me-3 opacity-50">{idx + 1}.</span>
                  <span className="flex-grow-1 text-dark">{q.text}</span>
                  {isCorrect ? 
                    <span className="ms-3 badge bg-success rounded-pill px-3 py-2 small">CORRECT</span> : 
                    <span className="ms-3 badge bg-danger rounded-pill px-3 py-2 small">INCORRECT</span>
                  }
                </h5>
                <div className="row g-4 mt-2">
                  <div className="col-md-6">
                    <div className="dashboard-card p-4 h-100">
                      <small className="text-muted fw-bold d-block mb-2 text-uppercase letter-spacing-1" style={{ fontSize: '0.65rem' }}>Your Response</small>
                      <span className={`fw-bold fs-5 ${isCorrect ? 'text-success' : 'text-danger'}`}>
                        {studentAns !== undefined ? q.options[studentAns] : 'No Response Recorded'}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="dashboard-card p-4 h-100 border border-success border-dashed">
                      <small className="text-muted fw-bold d-block mb-2 text-uppercase letter-spacing-1" style={{ fontSize: '0.65rem' }}>Accredited Answer</small>
                      <span className="text-success fw-bold fs-5">{q.options[q.answer]}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="text-center mt-5">
            <button className="btn btn-primary btn-lg px-5 py-3 rounded-pill shadow-lg fw-bold" 
                    onClick={() => setView('dashboard')}
                    style={{ backgroundColor: 'var(--primary-blue)', minWidth: '250px' }}>
              Return to Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ExamCard = ({ exam, status }) => {
    const result = results.find(r => r.examId === exam.id);
    const isCompleted = !!result;
    
    // Status configuration with premium color palette
    const statusConfig = isCompleted 
      ? { label: 'Completed', color: 'white', bg: '#059669', dot: '#34D399', headerBg: '#F0FDF4' }
      : status === 'upcoming' 
        ? { label: 'Upcoming', color: 'white', bg: '#7C3AED', dot: '#A78BFA', headerBg: '#F5F3FF' }
        : { label: 'Available', color: 'white', bg: '#15803D', dot: '#4ADE80', headerBg: '#F0FDF4' };

    return (
      <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white transition-all"
           style={{ 
             cursor: 'default',
             transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)'
           }}
           onMouseEnter={(e) => {
             e.currentTarget.style.transform = 'translateY(-12px)';
             e.currentTarget.style.boxShadow = '0 30px 60px -12px rgba(0, 0, 0, 0.18)';
           }}
           onMouseLeave={(e) => {
             e.currentTarget.style.transform = 'translateY(0)';
             e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
           }}>
        
        {/* Modern Card Header */}
        <div className="card-header border-0 py-3 px-4 d-flex justify-content-between align-items-center" 
             style={{ background: `linear-gradient(to right, ${statusConfig.headerBg}, white)` }}>
          <span className="badge rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2"
                style={{ 
                  backgroundColor: statusConfig.bg, 
                  color: statusConfig.color,
                  fontSize: '0.7rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusConfig.dot }}></span>
            {statusConfig.label}
          </span>
          <span className="text-muted small fw-bold opacity-50">ID: {exam.id}</span>
        </div>

        <div className="card-body p-4 d-flex flex-column">
          <h5 className="card-title fw-bold mb-4 text-dark fs-5" style={{ lineHeight: '1.4' }}>{exam.title}</h5>
          
          {/* Information Grid */}
          <div className="row g-4 mb-4 mt-auto">
            <div className="col-6">
              <div className="d-flex align-items-center">
                <div className="me-3 p-1 bg-light rounded-3 d-flex align-items-center justify-content-center text-primary" style={{ width: '36px', height: '36px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <div className="small fw-bold text-dark">{exam.timeLimit} min</div>
                  <div className="text-muted" style={{ fontSize: '0.65rem' }}>Time limit</div>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="d-flex align-items-center">
                <div className="me-3 p-1 bg-light rounded-3 d-flex align-items-center justify-content-center text-primary" style={{ width: '36px', height: '36px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div>
                  <div className="small fw-bold text-dark">{exam.passingGrade}%</div>
                  <div className="text-muted" style={{ fontSize: '0.65rem' }}>Pass grade</div>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="d-flex align-items-center">
                <div className="me-3 p-1 bg-light rounded-3 d-flex align-items-center justify-content-center text-primary" style={{ width: '36px', height: '36px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
                </div>
                <div>
                  <div className="small fw-bold text-dark">{exam.questions?.length || 0}</div>
                  <div className="text-muted" style={{ fontSize: '0.65rem' }}>Questions</div>
                </div>
              </div>
            </div>
            {isCompleted && (
              <div className="col-6">
                <div className="d-flex align-items-center">
                  <div className={`me-3 p-1 rounded-3 d-flex align-items-center justify-content-center ${result.isPassed ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`} style={{ width: '36px', height: '36px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                  </div>
                  <div>
                    <div className={`small fw-bold ${result.isPassed ? 'text-success' : 'text-danger'}`}>{result.score}%</div>
                    <div className="text-muted" style={{ fontSize: '0.65rem' }}>Your score</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Button - High Visual Impact */}
          <div className="mt-auto pt-2">
            {isCompleted ? (
              <div className="p-3 bg-light rounded-pill text-center d-flex align-items-center justify-content-center gap-2 border">
                <span className="text-success fw-bold small">Submission recorded</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
            ) : status === 'upcoming' ? (
              <div className="p-3 bg-light rounded-pill text-center d-flex align-items-center justify-content-center gap-2 opacity-75">
                <span className="text-muted fw-bold small">Assessment locked</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
            ) : (
              <button 
                className="btn w-100 rounded-pill fw-bold py-3 shadow-lg d-flex align-items-center justify-content-center gap-2 border-0 text-white transition-all"
                onClick={() => handleStartExam(exam.id)}
                disabled={loading}
                style={{ 
                  background: 'linear-gradient(135deg, #4F46E5 0%, #9333EA 100%)',
                  fontSize: '1.1rem',
                  letterSpacing: '0.3px'
                }}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  <>🚀 Start Exam</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ExamSection = ({ title, icon, examsList, status, emptyMsg }) => (
    <div className="mb-5">
      <div className="d-flex align-items-center mb-4 pb-2 border-bottom">
        <span className="fs-4 me-3">{icon}</span>
        <h4 className="fw-bold mb-0 text-dark" style={{ letterSpacing: '-0.3px' }}>{title}</h4>
        <span className="badge rounded-pill ms-3 bg-light text-muted border fw-bold" style={{ fontSize: '0.75rem' }}>{examsList.length}</span>
      </div>
      
      {examsList.length === 0 ? (
        <div className="card border-0 bg-white rounded-4 text-center p-5 shadow-sm">
          <div className="opacity-25 display-1 mb-3">📭</div>
          <h5 className="text-dark fw-bold mb-1">Nothing here yet</h5>
          <p className="text-muted mb-0">{emptyMsg}</p>
        </div>
      ) : (
        <div className="row g-4">
          {examsList.map(exam => (
            <div key={exam.id} className="col-md-6 col-lg-4">
              <ExamCard exam={exam} status={status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Dashboard view (categorized exams)
  if (view === 'dashboard') {
    const completedExamIds = results.map(r => r.examId);
    const availableExams = exams.filter(e => (e.status || 'draft') === 'active' && !completedExamIds.includes(e.id));
    const completedExams = exams.filter(e => completedExamIds.includes(e.id));
    const upcomingExams = exams.filter(e => (e.status || 'draft') !== 'active' && !completedExamIds.includes(e.id));

    return (
      <div className="fade-in pb-5">
        {/* Premium Hero Banner - E-Test System */}
        <div className="hero-card mb-4 p-4 p-md-5 text-white position-relative overflow-hidden" 
             style={{ borderRadius: '32px', background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)', boxShadow: '0 20px 40px -10px rgba(99, 102, 241, 0.3)' }}>
          
          <div className="row align-items-center position-relative z-index-2">
            <div className="col-sm-7 col-md-8 col-lg-7">
              <h1 className="display-4 fw-bold mb-3" style={{ letterSpacing: '-1.5px', textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>Welcome back!</h1>
              <p className="fs-5 opacity-90 mb-0 fw-light" style={{ maxWidth: '500px', lineHeight: '1.6' }}>
                Your exams, progress, and achievements await you. Let's reach your goals today.
              </p>
            </div>
            
            <div className="col-sm-5 col-md-4 col-lg-5 d-flex justify-content-end align-items-center">
              <StudentHeroIllustration />
            </div>
          </div>
          
          {/* Subtle Decorative Shapes */}
          <div className="position-absolute" style={{ top: '-10%', right: '5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', borderRadius: '50%' }}></div>
          <div className="position-absolute" style={{ bottom: '-20%', left: '15%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)', borderRadius: '50%' }}></div>
        </div>

        {/* Statistics Cards Row */}
        <div className="row g-4 mb-5">
          {[
            { label: 'Completed Exams', value: completedExams.length, icon: '🏆', color: '#10B981', desc: 'Exams you have finished' },
            { label: 'Available Exams', value: availableExams.length, icon: '📝', color: '#F59E0B', desc: 'Exams ready to take' },
            { label: 'Upcoming Exams', value: upcomingExams.length, icon: '⏳', color: '#8B5CF6', desc: 'Scheduled assessments' }
          ].map((stat, index) => (
            <div key={index} className="col-md-4">
              <div className="dashboard-card p-4 border-0 shadow-sm h-100 bg-white" style={{ borderRadius: '24px' }}>
                <div className="d-flex align-items-center mb-3">
                  <div className="fs-1 me-3" style={{ filter: `drop-shadow(0 4px 6px ${stat.color}40)` }}>{stat.icon}</div>
                  <div>
                    <h6 className="text-muted small mb-0 fw-bold text-uppercase" style={{ letterSpacing: '0.05em' }}>{stat.label}</h6>
                    <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>{stat.desc}</p>
                  </div>
                </div>
                <h2 className="display-5 fw-bold mb-0" style={{ color: stat.color }}>{stat.value}</h2>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4">
          <div className="col-lg-12">
            <ExamSection 
              title="Active Assessments" 
              icon="📝" 
              examsList={availableExams} 
              status="available"
              emptyMsg="There are no active assessments assigned to you at this time."
            />

            <ExamSection 
              title="History & Records" 
              icon="🏛️" 
              examsList={completedExams} 
              status="completed"
              emptyMsg="Your examination history will appear here once you complete an assessment."
            />

            <ExamSection 
              title="Scheduled Content" 
              icon="⏳" 
              examsList={upcomingExams} 
              status="upcoming"
              emptyMsg="No future assessments have been scheduled yet."
            />
          </div>
        </div>
      </div>
    );
  }

  if (view === 'review' && currentResult) {
    return <ReviewView />;
  }

  // Active exam view
  return (
    <div className="fade-in container pb-5">
      <div className="card border-0 shadow-lg mb-4 overflow-hidden rounded-4">
        <div className="card-header text-white p-4 border-0 sticky-top hero-card"
             style={{ borderRadius: '0' }}>
          <div className="d-flex justify-content-between align-items-center position-relative z-index-2">
            <div>
              <h3 className="mb-0 fw-bold">{activeExam.title}</h3>
              <div className="badge bg-white bg-opacity-25 rounded-pill px-3 py-1 mt-1 small">
                {activeExam.questions.length} Examination Items
              </div>
            </div>
            <div className={`px-4 py-2 rounded-pill fw-bold fs-3 shadow-sm ${timeLeft < 60 ? 'bg-danger text-white' : 'bg-white text-dark'}`}
                 style={{ color: timeLeft >= 60 ? 'var(--primary-blue)' : undefined }}>
              ⏱️ {formatTime(timeLeft)}
            </div>
            <button className="btn btn-outline-light btn-sm rounded-pill px-3 fw-bold" onClick={() => setView('dashboard')}>
              Quit Session
            </button>
          </div>
          {timeLeft < 60 && (
            <div className="text-center mt-2 small fw-bold text-white opacity-75 position-relative z-index-2">
              ⚠️ URGENT: Less than 60 seconds remaining!
            </div>
          )}
        </div>
        <div className="card-body p-4 p-md-5 bg-white">
          {activeExam.questions.map((q, qIdx) => (
            <div key={q.id} className="mb-5 p-4 p-md-5 border rounded-4 bg-light shadow-sm"
                 style={{ border: '1px solid #E2E8F0' }}>
              <h5 className="fw-bold mb-4 text-dark d-flex align-items-start">
                <span className="me-3 opacity-50">Question {qIdx + 1}</span>
                <span className="flex-grow-1">{q.text}</span>
              </h5>
              <div className="list-group border-0">
                {q.options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    className={`list-group-item list-group-item-action p-4 mb-3 rounded-4 border-0 shadow-sm transition-all ${
                      userAnswers[q.id] === optIdx ? 'text-white' : 'bg-white'
                    }`}
                    style={{ 
                      backgroundColor: userAnswers[q.id] === optIdx ? 'var(--primary-blue)' : '#ffffff',
                      color: userAnswers[q.id] === optIdx ? '#ffffff' : '#1F2937',
                      borderLeft: userAnswers[q.id] === optIdx ? '6px solid var(--accent-orange)' : '6px solid transparent'
                    }}
                    onClick={() => handleAnswerSelect(q.id, optIdx)}
                  >
                    <div className="d-flex align-items-center">
                      <div className={`me-3 rounded-circle border d-flex align-items-center justify-content-center fw-bold ${
                        userAnswers[q.id] === optIdx ? 'bg-white' : 'bg-light text-muted'
                      }`} style={{width: '32px', height: '32px', fontSize: '0.9rem', color: userAnswers[q.id] === optIdx ? 'var(--primary-blue)' : undefined }}>
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span className="fw-medium">{opt}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
          
          <div className="text-center mt-5 pt-4 border-top">
            <button className="btn btn-primary btn-lg px-5 py-3 shadow-lg fw-bold rounded-pill" 
                    onClick={handleSubmitExam} 
                    disabled={isSubmitting}
                    style={{ backgroundColor: 'var(--primary-blue)', minWidth: '300px' }}>
              {isSubmitting ? 'Finalizing Submission...' : 'Finalize Assessment 🚀'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;
