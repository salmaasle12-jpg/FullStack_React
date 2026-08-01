import { useState, useEffect, useCallback } from 'react';
import { examService } from '../api/examService';
import { notifyService } from '../services/notifyService';

/**
 * Static 3D-Style Educational Illustration for the Hero Banner
 */
const HeroIllustration = () => {
  return (
    <div style={{ width: '300px', height: '180px' }} className="d-flex align-items-center justify-content-end">
      <svg width="300" height="180" viewBox="0 0 300 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bookSideGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#4338CA" />
          </linearGradient>
          <linearGradient id="capTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1F2937" />
            <stop offset="100%" stopColor="#111827" />
          </linearGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Stacked Books Background */}
        <g transform="translate(40, 60)" filter="url(#softShadow)">
          {/* Orange Book */}
          <rect x="0" y="40" width="100" height="18" rx="4" fill="#F59E0B" />
          <rect x="5" y="40" width="90" height="4" rx="1" fill="#D97706" />
          
          {/* Green Book */}
          <rect x="10" y="22" width="90" height="18" rx="4" fill="#10B981" />
          <rect x="15" y="22" width="80" height="4" rx="1" fill="#059669" />

          {/* Blue Book */}
          <rect x="20" y="4" width="80" height="18" rx="4" fill="#3B82F6" />
          <rect x="25" y="4" width="70" height="4" rx="1" fill="#2563EB" />
        </g>

        {/* Main Open Book */}
        <g transform="translate(100, 70)" filter="url(#softShadow)">
          <path d="M0 10C0 10 40 0 75 10V80C40 70 0 80 0 80V10Z" fill="#F8FAFC" />
          <path d="M150 10C150 10 110 0 75 10V80C110 70 150 80 150 80V10Z" fill="#FFFFFF" />
          <path d="M75 10V80" stroke="#E2E8F0" strokeWidth="2" />
          <path d="M15 25H60M15 35H60M15 45H40M90 25H135M90 35H135M90 45H110" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
          <path d="M0 10L75 0L150 10V15L75 5L0 15V10Z" fill="url(#bookSideGrad)" />
        </g>

        {/* Graduation Cap */}
        <g transform="translate(140, 15)" filter="url(#softShadow)">
          <path d="M60 0L0 25L60 50L120 25L60 0Z" fill="url(#capTopGrad)" />
          <path d="M22 32V52C22 52 22 62 60 62C98 62 98 52 98 52V32L60 48L22 32Z" fill="#0F172A" />
          <path d="M120 25V55" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
          <circle cx="120" cy="55" r="5" fill="#FBBF24" />
        </g>

        {/* Exam Checklist */}
        <g transform="translate(230, 40) rotate(-5)" filter="url(#softShadow)">
          <rect x="0" y="0" width="60" height="80" rx="8" fill="white" />
          <rect x="10" y="15" width="40" height="5" rx="2.5" fill="#F1F5F9" />
          <circle cx="15" cy="40" r="4" fill="#10B981" />
          <circle cx="15" cy="55" r="4" fill="#10B981" />
          <rect x="25" y="38" width="25" height="4" rx="2" fill="#E2E8F0" />
          <rect x="25" y="53" width="25" height="4" rx="2" fill="#E2E8F0" />
        </g>

        {/* Pencil */}
        <g transform="translate(50, 130) rotate(-45)" filter="url(#softShadow)">
          <rect x="0" y="0" width="8" height="60" rx="2" fill="#FCD34D" />
          <path d="M0 60L4 70L8 60H0Z" fill="#1F2937" />
          <rect x="0" y="-5" width="8" height="8" rx="2" fill="#F472B6" />
        </g>

        {/* Subtle Sparkles */}
        <g fill="#FDE047" opacity="0.6">
          <circle cx="20" cy="50" r="2" />
          <circle cx="280" cy="30" r="2.5" />
          <circle cx="150" cy="160" r="1.5" />
          <path d="M280 140L282 143L285 144L282 145L280 148L278 145L275 144L278 143L280 140Z" />
          <path d="M30 20L32 23L35 24L32 25L30 28L28 25L25 24L28 23L30 20Z" />
        </g>
      </svg>
    </div>
  );
};

/**
 * Teacher Dashboard - Includes exam management, edit mode and results view.
 */
