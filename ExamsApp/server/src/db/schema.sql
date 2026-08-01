CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS exams (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    time_limit INTEGER,
    passing_grade INTEGER,
    questions JSONB NOT NULL
);