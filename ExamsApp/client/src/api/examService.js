import { loggerService } from '../services/loggerService';

const API_URL = "http://localhost:5000/api";

/**
 * Exam service for managing e-tests
 */
class ExamService {

  // Fetch all exams
  async getAllExams() {
    loggerService.log("Fetching all exams from API");

    const response = await fetch(`${API_URL}/exams`);
    if (!response.ok) throw new Error("Failed to load exams");

    return await response.json();
  }


  // Fetch exam by ID
  async getExamById(id) {
    loggerService.log(`Fetching exam: ${id}`);

    const response = await fetch(`${API_URL}/exams/${id}`);
    if (!response.ok) throw new Error("Exam not found");

    return await response.json();
  }


  // Add new exam
  async addExam(newExam) {
    loggerService.log("Adding exam");

    const response = await fetch(`${API_URL}/exams`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newExam)
    });

    if (!response.ok) throw new Error("Failed to add exam");

    return await response.json();
  }


  // Update exam
  async updateExam(updatedExam) {
    loggerService.log(`Updating exam: ${updatedExam.id}`);

    const response = await fetch(
      `${API_URL}/exams/${updatedExam.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedExam)
      }
    );

    if (!response.ok) throw new Error("Failed to update exam");

    return await response.json();
  }


  // Delete exam
  async deleteExam(id) {
    loggerService.log(`Deleting exam: ${id}`);

    const response = await fetch(`${API_URL}/exams/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) throw new Error("Failed to delete exam");

    return true;
  }


  // temporary keep results local until we make DB table
  async saveResult(result) {
    const results =
      JSON.parse(localStorage.getItem("results_db")) || [];

    const newResult = {
      ...result,
      id: Date.now(),
      date: new Date().toLocaleString()
    };

    results.push(newResult);

    localStorage.setItem(
      "results_db",
      JSON.stringify(results)
    );

    return newResult;
  }


  async getResultsByStudent(studentId) {
    const results =
      JSON.parse(localStorage.getItem("results_db")) || [];

    return results.filter(
      r => r.studentId === studentId
    );
  }


  async getResultsByExam(examId) {
    const results =
      JSON.parse(localStorage.getItem("results_db")) || [];

    return results.filter(
      r => r.examId === examId
    );
  }
}

export const examService = new ExamService();
