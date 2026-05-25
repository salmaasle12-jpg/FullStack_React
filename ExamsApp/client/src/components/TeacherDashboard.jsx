import React, { useState, useEffect } from 'react';
import { examService } from '../api/examService';
import { loggerService } from '../services/loggerService';
import { notifyService } from '../services/notifyService';

/**
 * רכיב לוח בקרה למורה
 * Teacher Dashboard component
 */
const TeacherDashboard = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  // שליפת כל המבחנים מהשרת המדומה בטעינת הרכיב
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await examService.getAllExams();
        setExams(data);
        loggerService.info("Exams loaded in TeacherDashboard");
      } catch (error) {
        loggerService.error("Failed to fetch exams", error);
        notifyService.error("לא ניתן לטעון את המבחנים");
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  // סינון מבחנים לפי שם המבחן
  const filteredExams = exams.filter((exam) =>
    exam.title.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="container mt-2">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h2 className="mb-0">Teacher Dashboard</h2>
        </div>

        <div className="card-body">
          <h4>ניהול מבחנים</h4>

          <input
            type="text"
            className="form-control mt-3"
            placeholder="חפש מבחן לפי כותרת..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row mt-3">
              {filteredExams.length > 0 ? (
                filteredExams.map((exam) => (
                  <div key={exam.id} className="col-md-6 mb-3">
                    <div className="card h-100">
                      <div className="card-body">
                        <h5 className="card-title">{exam.title}</h5>
                        <p className="card-text text-muted">מזהה: {exam.id}</p>
                        <p className="card-text">מספר שאלות: {exam.questions.length}</p>
                        <button className="btn btn-outline-primary btn-sm">
                          ערוך מבחן
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="mt-3">לא נמצאו מבחנים.</p>
              )}
            </div>
          )}

          <button 
            className="btn btn-success mt-3"
            onClick={() => notifyService.info("פונקציונליות זו תתווסף בקרוב")}
          >
            צור מבחן חדש
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
