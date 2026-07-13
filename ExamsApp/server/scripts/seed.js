import fs from 'fs';
import path from 'path';
import pool from '../src/db/db.js';

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    const schemaPath = path.join(process.cwd(), 'src', 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await pool.query(schema);

    await pool.query('TRUNCATE TABLE exams, users RESTART IDENTITY CASCADE');

    const users = [
      ['Alice Student', 'alice@student.com'],
      ['Bob Teacher', 'bob@teacher.com']
    ];

    for (const user of users) {
      await pool.query(
        'INSERT INTO users (full_name, email) VALUES ($1, $2)',
        user
      );
    }

    const questions = [
      {
        id: 'q1',
        text: 'What is React?',
        type: 'MULTIPLE_CHOICE',
        options: ['Library', 'Database', 'Operating System'],
        answer: 'Library'
      },
      {
        id: 'q2',
        text: 'What is JSX?',
        type: 'MULTIPLE_CHOICE',
        options: ['JavaScript XML', 'Java Server X', 'JSON Syntax'],
        answer: 'JavaScript XML'
      }
    ];

    await pool.query(
      `INSERT INTO exams (title, time_limit, passing_grade, questions)
       VALUES ($1, $2, $3, $4::jsonb)`,
      ['React Fundamentals', 60, 60, JSON.stringify(questions)]
    );

    console.log('✅ Seed completed successfully!');
    console.log('✅ Users inserted');
    console.log('✅ Exam with JSONB questions inserted');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await pool.end();
  }
}

seed();