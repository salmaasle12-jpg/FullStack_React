import React, { useState } from 'react';
import { getExamById } from '../api/examService';

const StudentPortal = () => {
  const [examId, setExamId] = useState('');
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStartExam = async () => {
    if (!examId) return;
    setLoading(true);
    setError('');
    setExam(null);
    try {
      const data = await getExamById(examId);
      setExam(data);
    } catch (err) {
      setError(err.message || "Exam not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-info text-white">
          <h2 className="mb-0">Student Portal</h2>
        </div>
        <div className="card-body text-center">
          <h4 className="mb-4">Welcome to the Exam Center</h4>
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Exam ID to Start"
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                />
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleStartExam}
                  disabled={loading}
                >
                  {loading ? 'Fetching...' : 'Start Exam'}
                </button>
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
            </div>
          </div>

          {exam && (
            <div className="mt-4 border-top pt-4">
              <h3>Ready to take: {exam.title}?</h3>
              <p className="lead">Total Questions: {exam.questions.length}</p>
              <button className="btn btn-success btn-lg">Begin Now</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;
