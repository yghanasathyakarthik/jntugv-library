const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all appeals (for librarian)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT a.appeal_id, a.student_id, u.name as student_name, u.barcode_id as student_barcode,
                   a.appeal_type, a.description, a.status, a.created_at
            FROM APPEALS a
            JOIN USERS u ON a.student_id = u.id
            ORDER BY a.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching appeals' });
    }
});

// Get appeals for a specific student
router.get('/student/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const result = await pool.query(`
            SELECT appeal_id, appeal_type, description, status, created_at
            FROM APPEALS
            WHERE student_id = $1
            ORDER BY created_at DESC
        `, [studentId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching student appeals' });
    }
});

// Create a new appeal
router.post('/', async (req, res) => {
    try {
        const { student_id, appeal_type, description } = req.body;
        
        if (!student_id || !appeal_type || !description) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await pool.query(`
            INSERT INTO APPEALS (student_id, appeal_type, description)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [student_id, appeal_type, description]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error creating appeal' });
    }
});

// Update an appeal status (Approve/Reject)
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'Approved' or 'Rejected'
        
        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const result = await pool.query(`
            UPDATE APPEALS
            SET status = $1
            WHERE appeal_id = $2
            RETURNING *
        `, [status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Appeal not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error updating appeal' });
    }
});

module.exports = router;
