const express = require('express');
const router = express.Router();
const pool = require('../db');

// Admin: Get all users
router.get('/', async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name, email, role, barcode_id, fines, score, profile_photo FROM USERS ORDER BY role, name");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Student: Get leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name, barcode_id, score, profile_photo FROM USERS WHERE role = 'student' ORDER BY score DESC, name ASC LIMIT 5");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Librarian: Get student profile by barcode
router.get('/barcode/:barcodeId', async (req, res) => {
    try {
        const { barcodeId } = req.params;
        const result = await pool.query("SELECT id, name, email, role, barcode_id, fines, score, profile_photo FROM USERS WHERE barcode_id = $1", [barcodeId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Upload profile photo
router.put('/:id/photo', async (req, res) => {
    try {
        const { photo } = req.body;
        await pool.query('UPDATE USERS SET profile_photo = $1 WHERE barcode_id = $2 OR id::text = $2', [photo, req.params.id]);
        res.json({ message: 'Profile photo updated successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error updating photo' });
    }
});

// Student/Librarian: Get borrowing history by barcode
router.get('/:barcodeId/history', async (req, res) => {
    try {
        const { barcodeId } = req.params;
        const result = await pool.query(`
            SELECT i.issuance_id as id, i.issued_timestamp as issued_date, i.actual_return_timestamp as return_date, i.expected_return_date as due_date,
            CASE WHEN i.actual_return_timestamp IS NULL THEN 'Issued' ELSE 'Returned' END as status, 
            b.title, b.book_id, b.isbn_number AS isbn, b.total_copies, b.available_copies,
            auth.first_name || ' ' || auth.last_name AS author,
            c.name_slug AS category,
            pl.room_number AS room, pl.section_name AS section, pl.rack_number AS rack, pl.shelf_number AS shelf, pl.position_grid_index AS position
            FROM ISSUANCE_LOGS i
            JOIN BOOK_ASSET_MAP a ON i.asset_id = a.asset_id
            JOIN BOOKS b ON a.book_id = b.book_id
            LEFT JOIN AUTHORS auth ON b.author_id = auth.author_id
            LEFT JOIN CATEGORIES c ON b.category_id = c.category_id
            LEFT JOIN PHYSICAL_LOCATIONS pl ON a.location_id = pl.location_id
            WHERE i.user_identifier_string = $1
            ORDER BY i.issued_timestamp DESC
        `, [barcodeId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Student: Pay fines simulation
router.post('/barcode/:barcodeId/pay-fines', async (req, res) => {
    try {
        const { barcodeId } = req.params;
        // Reset fines to 0 and grant a small score boost for being responsible
        await pool.query("UPDATE USERS SET fines = 0, score = score + 5 WHERE barcode_id = $1", [barcodeId]);
        res.json({ message: 'Fines successfully cleared! Score increased.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// User: Ping to update last_active_at
router.post('/:id/ping', async (req, res) => {
    try {
        await pool.query("UPDATE USERS SET last_active_at = CURRENT_TIMESTAMP WHERE id = $1", [req.params.id]);
        res.json({ message: 'Ping successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// User: Update profile (semester)
router.put('/:id/profile', async (req, res) => {
    try {
        const { semester } = req.body;
        const result = await pool.query(
            "UPDATE USERS SET semester = $1 WHERE id = $2 RETURNING id, name, email, role, barcode_id, department, roll_no, semester",
            [semester, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'Profile updated successfully!', user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error updating profile' });
    }
});
// Matchmaking: Find study groups based on department/semester
router.get('/matchmaking/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userRes = await pool.query("SELECT department, semester FROM USERS WHERE id = $1", [userId]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        
        const { department, semester } = userRes.rows[0];
        if (!department) return res.json([]);

        // Find users in the same department
        const peers = await pool.query(`
            SELECT id, name, department, semester, score, profile_photo 
            FROM USERS 
            WHERE department = $1 AND role = 'student' AND id != $2
            ORDER BY (CASE WHEN semester = $3 THEN 1 ELSE 0 END) DESC, score DESC
            LIMIT 5
        `, [department, userId, semester]);
        
        res.json(peers.rows);
    } catch (err) {
        console.error("Matchmaking Error:", err);
        res.status(500).json({ error: 'Server error during matchmaking' });
    }
});

module.exports = router;
