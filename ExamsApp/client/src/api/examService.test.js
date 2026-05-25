import { describe, it, expect } from 'vitest';
import { getAllExams, getExamById } from './examService';

describe('examService', () => {
  it('should fetch all exams', async () => {
    const exams = await getAllExams();
    expect(Array.isArray(exams)).toBe(true);
    expect(exams.length).toBeGreaterThan(0);
    expect(exams[0]).toHaveProperty('id');
    expect(exams[0]).toHaveProperty('title');
  });

  it('should fetch an exam by its ID', async () => {
    const examId = "101";
    const exam = await getExamById(examId);
    expect(exam).toBeDefined();
    expect(exam.id).toBe(examId);
    expect(exam.title).toBe("React Fundamentals");
  });
});
