CREATE TABLE IF NOT EXISTS exams (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    time_limit INT,
    passing_grade INT,
    questions JSONB
);

INSERT INTO exams (title, time_limit, passing_grade, questions)
VALUES (
    'React Fundamentals',
    60,
    60,
    '[
      {
        "id":"q1",
        "text":"What is React?",
        "type":"MULTIPLE_CHOICE",
        "answer":"Library",
        "options":["Library","Database","Operating System"]
      }
    ]'
);