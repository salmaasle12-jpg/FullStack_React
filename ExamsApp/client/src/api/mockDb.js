// בסיס נתונים מדומה של המערכת
export const mockDb = {
  
  // רשימת מבחנים
  exams: [
    {
      id: "101",
      title: "React Fundamentals",

      // שאלות של המבחן
      questions: [
        { 
          id: 1, 
          text: "What is JSX?", 
          options: ["A JS extension", "A database", "A CSS framework"], 
          answer: 0 
        },

        { 
          id: 2, 
          text: "What is a Hook?", 
          options: ["A fishing tool", "A special function", "A class method"], 
          answer: 1 
        }
      ]
    },

    {
      id: "102",
      title: "Node.js Basics",

      // שאלות של המבחן
      questions: [
        { 
          id: 1, 
          text: "Is Node.js single-threaded?", 
          options: ["Yes", "No"], 
          answer: 0 
        }
      ]
    }
  ],

  // ציוני תלמידים
  studentScores: [
    { studentName: "Alice", examId: "101", score: 90 },
    { studentName: "Bob", examId: "101", score: 85 }
  ]
};
