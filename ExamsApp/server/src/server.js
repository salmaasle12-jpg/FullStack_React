import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import pool from "./db/db.js";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255),
      role VARCHAR(30) DEFAULT 'student',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      
    )
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS password VARCHAR(255)
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role VARCHAR(30) DEFAULT 'student'
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  `);

  await pool.query(`
    ALTER TABLE exams
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft'
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS results (
      id SERIAL PRIMARY KEY,
      student_id VARCHAR(100) NOT NULL,
      student_name VARCHAR(255),
      exam_id INTEGER NOT NULL,
      exam_title VARCHAR(255),
      score NUMERIC(5, 2) NOT NULL,
      is_passed BOOLEAN NOT NULL DEFAULT FALSE,
      correct_answers INTEGER DEFAULT 0,
      total_questions INTEGER DEFAULT 0,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("✅ Exams status column is ready");

  console.log("✅ Users table is ready");
  console.log("✅ Results table is ready");
}

app.get("/", (req, res) => {
  res.send("ExamsApp Server is running 🚀");
});

/* =====================================================
   USERS API
===================================================== */

app.post("/api/users/register", async (req, res) => {
  try {
    const { name, fullName, email, password, role } = req.body;

    const finalName = String(name || fullName || "").trim();
    const finalEmail = String(email || "").trim().toLowerCase();
    const finalPassword = String(password || "");
    const finalRole = role === "teacher" ? "teacher" : "student";

    if (!finalName) {
      return res.status(400).json({ error: "Name is required" });
    }

    if (!finalEmail) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (finalPassword.length < 4) {
      return res.status(400).json({
        error: "Password must contain at least 4 characters"
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [finalEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, full_name, email, role, created_at`,
      [finalName, finalEmail, hashedPassword, finalRole]
    );

    res.status(201).json(mapUserRow(result.rows[0]));
  } catch (err) {
    console.error("Registration failed:", err);

    res.status(500).json({
      error: "Registration failed",
      details: err.message
    });
  }
});

app.post("/api/users/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    res.json(mapUserRow(user));
  } catch (err) {
    console.error("Login failed:", err);

    res.status(500).json({
      error: "Login failed",
      details: err.message
    });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, role, created_at
       FROM users
       ORDER BY id`
    );

    res.json(result.rows.map(mapUserRow));
  } catch (err) {
    console.error("Failed to fetch users:", err);

    res.status(500).json({
      error: "Failed to fetch users",
      details: err.message
    });
  }
});

/* =====================================================
   EXAMS API
===================================================== */

app.get("/api/exams", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM exams ORDER BY id"
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Failed to fetch exams:", err);

    res.status(500).json({
      error: "Failed to fetch exams",
      details: err.message
    });
  }
});

app.get("/api/exams/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM exams WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Exam not found"
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Failed to fetch exam:", err);

    res.status(500).json({
      error: "Failed to fetch exam",
      details: err.message
    });
  }
});

app.post("/api/exams", async (req, res) => {
  try {
    const {
      title,
      time_limit,
      passing_grade,
      timeLimit,
      passingGrade,
      questions
    } = req.body;

    const finalTimeLimit = Number(time_limit ?? timeLimit ?? 60);
    const finalPassingGrade = Number(passing_grade ?? passingGrade ?? 60);

    if (!title?.trim()) {
      return res.status(400).json({
        error: "Exam title is required"
      });
    }

    if (!Number.isFinite(finalTimeLimit) || finalTimeLimit < 1) {
      return res.status(400).json({
        error: "Invalid time limit"
      });
    }

    if (
      !Number.isFinite(finalPassingGrade) ||
      finalPassingGrade < 0 ||
      finalPassingGrade > 100
    ) {
      return res.status(400).json({
        error: "Passing grade must be between 0 and 100"
      });
    }

    const result = await pool.query(
  `INSERT INTO exams
   (title, time_limit, passing_grade, questions, status)
   VALUES ($1, $2, $3, $4, $5)
   RETURNING *`,
  [
    title.trim(),
    finalTimeLimit,
    finalPassingGrade,
    JSON.stringify(
      Array.isArray(questions) ? questions : []
    ),
    finalStatus
  ]
);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Failed to add exam:", err);

    res.status(500).json({
      error: "Failed to add exam",
      details: err.message
    });
  }
});