const TeacherDashboard = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingExam, setEditingExam] = useState(null);
  const [view, setView] = useState('dashboard');
  const [resultsData, setResultsData] = useState({ stats: null, submissions: [] });
  const [resultsExam, setResultsExam] = useState(null);

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      const data = await examService.getAllExams();
      setExams(data);
    } catch {
      notifyService.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleShowResults = async (exam) => {
    try {
      setLoading(true);
      const submissions = await examService.getResultsByExam(exam.id);

      if (!submissions || submissions.length === 0) {
        setResultsData({ stats: null, submissions: [] });
      } else {
        const scores = submissions.map((s) => Number(s.score) || 0);
        const passingGrade = exam.passingGrade || 60;

        const stats = {
          total: submissions.length,
          avg: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1),
          high: Math.max(...scores),
          low: Math.min(...scores),
          passRate: (
            (submissions.filter((s) => Number(s.score) >= passingGrade).length / submissions.length) *
            100
          ).toFixed(1)
        };

        setResultsData({ stats, submissions });
      }

      setResultsExam(exam);
      setView('results');
    } catch {
      notifyService.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExam = async () => {
    if (!editingExam.title || !editingExam.title.trim()) {
      notifyService.error('Please enter an exam title');
      return;
    }

    if (!editingExam.questions || editingExam.questions.length === 0) {
      notifyService.error('An exam must have at least one question');
      return;
    }

    for (const q of editingExam.questions) {
      if (!q.text || !q.text.trim()) {
        notifyService.error('All questions must have text');
        return;
      }

      if (!q.options || q.options.length < 2) {
        notifyService.error('Each question must have at least two options');
        return;
      }

      if (q.options.some((opt) => !opt || !opt.trim())) {
        notifyService.error('Question has empty options');
        return;
      }

      if (q.answer === undefined || q.answer === null || q.answer < 0 || q.answer >= q.options.length) {
        notifyService.error('Each question must have a correct answer selected');
        return;
      }
    }

    if (
      editingExam.passingGrade === undefined ||
      editingExam.passingGrade === null ||
      editingExam.passingGrade < 0 ||
      editingExam.passingGrade > 100
    ) {
      notifyService.error('Please enter a valid passing grade (0-100)');
      return;
    }

    try {
      if (editingExam.isNew) {
        const { isNew, ...examData } = editingExam;
        await examService.addExam(examData);
        notifyService.success('Exam created successfully!');
      } else {
        await examService.updateExam(editingExam);
        notifyService.success('Exam updated successfully!');
      }

      setEditingExam(null);
      await fetchExams();
    } catch (err) {
      notifyService.error(err.message || 'Failed to save changes');
    }
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;

    try {
      await examService.deleteExam(id);
      notifyService.success('Exam deleted successfully');
      await fetchExams();
    } catch {
      notifyService.error('Failed to delete exam');
    }
  };

  const handleCreateNewExam = () => {
    setEditingExam({
      title: 'New Exam',
      status: 'draft',
      timeLimit: 30,
      passingGrade: 60,
      questions: [
        {
          id: Date.now(),
          text: 'New Question',
          options: ['Option A', 'Option B'],
          answer: 0
        }
      ],
      isNew: true
    });
  };

  const updateEditingExam = (field, value) => {
    if (field === 'status' && value === 'closed' && editingExam.status !== 'closed') {
      if (!window.confirm('Are you sure you want to close this exam? Students will no longer be able to take it.')) {
        return;
      }
    }

    setEditingExam((prev) => ({ ...prev, [field]: value }));
  };

  const updateQuestion = (qId, field, value) => {
    const updatedQuestions = editingExam.questions.map((q) =>
      q.id === qId ? { ...q, [field]: value } : q
    );

    updateEditingExam('questions', updatedQuestions);
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: 'New Question',
      options: ['Option A', 'Option B'],
      answer: 0
    };

    updateEditingExam('questions', [...editingExam.questions, newQuestion]);
  };

  const handleDeleteQuestion = (qId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    updateEditingExam(
      'questions',
      editingExam.questions.filter((q) => q.id !== qId)
    );
  };

  const handleAddOption = (qId) => {
    const updatedQuestions = editingExam.questions.map((q) => {
      if (q.id === qId) {
        return { ...q, options: [...q.options, 'New Option'] };
      }

      return q;
    });

    updateEditingExam('questions', updatedQuestions);
  };

  const handleRemoveOption = (qId, optIdx) => {
    const updatedQuestions = editingExam.questions.map((q) => {
      if (q.id === qId) {
        if (q.options.length <= 2) {
          notifyService.error('A question must have at least 2 options');
          return q;
        }

        const newOptions = q.options.filter((_, i) => i !== optIdx);
        const newAnswer =
          q.answer === optIdx ? 0 :
          q.answer > optIdx ? q.answer - 1 :
          q.answer;

        return {
          ...q,
          options: newOptions,
          answer: newAnswer
        };
      }

      return q;
    });

    updateEditingExam('questions', updatedQuestions);
  };

  const filteredExams = exams.filter((exam) => {
    const examId = String(exam.id || '');
    const title = String(exam.title || '');
    const matchesSearch =
      title.toLowerCase().includes(searchText.toLowerCase()) ||
      examId.includes(searchText);

    const matchesStatus =
      statusFilter === 'all' || (exam.status || 'draft') === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalExams = exams.length;
  const activeExams = exams.filter((e) => (e.status || 'draft') === 'active').length;
  const draftExams = exams.filter((e) => (e.status || 'draft') === 'draft').length;
  const closedExams = exams.filter((e) => (e.status || 'draft') === 'closed').length;
  const totalStudents = 154; // Mock value as per requirement
  const averageScore = exams.length > 0 ? "84.2%" : "0%"; // Mock value for visual

  const scrollToResults = () => {
    const el = document.getElementById('results-overview');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleQuickManage = () => {
    setView('dashboard');
    setEditingExam(null);
    setStatusFilter('all');
    setSearchText('');
  };

  const handleQuickActive = () => {
    setView('dashboard');
    setEditingExam(null);
    setStatusFilter('active');
  };

  const ResultsView = () => (
    <div className="fade-in pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Results: {resultsExam?.title}</h2>
          <p className="text-muted mb-0">Pass grade: {resultsExam?.passingGrade || 60}%</p>
        </div>
        <button className="btn btn-light border rounded-pill px-4 fw-bold shadow-sm" onClick={() => setView('dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      {resultsData.stats ? (
        <>
          <div className="row g-4 mb-4">
            {[
              { label: 'Submissions', value: resultsData.stats.total, icon: '👥', color: 'blue' },
              { label: 'Average Score', value: `${resultsData.stats.avg}%`, icon: '📊', color: 'green' },
              { label: 'Highest Score', value: `${resultsData.stats.high}%`, icon: '🏆', color: 'orange' },
              { label: 'Lowest Score', value: `${resultsData.stats.low}%`, icon: '📉', color: 'purple' },
              { label: 'Pass Rate', value: `${resultsData.stats.passRate}%`, icon: '✅', color: 'blue' }
            ].map((stat, i) => (
              <div key={i} className="col-md">
                <div className={`dashboard-card stat-card stat-card-${stat.color} text-center`}>
                  <div className={`stat-icon bg-${stat.color}-light mx-auto`}>{stat.icon}</div>
                  <h6 className="text-muted small mb-1 fw-bold">{stat.label}</h6>
                  <h4 className="fw-bold mb-0 text-dark">{stat.value}</h4>
                </div>
              </div>
            ))}
          </div>

          <div className="dashboard-card overflow-hidden">
            <div className="p-4 border-bottom bg-light d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Student Submissions</h5>
              <button className="btn btn-sm btn-outline-primary rounded-pill px-3">Export CSV</button>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th className="px-4">Student Name</th>
                    <th className="text-center">Score</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Correct Answers</th>
                    <th className="text-center">Submission Date</th>
                  </tr>
                </thead>
                <tbody>
                  {resultsData.submissions.map((sub) => (
                    <tr key={sub.id}>
                      <td className="px-4">
                        <div className="d-flex align-items-center gap-2">
                          <div className="profile-avatar" style={{ width: 28, height: 28, fontSize: '0.65rem' }}>
                            {sub.studentName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="fw-semibold">{sub.studentName}</span>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="fw-bold" style={{ color: sub.score >= (resultsExam?.passingGrade || 60) ? 'var(--secondary-green)' : '#EF4444' }}>
                          {sub.score}%
                        </span>
                      </td>
                      <td className="text-center">
                        <span className={`status-chip ${sub.score >= (resultsExam?.passingGrade || 60) ? 'status-active' : 'status-disabled'}`}>
                          {sub.score >= (resultsExam?.passingGrade || 60) ? 'Passed' : 'Failed'}
                        </span>
                      </td>
                      <td className="text-center text-muted">
                        {sub.correctAnswers} / {sub.totalQuestions}
                      </td>
                      <td className="text-center text-muted small">
                        {sub.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="dashboard-card text-center py-5">
          <div className="display-1 text-muted opacity-25 mb-3">📭</div>
          <h5 className="text-muted">No submissions yet for this exam.</h5>
        </div>
      )}
    </div>
  );

  if (editingExam) {
    return (
      <div className="fade-in pb-5">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h2 className="fw-bold mb-1 text-dark">
              {editingExam.isNew ? 'Create New Exam' : 'Edit Exam'}
            </h2>
            <p className="text-muted mb-0">{editingExam.isNew ? 'Setup your new assessment' : `Editing: ${editingExam.title}`}</p>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-light border rounded-pill px-4 fw-bold" onClick={() => setEditingExam(null)}>
              Cancel
            </button>
            <button className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" style={{ backgroundColor: 'var(--primary-blue)' }} onClick={handleSaveExam}>
              Save Exam
            </button>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-4">
            <div className="dashboard-card p-4">
              <h5 className="fw-bold mb-4">Exam Settings</h5>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Exam Title</label>
                <input
                  className="form-control border-light bg-light"
                  value={editingExam.title}
                  onChange={(e) => updateEditingExam('title', e.target.value)}
                  placeholder="e.g., Computer Science Final"
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Status</label>
                <select
                  className="form-select border-light bg-light"
                  value={editingExam.status || 'draft'}
                  onChange={(e) => updateEditingExam('status', e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div className="row">
                <div className="col-6 mb-3">
                  <label className="form-label small fw-bold text-muted">Duration (min)</label>
                  <input
                    type="number"
                    className="form-control border-light bg-light"
                    value={editingExam.timeLimit || 30}
                    onChange={(e) => updateEditingExam('timeLimit', parseInt(e.target.value) || 0)}
                    min="1"
                  />
                </div>

                <div className="col-6 mb-3">
                  <label className="form-label small fw-bold text-muted">Passing %</label>
                  <input
                    type="number"
                    className="form-control border-light bg-light"
                    value={editingExam.passingGrade || 60}
                    onChange={(e) => updateEditingExam('passingGrade', parseInt(e.target.value) || 0)}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Questions ({editingExam.questions.length})</h5>
              <button className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-bold" onClick={handleAddQuestion}>
                + Add Question
              </button>
            </div>

            {editingExam.questions.map((q, qIdx) => (
              <div key={q.id} className="dashboard-card mb-4 p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <span className="badge rounded-pill px-3 py-2 bg-blue-light">
                    Question {qIdx + 1}
                  </span>

                  <button className="btn btn-link text-danger p-0 text-decoration-none small fw-bold" onClick={() => handleDeleteQuestion(q.id)}>
                    Remove
                  </button>
                </div>

                <textarea
                  className="form-control border-0 bg-light rounded-3 mb-4"
                  rows="2"
                  value={q.text}
                  onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                  placeholder="Enter question text..."
                />

                <div className="row g-3">
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="col-md-6">
                      <div className="input-group border border-light rounded-3 overflow-hidden bg-white">
                        <div className="input-group-text bg-white border-0">
                          <input
                            className="form-check-input mt-0"
                            type="radio"
                            name={`q-${q.id}`}
                            checked={q.answer === optIdx}
                            onChange={() => updateQuestion(q.id, 'answer', optIdx)}
                          />
                        </div>

                        <input
                          className="form-control border-0 shadow-none"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...q.options];
                            newOpts[optIdx] = e.target.value;
                            updateQuestion(q.id, 'options', newOpts);
                          }}
                        />

                        <button className="btn btn-link text-muted border-0 text-decoration-none" onClick={() => handleRemoveOption(q.id, optIdx)}>
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="col-12">
                    <button className="btn btn-link text-decoration-none fw-bold p-0 small" onClick={() => handleAddOption(q.id)}>
                      + Add Option
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'results') {
    return <ResultsView />;
  }

  return (
    <div className="fade-in pb-5">
      {/* Modern Hero Card - Canva/LMS Style */}
      <div className="hero-card mb-5 p-4 p-md-5 text-white position-relative overflow-hidden" 
           style={{ borderRadius: '32px', background: 'linear-gradient(135deg, #4F46E5 0%, #9333EA 100%)', boxShadow: '0 15px 35px rgba(79, 70, 229, 0.25)' }}>
        
        <div className="row align-items-center position-relative z-index-2">
          <div className="col-md-7">
            <h1 className="display-4 fw-bold mb-3" style={{ letterSpacing: '-1.5px', textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>Teacher Dashboard</h1>
            <p className="fs-5 opacity-90 mb-0 fw-light" style={{ maxWidth: '550px', lineHeight: '1.6' }}>
              Manage university exams, monitor student performance, and track academic progress in real-time.
            </p>
          </div>
          
          <div className="col-md-5 d-none d-md-flex justify-content-end align-items-center">
            <HeroIllustration />
          </div>
        </div>
      </div>

      {/* Statistics Cards Row */}
      <div className="row g-4 mb-5">
        {[
          { label: 'Total Exams', value: totalExams, icon: '📝', color: 'blue' },
          { label: 'Active Exams', value: activeExams, icon: '⚡', color: 'green' },
          { label: 'Total Students', value: totalStudents, icon: '👥', color: 'orange' },
          { label: 'Average Score', value: averageScore, icon: '📈', color: 'purple' }
        ].map((stat, index) => (
          <div key={index} className="col-md-3">
            <div className="dashboard-card stat-card border-0">
              <div className={`stat-icon d-flex align-items-center justify-content-center bg-${stat.color}-light mb-3`}>
                {stat.icon}
              </div>
              <h3 className="fw-bold mb-1 text-dark">{stat.value}</h3>
              <p className="text-muted small mb-0 fw-bold text-uppercase" style={{ letterSpacing: '0.05em' }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Main Content Area */}
        <div className="col-lg-8">
          {/* Recent Exams Section */}
          <div className="dashboard-card mb-4 overflow-hidden">
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-3">
              <h5 className="fw-bold mb-0 text-dark">Recent Exams</h5>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control form-control-sm border-light bg-light"
                  placeholder="Search exams..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 180 }}
                />
                <select
                  className="form-select form-select-sm border-light bg-light"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ width: 120 }}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
                <p className="mt-2 text-muted small">Loading exams...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="px-4">Exam Title</th>
                      <th className="text-center">Duration</th>
                      <th className="text-center">Status</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExams.length > 0 ? (
                      filteredExams.map((exam) => (
                        <tr key={exam.id}>
                          <td className="px-4">
                            <div className="fw-bold text-dark">{exam.title}</div>
                            <div className="text-muted small" style={{ fontSize: '0.7rem' }}>Created: {new Date().toLocaleDateString()}</div>
                          </td>
                          <td className="text-center text-muted small fw-bold">
                            {exam.timeLimit || 30} min
                          </td>
                          <td className="text-center">
                            <span className={`status-chip status-${exam.status || 'draft'}`}>
                              {(exam.status || 'draft').charAt(0).toUpperCase() + (exam.status || 'draft').slice(1)}
                            </span>
                          </td>
                          <td className="text-end pe-4">
                            <div className="d-flex gap-2 justify-content-end">
                              <button className="btn-icon" title="View Details" onClick={() => setEditingExam(exam)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button className="btn-icon" title="Results" onClick={() => handleShowResults(exam)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                              </button>
                              <button className="btn-icon text-danger" title="Delete" onClick={() => handleDeleteExam(exam.id)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-5 text-muted small">
                          No exams found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Results Overview Section */}
          <div className="dashboard-card p-4" id="results-overview">
            <h5 className="fw-bold mb-4 text-dark">Results Overview</h5>
            <div className="row g-4">
              <div className="col-md-6">
                <div className="metric-item">
                  <span className="text-muted small fw-bold">Pass Rate</span>
                  <span className="fw-bold text-dark">92.4%</span>
                </div>
                <div className="progress mb-3">
                  <div className="progress-bar" style={{ width: '92.4%', backgroundColor: 'var(--secondary-green)' }}></div>
                </div>
                
                <div className="metric-item">
                  <span className="text-muted small fw-bold">Highest Score</span>
                  <span className="fw-bold text-dark">100%</span>
                </div>
                <div className="progress mb-3">
                  <div className="progress-bar" style={{ width: '100%', backgroundColor: 'var(--primary-blue)' }}></div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="metric-item">
                  <span className="text-muted small fw-bold">Average Score</span>
                  <span className="fw-bold text-dark">84.2%</span>
                </div>
                <div className="progress mb-3">
                  <div className="progress-bar" style={{ width: '84.2%', backgroundColor: 'var(--vibrant-purple)' }}></div>
                </div>

                <div className="metric-item">
                  <span className="text-muted small fw-bold">Success rate</span>
                  <span className="fw-bold text-dark">88%</span>
                </div>
                <div className="progress">
                  <div className="progress-bar" style={{ width: '88%', backgroundColor: 'var(--accent-orange)' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="col-lg-4">
          {/* Quick Actions */}
          <div className="mb-4">
            <h5 className="fw-bold mb-3 text-dark">Quick Actions</h5>
            <div className="row g-3">
              <div className="col-6">
                <div className="dashboard-card action-card" onClick={handleCreateNewExam}>
                  <div className="action-icon bg-blue-light">➕</div>
                  <div className="fw-bold small text-dark">Create New Exam</div>
                </div>
              </div>
              <div className="col-6">
                <div className="dashboard-card action-card" onClick={handleQuickManage}>
                  <div className="action-icon bg-green-light">📋</div>
                  <div className="fw-bold small text-dark">Manage Exams</div>
                </div>
              </div>
              <div className="col-6">
                <div className="dashboard-card action-card" onClick={scrollToResults}>
                  <div className="action-icon bg-orange-light">📊</div>
                  <div className="fw-bold small text-dark">View Results</div>
                </div>
              </div>
              <div className="col-6">
                <div className="dashboard-card action-card" onClick={handleQuickActive}>
                  <div className="action-icon bg-purple-light">⚡</div>
                  <div className="fw-bold small text-dark">Active Exams</div>
                </div>
              </div>
            </div>
          </div>

          {/* Exam Overview Section */}
          <div className="dashboard-card p-4 mb-4">
            <h5 className="fw-bold mb-4 text-dark">Exam Overview</h5>
            <div className="metric-item">
              <div className="d-flex align-items-center gap-2">
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--secondary-green)' }}></div>
                <span className="text-muted small fw-bold">Active</span>
              </div>
              <span className="fw-bold text-dark">{activeExams}</span>
            </div>
            <div className="metric-item">
              <div className="d-flex align-items-center gap-2">
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--accent-orange)' }}></div>
                <span className="text-muted small fw-bold">Draft</span>
              </div>
              <span className="fw-bold text-dark">{draftExams}</span>
            </div>
            <div className="metric-item">
              <div className="d-flex align-items-center gap-2">
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--text-muted)' }}></div>
                <span className="text-muted small fw-bold">Closed</span>
              </div>
              <span className="fw-bold text-dark">{closedExams}</span>
            </div>
          </div>

          {/* Statistics Section (Circular indicators) */}
          <div className="dashboard-card p-4">
            <h5 className="fw-bold mb-4 text-dark">Monthly Activity</h5>
            <div className="text-center py-2">
              <div className="position-relative d-inline-block">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                  <circle cx="60" cy="60" r="54" fill="none" stroke="var(--primary-blue)" strokeWidth="8" 
                    strokeDasharray="339.29" strokeDashoffset={339.29 * (1 - 0.75)} 
                    strokeLinecap="round" transform="rotate(-90 60 60)" />
                </svg>
                <div className="position-absolute top-50 left-50 translate-middle text-center w-100" style={{ left: '50%', transform: 'translate(-50%, -50%)' }}>
                  <div className="fw-bold fs-4 text-dark">75%</div>
                  <div className="text-muted small fw-bold" style={{ fontSize: '0.6rem' }}>TARGET</div>
                </div>
              </div>
              <p className="mt-4 text-muted small fw-bold">Exams created this month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
