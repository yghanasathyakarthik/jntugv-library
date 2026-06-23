const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create a new reservation
router.post('/', async (req, res) => {
    try {
        const { book_id, student_id } = req.body;
        
        if (!book_id || !student_id) {
            return res.status(400).json({ error: 'book_id and student_id are required' });
        }

        // Optional: check if book is already reserved by same student or if they have max reservations
        
        const result = await pool.query(`
            INSERT INTO RESERVATIONS (book_id, student_id, status)
            VALUES ($1, $2, 'Pending')
            RETURNING *
        `, [book_id, student_id]);

        // Also update the book status to 'Reserved' (if you want this strictly tracked at the book level, otherwise maybe only 'Available' copies count drops)
        // Wait, multiple copies exist. Just let the librarian handle it.

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error creating reservation' });
    }
});

// Get all reservations (for librarian)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.reservation_id, r.book_id, b.title as book_title, b.author_id, 'Unknown' as author,
                   r.student_id, u.name as student_name, u.barcode_id as student_barcode,
                   r.status, r.created_at, r.estimated_availability
            FROM RESERVATIONS r
            JOIN BOOKS b ON r.book_id = b.book_id
            
            JOIN USERS u ON r.student_id = u.id
            ORDER BY r.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching all reservations' });
    }
});

// Get reservations for a specific student
router.get('/student/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const result = await pool.query(`
            SELECT r.reservation_id, r.book_id, b.title as book_title, 'Unknown' as author,
                   r.status, r.created_at, r.estimated_availability,
                   (SELECT COUNT(*) FROM RESERVATIONS r2 WHERE r2.book_id = r.book_id AND r2.created_at < r.created_at AND r2.status = 'Pending') as queue_position
            FROM RESERVATIONS r
            JOIN BOOKS b ON r.book_id = b.book_id
            
            WHERE r.student_id = $1
            ORDER BY r.created_at DESC
        `, [studentId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching student reservations' });
    }
});

// Update a reservation status (Pending -> Ready, etc.)
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 
        
        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const result = await pool.query(`
            UPDATE RESERVATIONS
            SET status = $1
            WHERE reservation_id = $2
            RETURNING *
        `, [status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Reservation not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error updating reservation' });
    }
});

module.exports = router;
