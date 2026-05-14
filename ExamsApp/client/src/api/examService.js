// ייבוא בסיס הנתונים המדומה
import { mockDb } from './mockDb';

// פונקציה המדמה זמן תגובה של שרת
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


// שליפת כל המבחנים
export const getAllExams = async () => {
  
  // המתנה של חצי שנייה
  await delay(500);

  // החזרת רשימת מבחנים
  return [...mockDb.exams];
};


// שליפת מבחן לפי מזהה
export const getExamById = async (id) => {

  // המתנה של חצי שנייה
  await delay(500);

  // חיפוש מבחן לפי ID
  const exam = mockDb.exams.find(e => e.id === id);

  // בדיקה אם המבחן לא קיים
  if (!exam) throw new Error("Exam not found");

  // החזרת עותק של המבחן
  return { ...exam };
};


// יצירת מבחן חדש
export const createExam = async (exam) => {

  // סימולציה של בקשת שרת
  await delay(800);

  // יצירת מבחן חדש עם מזהה ייחודי
  const newExam = { 
    ...exam, 
    id: Date.now().toString() 
  };

  // הוספת המבחן למאגר הנתונים
  mockDb.exams.push(newExam);

  // החזרת המבחן החדש
  return newExam;
};