const pool = require('../db');

async function migrate() {
    try {
        console.log('Starting migration to add last_active_at to USERS table...');
        
        await pool.query(`
            ALTER TABLE USERS 
            ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        `);
        
        console.log('Successfully updated USERS table.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        pool.end();
    }
}

migrate();
