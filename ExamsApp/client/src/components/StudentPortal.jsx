import { useState, useEffect, useCallback } from 'react';
import { examService } from '../api/examService';
import { userService } from '../api/userService';
import { loggerService } from '../services/loggerService';
import { notifyService } from '../services/notifyService';

/**
 * פורטל סטודנט - כולל ביצוע מבחנים והצגת היסטוריה
 * Student Portal - Includes exam execution and history display
 */
const StudentPortal = () => {
  const [examId, setExamId] = useState('');
  const [activeExam, setActiveExam] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'exam'

  const user = userService.getLoggedinUser();

  // טעינת היסטוריית תוצאות - מוגדר כ-callback למניעת רינדורים מיותרים
  const loadResults = useCallback(async () => {
    try {
      const data = await examService.getResultsByStudent(user.id);
      setResults(data);
    } catch (err) {
      loggerService.error("Failed to load results", err);
    }
  }, [user.id]);

  // טעינת היסטוריית תוצאות בטעינת הרכיב
  useEffect(() => {
    const fetchInitialData = async () => {
      await loadResults();
    };
    fetchInitialData();
  }, [loadResults]);

  // תחילת מבחן - טעינת שאלות
  const handleStartExam = async () => {
    if (!examId) {
      notifyService.error("Please enter an Exam ID");
      return;
    }
    
    setLoading(true);
    try {
      const data = await examService.getExamById(examId);
      setActiveExam(data);
      setUserAnswers({});
      setView('exam');
      notifyService.success(`Exam "${data.title}" loaded. Good luck!`);
    } catch {
      notifyService.error("Exam not found or error loading");
    } finally {
      setLoading(false);
    }
  };

  // עדכון תשובה שנבחרה
  const handleAnswerSelect = (questionId, optionIdx) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  // הגשת המבחן וחישוב ציון
  const handleSubmitExam = async () => {
    // וידוא שכל השאלות נענו
    const answeredCount = Object.keys(userAnswers).length;
    if (answeredCount < activeExam.questions.length) {
      if (!window.confirm("You haven't answered all questions. Submit anyway?")) return;
    }

    let correctCount = 0;
    activeExam.questions.forEach(q => {
      if (userAnswers[q.id] === q.answer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / activeExam.questions.length) * 100);

    const result = {
      studentId: user.id,
      studentName: user.fullName,
      examId: activeExam.id,
      examTitle: activeExam.title,
      score,
      totalQuestions: activeExam.questions.length,
      correctAnswers: correctCount
    };

    try {
      await examService.saveResult(result);
      notifyService.success(`Exam submitted! Your score: ${score}`);
      setActiveExam(null);
      setView('dashboard');
      loadResults();
    } catch {
      notifyService.error("Failed to save exam result");
    }
  };

  // תצוגת דאשבורד (חיפוש מבחן והיסטוריה)
  if (view === 'dashboard') {
    return (
      <div className="fade-in">
        <div className="row g-4 mb-4">
          {/* Welcome Card */}
          <div className="col-12">
            <div className="card bg-gradient-primary text-white p-4">
              <div className="card-body d-flex align-items-center justify-content-between">
                <div>
                  <h2 className="fw-bold mb-1">Good Morning, {user.fullName}! 🎓</h2>
                  <p className="mb-0 opacity-75">Ready for your next challenge? Enter an exam ID below.</p>
                </div>
                <div className="display-1 opacity-25 d-none d-md-block">📚</div>
              </div>
            </div>
          </div>

          {/* Exam Search */}
          <div className="col-lg-6">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body p-4 text-center text-lg-start">
                <div className="d-flex align-items-center mb-3 justify-content-center justify-content-lg-start">
                  <span className="fs-3 me-2">📝</span>
                  <h4 className="card-title fw-bold mb-0">Start New Exam</h4>
                </div>
                <p className="text-muted mb-4">Enter the code provided by your instructor.</p>
                
                <div className="input-group mb-3 shadow-sm rounded-3 overflow-hidden">
                  <input
                    type="text"
                    className="form-control border-0 bg-light"
                    placeholder="Exam Code (e.g., 101)"
                    value={examId}
                    onChange={(e) => setExamId(e.target.value)}
                  />
                  <button
                    className="btn btn-primary px-4 fw-bold"
                    type="button"
                    onClick={handleStartExam}
                    disabled={loading}
                  >
                    {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Begin Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results History */}
          <div className="col-lg-6">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex align-items-center mb-3">
                  <span className="fs-3 me-2">📊</span>
                  <h4 className="card-title fw-bold mb-0">Results History</h4>
                </div>
                {results.length === 0 ? (
                  <p className="text-muted">No exams taken yet.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Exam</th>
                          <th className="text-center">Score</th>
                          <th className="text-center">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map(res => (
                          <tr key={res.id}>
                            <td className="fw-semibold small">{res.examTitle}</td>
                            <td className="text-center">
                              <span className={`badge score-badge ${res.score >= 60 ? 'bg-success' : 'bg-danger'}`} style={{fontSize: '0.9rem'}}>
                                {res.score}%
                              </span>
                            </td>
                            <td className="text-center small text-muted">
                              {res.date.split(',')[0]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // תצוגת מבחן פעיל
  return (
    <div className="fade-in container pb-5">
      <div className="card border-0 shadow-lg mb-4">
        <div className="card-header bg-gradient-primary text-white p-4 border-0">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="mb-0 fw-bold">{activeExam.title}</h3>
            <button className="btn btn-outline-light btn-sm" onClick={() => setView('dashboard')}>
              Quit Exam
            </button>
          </div>
        </div>
        <div className="card-body p-4">
          {activeExam.questions.map((q, qIdx) => (
            <div key={q.id} className="mb-5 p-4 border rounded-4 bg-white shadow-sm">
              <h5 className="fw-bold mb-4">
                <span className="text-primary me-2">Question {qIdx + 1}:</span>
                {q.text}
              </h5>
              <div className="list-group">
                {q.options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    className={`list-group-item list-group-item-action p-3 mb-2 rounded-3 border ${
                      userAnswers[q.id] === optIdx ? 'active border-primary' : 'bg-light'
                    }`}
                    onClick={() => handleAnswerSelect(q.id, optIdx)}
                  >
                    <div className="d-flex align-items-center">
                      <div className={`me-3 rounded-circle border d-flex align-items-center justify-content-center ${
                        userAnswers[q.id] === optIdx ? 'bg-white text-primary' : 'bg-white'
                      }`} style={{width: '24px', height: '24px', fontSize: '0.8rem'}}>
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      {opt}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
          
          <div className="text-center mt-5">
            <button className="btn btn-success btn-lg px-5 py-3 shadow fw-bold rounded-pill" onClick={handleSubmitExam}>
              Submit Exam 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;
