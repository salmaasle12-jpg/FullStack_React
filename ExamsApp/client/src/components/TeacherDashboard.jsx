import { useState, useEffect, useCallback } from 'react';
import { examService } from '../api/examService';
import { notifyService } from '../services/notifyService';

/**
 * לוח בקרה למרצה - כולל ניהול ועריכת מבחנים עם ניהול שאלות מלא
 * Teacher Dashboard - Includes full exam and question management
 */
const TeacherDashboard = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [editingExam, setEditingExam] = useState(null); // המבחן שנמצא כרגע בעריכה

  // שליפת המבחנים - מוגדר כ-callback למניעת רינדורים מיותרים
  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      const data = await examService.getAllExams();
      setExams(data);
    } catch {
      notifyService.error("Failed to load exams");
    } finally {
      setLoading(false);
    }
  }, []);

  // שליפת המבחנים בטעינה
  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchExams();
    };
    fetchInitialData();
  }, [fetchExams]);

  // שמירת שינויים במבחן
  const handleSaveExam = async () => {
    try {
      await examService.updateExam(editingExam);
      notifyService.success("Exam updated successfully!");
      setEditingExam(null);
      fetchExams();
    } catch {
      notifyService.error("Failed to save changes");
    }
  };

  // עדכון שדה במבחן הנערך
  const updateEditingExam = (field, value) => {
    setEditingExam(prev => ({ ...prev, [field]: value }));
  };

  // עדכון שאלה ספציפית
  const updateQuestion = (qId, field, value) => {
    const updatedQuestions = editingExam.questions.map(q => 
      q.id === qId ? { ...q, [field]: value } : q
    );
    updateEditingExam('questions', updatedQuestions);
  };

  // הוספת שאלה חדשה
  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now(), // מזהה ייחודי זמני
      text: 'New Question',
      options: ['Option A', 'Option B'],
      answer: 0
    };
    const updatedQuestions = [...editingExam.questions, newQuestion];
    updateEditingExam('questions', updatedQuestions);
    notifyService.info("New question added at the bottom");
  };

  // מחיקת שאלה
  const handleDeleteQuestion = (qId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    const updatedQuestions = editingExam.questions.filter(q => q.id !== qId);
    updateEditingExam('questions', updatedQuestions);
    notifyService.info("Question deleted");
  };

  // הוספת אופציה לשאלה
  const handleAddOption = (qId) => {
    const updatedQuestions = editingExam.questions.map(q => {
      if (q.id === qId) {
        return { ...q, options: [...q.options, `New Option`] };
      }
      return q;
    });
    updateEditingExam('questions', updatedQuestions);
  };

  // הסרת אופציה משאלה
  const handleRemoveOption = (qId, optIdx) => {
    const updatedQuestions = editingExam.questions.map(q => {
      if (q.id === qId) {
        if (q.options.length <= 2) {
          notifyService.error("A question must have at least 2 options");
          return q;
        }
        const newOpts = q.options.filter((_, idx) => idx !== optIdx);
        // אם מחקנו את התשובה הנכונה, נאפס אותה לראשונה
        const newAnswer = q.answer === optIdx ? 0 : (q.answer > optIdx ? q.answer - 1 : q.answer);
        return { ...q, options: newOpts, answer: newAnswer };
      }
      return q;
    });
    updateEditingExam('questions', updatedQuestions);
  };

  const filteredExams = exams.filter((exam) =>
    exam.title.toLowerCase().includes(searchText.toLowerCase()) ||
    exam.id.includes(searchText)
  );

  // תצוגת עריכת מבחן
  if (editingExam) {
    return (
      <div className="fade-in container pb-5">
        <div className="card border-0 shadow-lg">
          <div className="card-header bg-gradient-primary text-white p-4 d-flex justify-content-between align-items-center">
            <h3 className="mb-0 fw-bold">Edit Exam: {editingExam.title}</h3>
            <button className="btn btn-outline-light btn-sm" onClick={() => setEditingExam(null)}>Cancel</button>
          </div>
          <div className="card-body p-4">
            <div className="mb-4">
              <label className="form-label fw-bold">Exam Title</label>
              <input 
                className="form-control form-control-lg shadow-sm"
                value={editingExam.title}
                onChange={(e) => updateEditingExam('title', e.target.value)}
              />
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
              <h4 className="fw-bold mb-0">Questions Management</h4>
              <button className="btn btn-primary btn-sm shadow-sm" onClick={handleAddQuestion}>
                + Add Question 📝
              </button>
            </div>

            {editingExam.questions.map((q, qIdx) => (
              <div key={q.id} className="mb-4 p-4 border rounded-4 bg-light shadow-sm position-relative">
                <button 
                  className="btn btn-outline-danger btn-sm position-absolute top-0 end-0 m-3 rounded-circle"
                  style={{width: '32px', height: '32px', padding: '0'}}
                  onClick={() => handleDeleteQuestion(q.id)}
                  title="Delete Question"
                >
                  ×
                </button>

                <div className="mb-3 me-4">
                  <label className="form-label fw-bold text-primary">Question {qIdx + 1}</label>
                  <textarea 
                    className="form-control border-0 shadow-sm"
                    rows="2"
                    value={q.text}
                    onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                  />
                </div>
                
                <div className="row g-3">
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="col-md-6">
                      <div className="input-group shadow-sm rounded-3 overflow-hidden">
                        <span className="input-group-text bg-white border-0">{String.fromCharCode(65 + optIdx)}</span>
                        <input 
                          className="form-control border-0"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...q.options];
                            newOpts[optIdx] = e.target.value;
                            updateQuestion(q.id, 'options', newOpts);
                          }}
                        />
                        <div className="input-group-text bg-white border-0">
                          <input 
                            className="form-check-input mt-0" 
                            type="radio" 
                            name={`correct-${q.id}`}
                            checked={q.answer === optIdx}
                            onChange={() => updateQuestion(q.id, 'answer', optIdx)}
                            title="Set as Correct Answer"
                          />
                        </div>
                        <button 
                          className="btn btn-outline-danger border-0"
                          onClick={() => handleRemoveOption(q.id, optIdx)}
                          title="Remove Option"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="col-md-6 d-flex align-items-center">
                    <button className="btn btn-link text-decoration-none fw-bold" onClick={() => handleAddOption(q.id)}>
                      + Add Option
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="text-center mt-5">
              <button className="btn btn-success btn-lg px-5 py-3 shadow fw-bold rounded-pill" onClick={handleSaveExam}>
                Save All Changes ✅
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // תצוגה ראשית של הדאשבורד (ללא שינוי מהגרסה הקודמת)
  return (
    <div className="fade-in">
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-white p-3 h-100">
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0 bg-primary bg-opacity-10 p-3 rounded-3 me-3">
                <span className="fs-3 text-primary">📝</span>
              </div>
              <div>
                <h6 className="text-muted mb-0">Total Exams</h6>
                <h3 className="fw-bold mb-0">{exams.length}</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-white p-3 h-100">
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0 bg-success bg-opacity-10 p-3 rounded-3 me-3">
                <span className="fs-3 text-success">📊</span>
              </div>
              <div>
                <h6 className="text-muted mb-0">Active Sessions</h6>
                <h3 className="fw-bold mb-0">12</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-white p-3 h-100">
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0 bg-warning bg-opacity-10 p-3 rounded-3 me-3">
                <span className="fs-3 text-warning">👩‍🏫</span>
              </div>
              <div>
                <h6 className="text-muted mb-0">Total Students</h6>
                <h3 className="fw-bold mb-0">154</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <h4 className="fw-bold mb-0">Exam Management</h4>
            <button 
              className="btn btn-primary shadow-sm px-4"
              onClick={() => notifyService.info("Feature coming soon")}
            >
              + Create New Exam
            </button>
          </div>

          <div className="mb-4 position-relative">
            <span className="position-absolute top-50 start-0 translate-middle-y ps-3 text-muted">🔍</span>
            <input
              type="text"
              className="form-control ps-5 bg-light border-0 shadow-sm py-3"
              placeholder="Search by title or ID..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading data...</p>
            </div>
          ) : (
            <div className="row g-4">
              {filteredExams.length > 0 ? (
                filteredExams.map((exam) => (
                  <div key={exam.id} className="col-lg-4 col-md-6">
                    <div className="card h-100 border-0 shadow-sm hover-shadow">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between mb-3">
                          <span className="badge bg-light text-primary border border-primary-subtle px-3 py-2">
                            ID: {exam.id}
                          </span>
                          <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2">
                            Active
                          </span>
                        </div>
                        <h5 className="card-title fw-bold mb-3">{exam.title}</h5>
                        <p className="card-text text-muted mb-4">
                          <strong>{exam.questions.length}</strong> questions defined for this exam.
                        </p>
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-outline-primary btn-sm flex-grow-1 fw-bold"
                            onClick={() => setEditingExam(exam)}
                          >
                            Edit ⚙️
                          </button>
                          <button className="btn btn-outline-info btn-sm flex-grow-1 fw-bold">
                            Results 📈
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center py-5">
                  <div className="display-1 text-muted opacity-25 mb-3">📁</div>
                  <h5 className="text-muted">No exams found matching your search.</h5>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
