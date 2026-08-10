const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkLocations() {
    try {
        const res = await pool.query(`
            SELECT count(*) as total, count(location_id) as with_location 
            FROM BOOK_ASSET_MAP
        `);
        console.log(res.rows[0]);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

checkLocations();
