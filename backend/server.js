const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Library API is running' });
});

// We will require and use our routes here
const booksRoutes = require('./routes/books');
const analyticsRoutes = require('./routes/analytics');
const authRoutes = require('./routes/auth');
const issuanceRoutes = require('./routes/issuance');
const usersRoutes = require('./routes/users');
const barcodeRoutes = require('./routes/barcode');
const appealsRoutes = require('./routes/appeals');
const reservationsRoutes = require('./routes/reservations');
const notificationsRoutes = require('./routes/notifications');
const aiRoutes = require('./routes/ai');
const gamificationRoutes = require('./routes/gamification');
const recommendationsRoutes = require('./routes/recommendations');
const reviewsRoutes = require('./routes/reviews');
const spacesRoutes = require('./routes/spaces');

app.use('/api/books', booksRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/issuance', issuanceRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/barcode', barcodeRoutes);
app.use('/api/appeals', appealsRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/spaces', spacesRoutes);

const pool = require('./db');
app.listen(PORT, async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS study_seats (
                seat_id VARCHAR(50) PRIMARY KEY,
                zone VARCHAR(50),
                status VARCHAR(20) DEFAULT 'available',
                occupied_by VARCHAR(50),
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        const count = await pool.query(`SELECT count(*) FROM study_seats`);
        if (parseInt(count.rows[0].count) === 0) {
            const zones = [
                { name: 'Quiet Zone', prefix: 'QuietZone-A', count: 4 },
                { name: 'Collaboration Space', prefix: 'Collab-B', count: 4 },
                { name: 'Focus Pods', prefix: 'FocusPod-C', count: 2 }
            ];
            for (const zone of zones) {
                for (let i = 1; i <= zone.count; i++) {
                    await pool.query(
                        `INSERT INTO study_seats (seat_id, zone, status) VALUES ($1, $2, 'available')`,
                        [`${zone.prefix}${i}`, zone.name]
                    );
                }
            }
        }
        await pool.query(`
            CREATE TABLE IF NOT EXISTS book_swipes (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                book_id INTEGER,
                action VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, book_id)
            );
        `);
        console.log("Database tables verified/created.");
    } catch (e) {
        console.error("Failed to init tables:", e.message);
    }
    console.log(`Server running on port ${PORT}`);
});
