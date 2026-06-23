const pool = require('../db');

async function runMigration() {
  try {
    console.log('Starting migration to add APPEALS table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS APPEALS (
        appeal_id SERIAL PRIMARY KEY,
        student_id INT REFERENCES USERS(id) ON DELETE CASCADE,
        appeal_type VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Successfully created APPEALS table.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    pool.end();
  }
}

runMigration();
