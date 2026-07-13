// Mock database for the system
export const mockDb = {
  // User list
  users: [
    { id: "u101", email: "student@test.com", password: "123", role: "student", fullName: "Student User" },
    { id: "u102", email: "teacher@test.com", password: "123", role: "teacher", fullName: "Teacher User" }
  ],
  
  // Exam list
  exams: [
    {
      id: "101",
      title: "React Fundamentals",
      status: "active",
      timeLimit: 30,
      passingGrade: 60,

      // Exam questions
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
      status: "active",
      timeLimit: 20,
      passingGrade: 60,

      // Exam questions
      questions: [
        { 
          id: 1, 
          text: "Is Node.js single-threaded?", 
          options: ["Yes", "No"], 
          answer: 0 
        }
      ]
    },

    {
      id: "103",
      title: "Advanced JavaScript",
      status: "upcoming",
      timeLimit: 45,
      passingGrade: 70,
      questions: [
        { 
          id: 1, 
          text: "What is a closure?", 
          options: ["A way to close a file", "A function with its lexical environment", "A loop type"], 
          answer: 1 
        }
      ]
    }
  ],

  // Student scores
  studentScores: [
    { studentName: "Alice", examId: "101", score: 90 },
    { studentName: "Bob", examId: "101", score: 85 }
  ]
};
