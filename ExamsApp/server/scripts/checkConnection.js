import pool from '../src/db/db.js';

async function checkConnection() {
  try {
    const result = await pool.query('SELECT NOW() AS current_time');
    console.log('✅ Database connected successfully!');
    console.log('Current DB time:', result.rows[0].current_time);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  } finally {
    await pool.end();
  }
}

checkConnection();