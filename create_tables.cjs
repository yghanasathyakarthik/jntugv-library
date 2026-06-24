const pool = require('./backend/db');

async function create() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS STUDY_SEATS (
                seat_id VARCHAR(50) PRIMARY KEY,
                zone VARCHAR(50),
                status VARCHAR(20) DEFAULT 'available',
                occupied_by VARCHAR(50),
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        const count = await pool.query('SELECT count(*) FROM STUDY_SEATS');
        if (parseInt(count.rows[0].count) === 0) {
            for(let i=1; i<=10; i++) {
                await pool.query(`INSERT INTO STUDY_SEATS (seat_id, zone, status) VALUES ('SEAT-A${i}', 'Quiet Zone', 'available')`);
            }
        }

        await pool.query(`
            CREATE TABLE IF NOT EXISTS BOOK_SWIPES (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                book_id INTEGER,
                action VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, book_id)
            );
        `);
        
        console.log('Tables created successfully');
    } catch(err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
create();
