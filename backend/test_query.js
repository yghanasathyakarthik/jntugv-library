require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool();

async function test() {
    try {
        console.log('Testing query 1...');
        const res = await pool.query(`
            WITH dates AS (
                SELECT (CURRENT_DATE - s.a) AS date
                FROM generate_series(0, 29) AS s(a)
            )
            SELECT * FROM dates LIMIT 2;
        `);
        console.log('Success 1:', res.rows);

        console.log('Testing full query...');
        const res2 = await pool.query(`
            WITH dates AS (
                SELECT (CURRENT_DATE - s.a) AS date
                FROM generate_series(0, 29) AS s(a)
            )
            SELECT 
                TO_CHAR(d.date, 'DD Mon') as label,
                COUNT(i.log_id) as issued,
                COUNT(r.log_id) as returned
            FROM dates d
            LEFT JOIN ISSUANCE_LOGS i ON DATE(i.issued_timestamp) = d.date
            LEFT JOIN ISSUANCE_LOGS r ON DATE(r.actual_return_timestamp) = d.date
            GROUP BY d.date
            ORDER BY d.date ASC
        `);
        console.log('Success full query!', res2.rows.length, 'rows returned.');
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        pool.end();
    }
}
test();
