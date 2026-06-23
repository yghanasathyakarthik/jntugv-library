const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const result = await pool.query('SELECT id, name, email, password, role, barcode_id, fines, profile_photo, department, roll_no, semester FROM USERS WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (password !== user.password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name, barcode_id: user.barcode_id, department: user.department, semester: user.semester }, 
            JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                barcode_id: user.barcode_id,
                department: user.department,
                roll_no: user.roll_no,
                semester: user.semester
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, department, roll_no, semester } = req.body;
        
        // Check if user exists
        const check = await pool.query('SELECT * FROM USERS WHERE email = $1', [email]);
        if (check.rows.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const checkRoll = await pool.query('SELECT * FROM USERS WHERE roll_no = $1', [roll_no]);
        if (checkRoll.rows.length > 0 && roll_no) {
            return res.status(400).json({ error: 'Roll number already registered' });
        }

        // Generate barcode ID
        const barcodeId = 'STU-' + Math.floor(10000 + Math.random() * 90000);

        const result = await pool.query(
            'INSERT INTO USERS (name, email, password, role, barcode_id, department, roll_no, semester) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, email, role, barcode_id, department, roll_no, semester',
            [name, email, password, 'student', barcodeId, department, roll_no, semester]
        );

        const newUser = result.rows[0];
        
        const token = jwt.sign(
            { id: newUser.id, role: newUser.role, name: newUser.name, barcode_id: newUser.barcode_id, department: newUser.department, semester: newUser.semester }, 
            JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.status(201).json({
            token,
            user: newUser
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

module.exports = router;
