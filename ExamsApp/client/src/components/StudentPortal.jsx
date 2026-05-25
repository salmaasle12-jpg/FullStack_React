import React, { useState } from 'react';
import { examService } from '../api/examService';
import { loggerService } from '../services/loggerService';
import { notifyService } from '../services/notifyService';

/**
 * רכיב פורטל תלמיד
 * Student Portal component
 */
const StudentPortal = () => {
  const [examId, setExamId] = useState('');
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(false);

  // טיפול בתחילת מבחן
  const handleStartExam = async () => {
    if (!examId) {
      notifyService.error("אנא הזן מזהה מבחן");
      return;
    }
    
    setLoading(true);
    setExam(null);
    
    try {
      loggerService.log(`Student attempting to start exam: ${examId}`);
      const data = await examService.getExamById(examId);
      setExam(data);
      notifyService.success(`מבחן ${data.title} נטען בהצלחה`);
    } catch (err) {
      loggerService.error("Error loading exam", err);
      notifyService.error("מבחן לא נמצא או שגיאה בטעינה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-2">
      <div className="card shadow">
        <div className="card-header bg-info text-white">
          <h2 className="mb-0">Student Portal</h2>
        </div>
        <div className="card-body text-center">
          <h4 className="mb-4">ברוכים הבאים למרכז המבחנים</h4>
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="הזן מזהה מבחן כדי להתחיל"
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                />
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleStartExam}
                  disabled={loading}
                >
                  {loading ? 'טוען...' : 'התחל מבחן'}
                </button>
              </div>
            </div>
          </div>

          {exam && (
            <div className="mt-4 border-top pt-4">
              <h3>מוכן להתחיל את המבחן: {exam.title}?</h3>
              <p className="lead">סה"כ שאלות: {exam.questions.length}</p>
              <button 
                className="btn btn-success btn-lg"
                onClick={() => notifyService.info("המבחן יתחיל כעת")}
              >
                התחל עכשיו
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;
