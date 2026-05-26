import { mockDb } from './mockDb';
import { storageService } from '../services/storageService';
import { loggerService } from '../services/loggerService';

/**
 * שירות לניהול מבחנים
 * Exam service for managing e-tests
 */
class ExamService {
  constructor() {
    this.delayTime = 500;
    this.STORAGE_KEY_EXAMS = 'exams_db';
    this.STORAGE_KEY_RESULTS = 'results_db';
    this._initExams();
  }

  // אתחול המבחנים במידה ולא קיימים באחסון המקומי
  _initExams() {
    let exams = storageService.load(this.STORAGE_KEY_EXAMS);
    if (!exams) {
      storageService.save(this.STORAGE_KEY_EXAMS, mockDb.exams);
    }
  }

  // פונקציה פרטית להדמיית השהיה
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms || this.delayTime));
  }

  // שליפת כל המבחנים
  async getAllExams() {
    loggerService.log("Fetching all exams");
    await this._delay();
    return storageService.load(this.STORAGE_KEY_EXAMS) || [];
  }

  // שליפת מבחן לפי מזהה
  async getExamById(id) {
    loggerService.log(`Fetching exam with id: ${id}`);
    await this._delay();
    const exams = storageService.load(this.STORAGE_KEY_EXAMS) || [];
    const exam = exams.find(e => e.id === id);
    if (!exam) {
      loggerService.error(`Exam not found: ${id}`);
      throw new Error("Exam not found");
    }
    return { ...exam };
  }

  // עדכון מבחן קיים
  async updateExam(updatedExam) {
    loggerService.log(`Updating exam: ${updatedExam.id}`);
    await this._delay(600);
    const exams = storageService.load(this.STORAGE_KEY_EXAMS) || [];
    const idx = exams.findIndex(e => e.id === updatedExam.id);
    if (idx === -1) throw new Error("Exam not found");
    
    exams[idx] = updatedExam;
    storageService.save(this.STORAGE_KEY_EXAMS, exams);
    loggerService.info("Exam updated successfully", updatedExam);
    return updatedExam;
  }

  // שמירת תוצאת מבחן של סטודנט
  async saveResult(result) {
    loggerService.log("Saving exam result");
    await this._delay(700);
    const results = storageService.load(this.STORAGE_KEY_RESULTS) || [];
    const newResult = {
      ...result,
      id: 'r' + Date.now(),
      date: new Date().toLocaleString()
    };
    results.push(newResult);
    storageService.save(this.STORAGE_KEY_RESULTS, results);
    loggerService.info("Result saved successfully", newResult);
    return newResult;
  }

  // שליפת היסטוריית תוצאות לפי מזהה סטודנט
  async getResultsByStudent(studentId) {
    loggerService.log(`Fetching results for student: ${studentId}`);
    await this._delay();
    const results = storageService.load(this.STORAGE_KEY_RESULTS) || [];
    return results.filter(r => r.studentId === studentId);
  }
}

export const examService = new ExamService();
