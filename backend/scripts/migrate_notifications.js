const pool = require('../db');

async function migrate() {
    try {
        console.log('Starting migration to add NOTIFICATIONS table...');
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS NOTIFICATIONS (
                notification_id SERIAL PRIMARY KEY,
                recipient_id INT REFERENCES USERS(id) ON DELETE CASCADE, -- if NULL, it's a broadcast to all
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) DEFAULT 'info', -- info, success, warning, error
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        console.log('Successfully created NOTIFICATIONS table.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        pool.end();
    }
}

migrate();
