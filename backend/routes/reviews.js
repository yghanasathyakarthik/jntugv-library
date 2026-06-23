const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/reviews/:bookId
router.get('/:bookId', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.review_id, r.rating, r.review_text, r.created_at, u.name as reviewer_name
            FROM REVIEWS r
            JOIN USERS u ON r.student_id = u.id
            WHERE r.book_id = $1
            ORDER BY r.created_at DESC
        `, [req.params.bookId]);
        
        const avgResult = await pool.query(`
            SELECT ROUND(AVG(rating), 1) as avg_rating, COUNT(*) as total_reviews
            FROM REVIEWS
            WHERE book_id = $1
        `, [req.params.bookId]);

        res.json({
            reviews: result.rows,
            stats: avgResult.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// POST /api/reviews
router.post('/', async (req, res) => {
    try {
        const { book_id, student_id, rating, review_text } = req.body;
        
        await pool.query(`
            INSERT INTO REVIEWS (book_id, student_id, rating, review_text)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (book_id, student_id) DO UPDATE 
            SET rating = EXCLUDED.rating, review_text = EXCLUDED.review_text
        `, [book_id, student_id, rating, review_text]);

        await pool.query('UPDATE USERS SET score = score + 15 WHERE id = $1', [student_id]);

        res.json({ success: true, message: 'Review added and +15 points awarded!' });
    } catch (err) {
        console.error("Review error:", err);
        res.status(500).json({ error: 'Failed to submit review' });
    }
});

module.exports = router;
