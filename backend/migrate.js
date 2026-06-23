const pool = require('./db');
(async () => {
    try {
        await pool.query('ALTER TABLE USERS ADD COLUMN profile_photo TEXT;');
        console.log("Migration successful");
    } catch (e) {
        if (e.code === '42701') console.log("Column already exists");
        else console.error(e);
    } finally {
        process.exit();
    }
})();
