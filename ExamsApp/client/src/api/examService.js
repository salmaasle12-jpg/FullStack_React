import { mockDb } from './mockDb';
import { loggerService } from '../services/loggerService';

/**
 * שירות לניהול מבחנים
 * Exam service for managing e-tests
 */
class ExamService {
  constructor() {
    this.delayTime = 500;
  }

  // פונקציה פרטית להדמיית השהיה
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms || this.delayTime));
  }

  // שליפת כל המבחנים
  async getAllExams() {
    loggerService.log("Fetching all exams");
    await this._delay();
    return [...mockDb.exams];
  }

  // שליפת מבחן לפי מזהה
  async getExamById(id) {
    loggerService.log(`Fetching exam with id: ${id}`);
    await this._delay();
    const exam = mockDb.exams.find(e => e.id === id);
    if (!exam) {
      loggerService.error(`Exam not found: ${id}`);
      throw new Error("Exam not found");
    }
    return { ...exam };
  }

  // יצירת מבחן חדש
  async createExam(exam) {
    loggerService.log("Creating new exam");
    await this._delay(800);
    const newExam = { 
      ...exam, 
      id: Date.now().toString() 
    };
    mockDb.exams.push(newExam);
    loggerService.info("Exam created successfully", newExam);
    return newExam;
  }

  // שליפת ציונים
  async getScores() {
    loggerService.log("Fetching student scores");
    await this._delay();
    return [...mockDb.studentScores];
  }
}

export const examService = new ExamService();
