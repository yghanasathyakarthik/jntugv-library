const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function updateLocations() {
    try {
        const res = await pool.query(`
            UPDATE PHYSICAL_LOCATIONS
            SET room_number = 'Circulating Room',
                section_name = '1st Flr Left Side'
            WHERE room_number = 'TBD' OR section_name = 'TBD'
        `);
        console.log(`Updated ${res.rowCount} physical locations to Circulating Room!`);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

updateLocations();
