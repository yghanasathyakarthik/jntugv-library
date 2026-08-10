const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runMigrations() {
    try {
        console.log("Starting migrations...");
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS USER_SEARCHES (
                id SERIAL PRIMARY KEY,
                user_id INT,
                search_term VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Created USER_SEARCHES");

        await pool.query('DROP TABLE IF EXISTS SEAT_RESERVATIONS CASCADE');
        await pool.query('DROP TABLE IF EXISTS STUDY_SEATS CASCADE');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS STUDY_SEATS (
                seat_id SERIAL PRIMARY KEY,
                room_name VARCHAR(50),
                seat_label VARCHAR(50),
                side VARCHAR(20)
            )
        `);
        console.log("Created STUDY_SEATS");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS SEAT_RESERVATIONS (
                id SERIAL PRIMARY KEY,
                seat_id INT,
                user_id INT,
                start_time TIMESTAMP,
                end_time TIMESTAMP,
                status VARCHAR(20) DEFAULT 'Active'
            )
        `);
        console.log("Created SEAT_RESERVATIONS");

        // Seed 12 seats for Digital Library if not exists
        const checkSeats = await pool.query(`SELECT COUNT(*) FROM STUDY_SEATS WHERE room_name = 'Digital Library'`);
        if (parseInt(checkSeats.rows[0].count) === 0) {
            for (let i = 1; i <= 6; i++) {
                await pool.query(`INSERT INTO STUDY_SEATS (room_name, seat_label, side) VALUES ('Digital Library', 'Seat ${i}', 'Left')`);
            }
            for (let i = 7; i <= 12; i++) {
                await pool.query(`INSERT INTO STUDY_SEATS (room_name, seat_label, side) VALUES ('Digital Library', 'Seat ${i}', 'Right')`);
            }
            console.log("Seeded 12 Digital Library seats.");
        }

        console.log("Migrations complete.");
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

runMigrations();