app.put("/api/exams/:id", async (req, res) => {
  try {
    const {
      title,
      time_limit,
      passing_grade,
      timeLimit,
      passingGrade,
      questions,
      status
    } = req.body;
    const finalStatus = status || "draft";
    const finalTimeLimit = Number(time_limit ?? timeLimit ?? 60);
    const finalPassingGrade = Number(passing_grade ?? passingGrade ?? 60);

    if (!title?.trim()) {
      return res.status(400).json({
        error: "Exam title is required"
      });
    }

    if (!Number.isFinite(finalTimeLimit) || finalTimeLimit < 1) {
      return res.status(400).json({
        error: "Invalid time limit"
      });
    }

    if (
      !Number.isFinite(finalPassingGrade) ||
      finalPassingGrade < 0 ||
      finalPassingGrade > 100
    ) {
      return res.status(400).json({
        error: "Passing grade must be between 0 and 100"
      });
    }

const result = await pool.query(
  `UPDATE exams
   SET title = $1,
       time_limit = $2,
       passing_grade = $3,
       questions = $4,
       status = $5
   WHERE id = $6
   RETURNING *`,
  [
    title.trim(),
    finalTimeLimit,
    finalPassingGrade,
    JSON.stringify(
      Array.isArray(questions) ? questions : []
    ),
    finalStatus,
    req.params.id
  ]
);;

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Exam not found"
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Failed to update exam:", err);

    res.status(500).json({
      error: "Failed to update exam",
      details: err.message
    });
  }
});

app.delete("/api/exams/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM exams WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Exam not found"
      });
    }

    res.json({
      message: "Exam deleted successfully"
    });
  } catch (err) {
    console.error("Failed to delete exam:", err);

    res.status(500).json({
      error: "Failed to delete exam",
      details: err.message
    });
  }
});

/* =====================================================
   RESULTS API
===================================================== */

app.post("/api/results", async (req, res) => {
  try {
    const {
      studentId,
      student_id,
      studentName,
      student_name,
      examId,
      exam_id,
      examTitle,
      exam_title,
      score,
      isPassed,
      is_passed,
      passed,
      correctAnswers,
      correct_answers,
      totalQuestions,
      total_questions
    } = req.body;

    const finalStudentId = studentId ?? student_id;
    const finalStudentName = studentName ?? student_name ?? "Unknown Student";
    const finalExamId = Number(examId ?? exam_id);
    const finalExamTitle = examTitle ?? exam_title ?? null;
    const finalScore = Number(score);
    const finalPassed = Boolean(isPassed ?? is_passed ?? passed ?? false);
    const finalCorrectAnswers = Number(
      correctAnswers ?? correct_answers ?? 0
    );
    const finalTotalQuestions = Number(
      totalQuestions ?? total_questions ?? 0
    );

    if (!finalStudentId) {
      return res.status(400).json({
        error: "Student ID is required"
      });
    }

    if (!Number.isInteger(finalExamId) || finalExamId < 1) {
      return res.status(400).json({
        error: "Valid exam ID is required"
      });
    }

    if (
      !Number.isFinite(finalScore) ||
      finalScore < 0 ||
      finalScore > 100
    ) {
      return res.status(400).json({
        error: "Score must be between 0 and 100"
      });
    }

    const result = await pool.query(
      `INSERT INTO results (
         student_id,
         student_name,
         exam_id,
         exam_title,
         score,
         is_passed,
         correct_answers,
         total_questions
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        String(finalStudentId),
        finalStudentName,
        finalExamId,
        finalExamTitle,
        finalScore,
        finalPassed,
        finalCorrectAnswers,
        finalTotalQuestions
      ]
    );

    res.status(201).json(mapResultRow(result.rows[0]));
  } catch (err) {
    console.error("Failed to save result:", err);

    res.status(500).json({
      error: "Failed to save result",
      details: err.message
    });
  }
});

app.get("/api/results", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM results
       ORDER BY submitted_at DESC`
    );

    res.json(result.rows.map(mapResultRow));
  } catch (err) {
    console.error("Failed to fetch results:", err);

    res.status(500).json({
      error: "Failed to fetch results",
      details: err.message
    });
  }
});

app.get("/api/results/student/:studentId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM results
       WHERE student_id = $1
       ORDER BY submitted_at DESC`,
      [req.params.studentId]
    );

    res.json(result.rows.map(mapResultRow));
  } catch (err) {
    console.error("Failed to fetch student results:", err);

    res.status(500).json({
      error: "Failed to fetch student results",
      details: err.message
    });
  }
});

app.get("/api/results/exam/:examId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM results
       WHERE exam_id = $1
       ORDER BY submitted_at DESC`,
      [req.params.examId]
    );

    res.json(result.rows.map(mapResultRow));
  } catch (err) {
    console.error("Failed to fetch exam results:", err);

    res.status(500).json({
      error: "Failed to fetch exam results",
      details: err.message
    });
  }
});

function mapUserRow(row) {
  return {
    id: String(row.id),
    name: row.full_name,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at
  };
}

function mapResultRow(row) {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    examId: row.exam_id,
    examTitle: row.exam_title,
    score: Number(row.score),
    isPassed: row.is_passed,
    passed: row.is_passed,
    correctAnswers: row.correct_answers,
    totalQuestions: row.total_questions,
    date: row.submitted_at,
    submittedAt: row.submitted_at
  };
}

async function startServer() {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to initialize the database:", err);
    process.exit(1);
  }
}

startServer();
