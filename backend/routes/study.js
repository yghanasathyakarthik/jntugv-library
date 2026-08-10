const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all seats and current reservations
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.seat_id, s.room_name, s.seat_label, s.side,
                   r.id as reservation_id, r.user_id, r.start_time, r.end_time
            FROM STUDY_SEATS s
            LEFT JOIN SEAT_RESERVATIONS r ON s.seat_id = r.seat_id 
                 AND r.status = 'Active' 
                 AND r.end_time > CURRENT_TIMESTAMP
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching seats' });
    }
});

// Reserve a seat
router.post('/reserve', async (req, res) => {
    try {
        const { seat_id, user_id } = req.body;
        if (!seat_id || !user_id) return res.status(400).json({ error: 'Missing parameters' });

        // Check if already reserved
        const check = await pool.query(`
            SELECT * FROM SEAT_RESERVATIONS 
            WHERE seat_id = $1 AND status = 'Active' AND end_time > CURRENT_TIMESTAMP
        `, [seat_id]);
        if (check.rows.length > 0) {
            return res.status(400).json({ error: 'Seat is currently reserved by someone else.' });
        }

        // Must be at most 10 minutes from now if they are "going there"
        // In our logic, the reservation starts immediately, and ends in 1 hour
        const start = new Date();
        const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour later

        const insert = await pool.query(`
            INSERT INTO SEAT_RESERVATIONS (seat_id, user_id, start_time, end_time, status)
            VALUES ($1, $2, $3, $4, 'Active') RETURNING *
        `, [seat_id, user_id, start, end]);

        res.json(insert.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error reserving seat' });
    }
});

module.exports = router;
