import express from "express";
import cors from "cors";
import pool from "./db/db.js";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT) || 5000;

/**
 * Ensure that the status column exists.
 * Existing exams will get the default value "draft".
 */
async function ensureDatabaseSchema() {
  await pool.query(`
    ALTER TABLE exams
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'draft'
  `);
}

/**
 * Accept only supported exam statuses.
 */
function normalizeStatus(status) {
  const allowedStatuses = ["draft", "active", "closed"];

  return allowedStatuses.includes(status)
    ? status
    : "draft";
}

/**
 * Convert a value to a number.
 * If conversion fails, use the fallback value.
 */
function parseNumber(value, fallback) {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : fallback;
}

/**
 * Server status route
 */
app.get("/", (req, res) => {
  res.send("ExamsApp Server is running 🚀");
});

/**
 * Get all exams
 */
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

/**
 * Get one exam by ID
 */
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

/**
 * Create a new exam
 */
app.post("/api/exams", async (req, res) => {
  try {
    const {
      title,
      status,
      time_limit,
      passing_grade,
      timeLimit,
      passingGrade,
      questions
    } = req.body;

    const cleanTitle = String(title || "").trim();

    const finalStatus = normalizeStatus(status);

    const finalTimeLimit = parseNumber(
      time_limit ?? timeLimit,
      60
    );

    const finalPassingGrade = parseNumber(
      passing_grade ?? passingGrade,
      60
    );

    const finalQuestions = Array.isArray(questions)
      ? questions
      : [];

    if (!cleanTitle) {
      return res.status(400).json({
        error: "Exam title is required"
      });
    }

    if (finalTimeLimit < 1) {
      return res.status(400).json({
        error: "Time limit must be at least 1 minute"
      });
    }

    if (
      finalPassingGrade < 0 ||
      finalPassingGrade > 100
    ) {
      return res.status(400).json({
        error: "Passing grade must be between 0 and 100"
      });
    }

    const result = await pool.query(
      `INSERT INTO exams
       (
         title,
         status,
         time_limit,
         passing_grade,
         questions
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        cleanTitle,
        finalStatus,
        finalTimeLimit,
        finalPassingGrade,
        JSON.stringify(finalQuestions)
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

/**
 * Update an existing exam
 */
app.put("/api/exams/:id", async (req, res) => {
  try {
    const {
      title,
      status,
      time_limit,
      passing_grade,
      timeLimit,
      passingGrade,
      questions
    } = req.body;

    const cleanTitle = String(title || "").trim();

    const finalStatus = normalizeStatus(status);

    const finalTimeLimit = parseNumber(
      time_limit ?? timeLimit,
      60
    );

    const finalPassingGrade = parseNumber(
      passing_grade ?? passingGrade,
      60
    );

    const finalQuestions = Array.isArray(questions)
      ? questions
      : [];

    if (!cleanTitle) {
      return res.status(400).json({
        error: "Exam title is required"
      });
    }

    if (finalTimeLimit < 1) {
      return res.status(400).json({
        error: "Time limit must be at least 1 minute"
      });
    }

    if (
      finalPassingGrade < 0 ||
      finalPassingGrade > 100
    ) {
      return res.status(400).json({
        error: "Passing grade must be between 0 and 100"
      });
    }

    const result = await pool.query(
      `UPDATE exams
       SET
         title = $1,
         status = $2,
         time_limit = $3,
         passing_grade = $4,
         questions = $5
       WHERE id = $6
       RETURNING *`,
      [
        cleanTitle,
        finalStatus,
        finalTimeLimit,
        finalPassingGrade,
        JSON.stringify(finalQuestions),
        req.params.id
      ]
    );

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

/**
 * Delete an exam
 */
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

/**
 * Start the server only after the database schema is ready.
 */
async function startServer() {
  try {
    await ensureDatabaseSchema();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(
      "Failed to initialize database schema:",
      err
    );

    process.exit(1);
  }
}

startServer();