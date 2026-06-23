const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create a new notification
router.post('/', async (req, res) => {
    try {
        const { recipient_id, title, message, type } = req.body;
        
        if (!title || !message) {
            return res.status(400).json({ error: 'title and message are required' });
        }

        const result = await pool.query(`
            INSERT INTO NOTIFICATIONS (recipient_id, title, message, type)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [recipient_id || null, title, message, type || 'info']);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error creating notification' });
    }
});

// Get notifications for a specific student (including global broadcasts)
router.get('/student/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const result = await pool.query(`
            SELECT * FROM NOTIFICATIONS
            WHERE recipient_id = $1 OR recipient_id IS NULL
            ORDER BY created_at DESC
        `, [studentId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching notifications' });
    }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            UPDATE NOTIFICATIONS
            SET is_read = TRUE
            WHERE notification_id = $1
            RETURNING *
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error updating notification' });
    }
});

module.exports = router;
