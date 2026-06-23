const pool = require('./db');

(async () => {
    try {
        await pool.query('ALTER TABLE USERS ADD COLUMN library_time_minutes INTEGER DEFAULT 0;');
        console.log("Migration successful: Added library_time_minutes to USERS.");
    } catch (e) {
        if (e.code === '42701') {
            console.log("Column library_time_minutes already exists");
        } else {
            console.error("Migration failed:", e);
        }
    } finally {
        process.exit();
    }
})();
