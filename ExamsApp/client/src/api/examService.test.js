import { describe, it, expect } from 'vitest';
import { examService } from './examService';

describe('examService', () => {
  it('should fetch all exams', async () => {
    const exams = await examService.getAllExams();
    expect(Array.isArray(exams)).toBe(true);
    expect(exams.length).toBeGreaterThan(0);
    expect(exams[0]).toHaveProperty('id');
    expect(exams[0]).toHaveProperty('title');
  });

  it('should fetch an exam by its ID', async () => {
    const examId = "101";
    const exam = await examService.getExamById(examId);
    expect(exam).toBeDefined();
    expect(exam.id).toBe(examId);
    expect(exam.title).toBe("React Fundamentals");
  });

  it('should save and fetch student results', async () => {
    const result = {
      studentId: "u101",
      studentName: "Test Student",
      examId: "101",
      examTitle: "React Fundamentals",
      score: 80,
      isPassed: true
    };
    const saved = await examService.saveResult(result);
    expect(saved).toHaveProperty('id');
    expect(saved.score).toBe(80);

    const history = await examService.getResultsByStudent("u101");
    expect(history.some(r => r.id === saved.id)).toBe(true);
  });
});
