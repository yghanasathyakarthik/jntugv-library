const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/recommendations/syllabus/:userId
router.get('/syllabus/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        // Fetch user's department and semester
        const userRes = await pool.query('SELECT department, semester FROM USERS WHERE id = $1', [userId]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        const user = userRes.rows[0];

        if (!user.department || !user.semester) {
            return res.json([]); // No recommendations if profile is incomplete
        }

        // Fetch books that match the student's semester and department
        const result = await pool.query(`
            SELECT b.book_id, b.title, b.isbn_number as isbn, b.edition, b.status, auth.first_name || ' ' || auth.last_name AS author, c.name_slug as category
            FROM BOOKS b
            LEFT JOIN AUTHORS auth ON b.author_id = auth.author_id
            LEFT JOIN CATEGORIES c ON b.category_id = c.category_id
            WHERE c.department_tag = $1 AND b.semester_tag = $2
            LIMIT 10
        `, [user.department, user.semester]);
        
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching syllabus recommendations' });
    }
});

module.exports = router;
