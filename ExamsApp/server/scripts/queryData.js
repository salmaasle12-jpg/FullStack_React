import pool from '../src/db/db.js';

async function queryData() {
  try {
    console.log('\n👥 All Users:\n');

const usersResult = await pool.query('SELECT * FROM users');

console.table(
  usersResult.rows.map(u => ({
    id: u.id,
    full_name: u.full_name,
    email: u.email
  }))
);
    console.log('\n📚 All Exams:\n');

    const examsResult = await pool.query('SELECT * FROM exams');

    console.table(
      examsResult.rows.map(e => ({
        id: e.id,
        title: e.title,
        questions_count: e.questions.length
      }))
    );

    const exam = examsResult.rows[0];

    console.log('\n🎯 Selected Exam:');
    console.log(`Title: ${exam.title}`);

    console.log('\n📝 Questions from JSONB:\n');

    exam.questions.forEach((q, index) => {
      console.log(`Question ${index + 1}:`);
      console.log(`Text: ${q.text}`);
      console.log('JSON Object:', q);
      console.log('--------------------');
    });

  } catch (err) {
    console.error('❌ Query failed:', err.message);
  } finally {
    await pool.end();
  }
}

queryData();