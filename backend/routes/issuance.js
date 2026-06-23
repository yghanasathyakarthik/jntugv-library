const express = require('express');
const router = express.Router();
const pool = require('../db');

// Issue a book via Asset Barcode and Student Barcode
router.post('/issue', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { asset_id, barcode_id } = req.body;

        // Find student
        const studentRes = await client.query('SELECT * FROM USERS WHERE barcode_id = $1 AND role = $2', [barcode_id, 'student']);
        if (studentRes.rows.length === 0) return res.status(404).json({ error: 'Student barcode not found' });
        const student = studentRes.rows[0];

        // Check fines
        if (student.fines > 0) {
            return res.status(403).json({ error: `Student has unpaid fines of $${student.fines}. Issuance blocked.` });
        }

        // Check asset availability
        const assetRes = await client.query('SELECT b.status, b.book_id, b.available_copies FROM BOOK_ASSET_MAP a JOIN BOOKS b ON a.book_id = b.book_id WHERE a.asset_id = $1', [asset_id]);
        if (assetRes.rows.length === 0) return res.status(404).json({ error: 'Book asset barcode not found' });
        
        // Check if this specific asset is already issued
        const checkLog = await client.query('SELECT * FROM ISSUANCE_LOGS WHERE asset_id = $1 AND actual_return_timestamp IS NULL', [asset_id]);
        if (checkLog.rows.length > 0) return res.status(400).json({ error: 'This specific book asset is already issued.' });
        if (assetRes.rows[0].available_copies <= 0) return res.status(400).json({ error: 'No available copies for this book.' });

        const book_id = assetRes.rows[0].book_id;

        // Update book status and increment borrow count
        await client.query("UPDATE BOOKS SET available_copies = available_copies - 1, borrow_count = borrow_count + 1 WHERE book_id = $1", [book_id]);
        await client.query("UPDATE BOOKS SET status = 'Issued' WHERE book_id = $1 AND available_copies = 0", [book_id]);
        
        // Create issuance log with 15 day return expectation
        await client.query(
            "INSERT INTO ISSUANCE_LOGS (asset_id, user_identifier_string, expected_return_date) VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '15 days')", 
            [asset_id, barcode_id]
        );

        // Gamification: +10 points for borrowing
        await client.query('UPDATE USERS SET score = score + 10 WHERE barcode_id = $1', [barcode_id]);

        await client.query('COMMIT');
        res.json({ message: 'Book issued successfully to ' + student.name });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
});

// Return a book
router.post('/return', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { asset_id, barcode_id } = req.body;

        if (!barcode_id) return res.status(400).json({ error: 'Student barcode is required to verify the return.' });

        const logRes = await client.query('SELECT user_identifier_string FROM ISSUANCE_LOGS WHERE asset_id = $1 AND actual_return_timestamp IS NULL', [asset_id]);
        if (logRes.rows.length === 0) return res.status(400).json({ error: 'This book is not currently issued.' });
        
        if (logRes.rows[0].user_identifier_string !== barcode_id) {
            return res.status(403).json({ error: 'Return denied: The scanned student ID does not match the original borrower.' });
        }

        const assetRes = await client.query('SELECT b.book_id FROM BOOK_ASSET_MAP a JOIN BOOKS b ON a.book_id = b.book_id WHERE a.asset_id = $1', [asset_id]);
        if (assetRes.rows.length === 0) return res.status(404).json({ error: 'Asset barcode not found' });
        const book_id = assetRes.rows[0].book_id;

        await client.query("UPDATE BOOKS SET available_copies = available_copies + 1, status = 'Available' WHERE book_id = $1", [book_id]);
        await client.query("UPDATE ISSUANCE_LOGS SET actual_return_timestamp = CURRENT_TIMESTAMP WHERE asset_id = $1 AND actual_return_timestamp IS NULL", [asset_id]);

        // Gamification: +20 points for returning
        await client.query('UPDATE USERS SET score = score + 20 WHERE barcode_id = $1', [barcode_id]);

        await client.query('COMMIT');
        res.json({ message: 'Book returned successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
});

// Get all issuance logs for Admin Data Explorer
router.get('/all', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT i.issuance_id, i.asset_id, i.user_identifier_string, 
                   i.issued_timestamp, i.expected_return_date, i.actual_return_timestamp,
                   u.name as student_name, b.title as book_title
            FROM ISSUANCE_LOGS i
            JOIN USERS u ON i.user_identifier_string = u.barcode_id
            JOIN BOOK_ASSET_MAP a ON i.asset_id = a.asset_id
            JOIN BOOKS b ON a.book_id = b.book_id
            ORDER BY i.issued_timestamp DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


// Get issuance logs for a specific student
router.get('/student/:barcodeId', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT i.issuance_id as id, i.asset_id, i.issued_timestamp as issue_date, 
                   i.expected_return_date as due_date, i.actual_return_timestamp as return_date,
                   CASE WHEN i.actual_return_timestamp IS NULL THEN 'Issued' ELSE 'Returned' END as status,
                   b.title, b.isbn_number as isbn
            FROM ISSUANCE_LOGS i
            JOIN BOOK_ASSET_MAP a ON i.asset_id = a.asset_id
            JOIN BOOKS b ON a.book_id = b.book_id
            WHERE i.user_identifier_string = $1
            ORDER BY i.issued_timestamp DESC
        `, [req.params.barcodeId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

