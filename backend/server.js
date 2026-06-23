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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
