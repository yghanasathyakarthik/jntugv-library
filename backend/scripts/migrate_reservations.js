const pool = require('../db');

async function migrate() {
    try {
        console.log('Starting migration to add RESERVATIONS table...');
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS RESERVATIONS (
                reservation_id SERIAL PRIMARY KEY,
                book_id VARCHAR(20) REFERENCES BOOKS(book_id) ON DELETE CASCADE,
                student_id INT REFERENCES USERS(id) ON DELETE CASCADE,
                status VARCHAR(20) DEFAULT 'Pending', -- Pending, Ready, Completed, Cancelled
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                estimated_availability TIMESTAMP
            );
        `);
        
        console.log('Successfully created RESERVATIONS table.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        pool.end();
    }
}

migrate();
