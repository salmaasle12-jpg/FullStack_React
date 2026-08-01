import express from "express";
import cors from "cors";
import pool from "./db/db.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("ExamsApp Server is running 🚀");
});

app.get("/api/exams", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM exams ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch exams" });
  }
});

app.get("/api/exams/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM exams WHERE id=$1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Exam not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch exam" });
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

    const finalTimeLimit = time_limit ?? timeLimit ?? 60;
    const finalPassingGrade = passing_grade ?? passingGrade ?? 60;

    const result = await pool.query(
      `INSERT INTO exams 
       (title, time_limit, passing_grade, questions)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        title,
        finalTimeLimit,
        finalPassingGrade,
        JSON.stringify(questions)
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add exam" });
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
      questions
    } = req.body;

    const finalTimeLimit = time_limit ?? timeLimit ?? 60;
    const finalPassingGrade = passing_grade ?? passingGrade ?? 60;

    const result = await pool.query(
      `UPDATE exams
       SET title=$1,
           time_limit=$2,
           passing_grade=$3,
           questions=$4
       WHERE id=$5
       RETURNING *`,
      [
        title,
        finalTimeLimit,
        finalPassingGrade,
        JSON.stringify(questions),
        req.params.id
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update exam" });
  }
});

app.delete("/api/exams/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM exams WHERE id=$1", [req.params.id]);

    res.json({ message: "Exam deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete exam" });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});