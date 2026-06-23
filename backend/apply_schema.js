const pool = require('./db');
(async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS REVIEWS (
                review_id SERIAL PRIMARY KEY,
                book_id VARCHAR(20) REFERENCES BOOKS(book_id) ON DELETE CASCADE,
                student_id INT REFERENCES USERS(id) ON DELETE CASCADE,
                rating INT CHECK (rating >= 1 AND rating <= 5),
                review_text TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(book_id, student_id)
            );
        `);
        console.log("Migration successful: REVIEWS table created.");
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
})();
