const pool = require('./db');

async function mock() {
    try {
        const barcode_id = '20BQ1A05I2'; // Let's find an existing student
        const studentRes = await pool.query("SELECT * FROM USERS WHERE role = 'student' LIMIT 1");
        if (studentRes.rows.length === 0) return console.log("No student found");
        const student = studentRes.rows[0].barcode_id;

        // Get two available books
        const bookRes = await pool.query("SELECT * FROM BOOK_ASSET_MAP a JOIN BOOKS b ON a.book_id = b.book_id WHERE b.status = 'Available' LIMIT 2");
        if (bookRes.rows.length < 2) return console.log("Not enough available books");
        const asset1 = bookRes.rows[0].asset_id;
        const asset2 = bookRes.rows[1].asset_id;

        // Issue book 1 (20 days ago) - Due 6 days ago
        await pool.query(
            "INSERT INTO ISSUANCE_LOGS (asset_id, user_identifier_string, issued_timestamp, expected_return_date) VALUES ($1, $2, CURRENT_TIMESTAMP - INTERVAL '20 days', CURRENT_TIMESTAMP - INTERVAL '6 days')", 
            [asset1, student]
        );
        // Issue book 2 (11 days ago) - Due in 3 days (exactly)
        await pool.query(
            "INSERT INTO ISSUANCE_LOGS (asset_id, user_identifier_string, issued_timestamp, expected_return_date) VALUES ($1, $2, CURRENT_TIMESTAMP - INTERVAL '11 days', CURRENT_TIMESTAMP + INTERVAL '3 days')", 
            [asset2, student]
        );
        
        // Update books to issued
        await pool.query("UPDATE BOOKS SET status = 'Issued' WHERE book_id IN ($1, $2)", [bookRes.rows[0].book_id, bookRes.rows[1].book_id]);

        console.log("Mock data inserted successfully for student:", student);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
mock();
