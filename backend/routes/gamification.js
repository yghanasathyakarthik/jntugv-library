const express = require('express');
const router = express.Router();
const pool = require('../db');

// Helper to determine badge
const getBadge = (score) => {
    if (score >= 301) return { name: 'Library Champion', icon: '🥇' };
    if (score >= 151) return { name: 'Scholar', icon: '🥈' };
    return { name: 'Reader', icon: '🥉' };
};

// Haversine distance helper (returns distance in meters)
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
};

const LIBRARY_LAT = 18.14985080332255;
const LIBRARY_LON = 83.3760692957861;
const RADIUS_METERS = 50;

// POST /api/gamification/ping-location
router.post('/ping-location', async (req, res) => {
    const { userId, lat, lon } = req.body;
    if (!userId || !lat || !lon) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    try {
        const distance = getDistance(lat, lon, LIBRARY_LAT, LIBRARY_LON);
        if (distance <= RADIUS_METERS) {
            // User is in the library! Add 1 minute to library_time_minutes and 1 point to score.
            await pool.query(`
                UPDATE USERS 
                SET library_time_minutes = COALESCE(library_time_minutes, 0) + 1,
                    score = COALESCE(score, 0) + 1,
                    last_active_at = CURRENT_TIMESTAMP
                WHERE id = $1
            `, [userId]);
            res.json({ inLibrary: true, pointsAwarded: 1, distance });
        } else {
            res.json({ inLibrary: false, pointsAwarded: 0, distance });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to process location ping' });
    }
});

// GET /api/gamification/leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.id, u.name, u.score, COALESCE(u.library_time_minutes, 0) as library_time_minutes,
                   COUNT(i.issuance_id) as total_issuances,
                   COUNT(i.actual_return_timestamp) as total_returns
            FROM USERS u
            LEFT JOIN ISSUANCE_LOGS i ON u.barcode_id = i.user_identifier_string
            WHERE u.role = 'student'
            GROUP BY u.id
            ORDER BY u.score DESC
            LIMIT 10
        `);
        const leaderboard = result.rows.map(user => ({
            ...user,
            badge: getBadge(user.score)
        }));
        res.json(leaderboard);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// GET /api/gamification/leaderboard/departments
router.get('/leaderboard/departments', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT department, SUM(score) as total_score, COUNT(id) as student_count
            FROM USERS
            WHERE role = 'student' AND department IS NOT NULL
            GROUP BY department
            ORDER BY total_score DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch department leaderboard' });
    }
});

// GET /api/gamification/user/:userId
router.get('/user/:userId', async (req, res) => {
    try {
        const result = await pool.query('SELECT score, COALESCE(library_time_minutes, 0) as library_time_minutes FROM USERS WHERE id = $1', [req.params.userId]);
        if(result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        const user = result.rows[0];
        res.json({ score: user.score, library_time_minutes: user.library_time_minutes, badge: getBadge(user.score) });
    } catch(err) {
        res.status(500).json({ error: 'Failed to fetch user score' });
    }
});
// POST /api/gamification/focus-session
router.post('/focus-session', async (req, res) => {
    try {
        const { userId, minutes } = req.body;
        // 50 points per 25-minute session
        const points = Math.floor(minutes / 25) * 50;
        if (points > 0) {
            await pool.query(`
                UPDATE USERS 
                SET score = COALESCE(score, 0) + $1 
                WHERE id = $2
            `, [points, userId]);
        }
        res.json({ message: 'Focus session logged!', pointsAwarded: points });
    } catch (err) {
        console.error("Focus Session Error:", err);
        res.status(500).json({ error: 'Failed to log focus session' });
    }
});

module.exports = router;
