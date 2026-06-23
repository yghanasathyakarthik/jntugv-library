const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/spaces
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.seat_id, s.zone, s.status, s.last_updated, u.name as occupied_by_name
            FROM STUDY_SEATS s
            LEFT JOIN USERS u ON s.occupied_by = u.barcode_id
            ORDER BY s.seat_id ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Spaces GET Error:", err);
        res.status(500).json({ error: 'Failed to fetch study spaces' });
    }
});

// POST /api/spaces/occupy
router.post('/occupy', async (req, res) => {
    const { seat_id, barcode_id } = req.body;
    try {
        const check = await pool.query('SELECT status FROM STUDY_SEATS WHERE seat_id = $1', [seat_id]);
        if (check.rows.length === 0) return res.status(404).json({ error: 'Seat not found' });
        if (check.rows[0].status === 'occupied') return res.status(400).json({ error: 'Seat is already occupied' });

        await pool.query(`
            UPDATE STUDY_SEATS 
            SET status = 'occupied', occupied_by = $1, last_updated = CURRENT_TIMESTAMP
            WHERE seat_id = $2
        `, [barcode_id, seat_id]);
        res.json({ message: 'Seat successfully occupied' });
    } catch (err) {
        console.error("Spaces Occupy Error:", err);
        res.status(500).json({ error: 'Failed to occupy seat' });
    }
});

// POST /api/spaces/leave
router.post('/leave', async (req, res) => {
    const { seat_id, barcode_id } = req.body;
    try {
        await pool.query(`
            UPDATE STUDY_SEATS 
            SET status = 'available', occupied_by = NULL, last_updated = CURRENT_TIMESTAMP
            WHERE seat_id = $1 AND occupied_by = $2
        `, [seat_id, barcode_id]);
        res.json({ message: 'Seat successfully left' });
    } catch (err) {
        console.error("Spaces Leave Error:", err);
        res.status(500).json({ error: 'Failed to leave seat' });
    }
});

module.exports = router;
