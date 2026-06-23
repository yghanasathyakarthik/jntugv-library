const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const [booksRes, catRes, popRes, auditRes, liveRes, transactingRes, issuanceStats] = await Promise.all([
            pool.query(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as available,
                    SUM(CASE WHEN status = 'Issued' THEN 1 ELSE 0 END) as issued,
                    SUM(CASE WHEN status IN ('Missing', 'Reserved') THEN 1 ELSE 0 END) as other
                FROM BOOKS
            `),
            pool.query(`
                SELECT c.name_slug as name, COUNT(b.book_id) as count
                FROM CATEGORIES c
                LEFT JOIN BOOKS b ON c.category_id = b.category_id
                GROUP BY c.category_id
            `),
            pool.query(`
                SELECT title, borrow_count
                FROM BOOKS
                ORDER BY borrow_count DESC
                LIMIT 5
            `),
            pool.query(`
                SELECT a.audit_id, b.title, a.condition_status, a.verified_timestamp
                FROM INVENTORY_AUDITS a
                JOIN BOOK_ASSET_MAP m ON a.asset_id = m.asset_id
                JOIN BOOKS b ON m.book_id = b.book_id
                ORDER BY a.verified_timestamp DESC
                LIMIT 10
            `),
            pool.query(`
                SELECT COUNT(*) as live_users 
                FROM USERS 
                WHERE last_active_at >= NOW() - INTERVAL '5 minutes'
            `),
            pool.query(`
                SELECT COUNT(DISTINCT user_identifier_string) as transacting_users
                FROM ISSUANCE_LOGS
                WHERE DATE(issued_timestamp) = CURRENT_DATE 
                   OR DATE(actual_return_timestamp) = CURRENT_DATE
            `),
            pool.query(`
                WITH dates AS (
                    SELECT current_date - i AS date
                    FROM generate_series(0, 29) i
                )
                SELECT 
                    TO_CHAR(d.date, 'DD Mon') as label,
                    COUNT(i.log_id) as issued,
                    COUNT(r.log_id) as returned
                FROM dates d
                LEFT JOIN ISSUANCE_LOGS i ON DATE(i.issued_timestamp) = d.date
                LEFT JOIN ISSUANCE_LOGS r ON DATE(r.actual_return_timestamp) = d.date
                GROUP BY d.date
                ORDER BY d.date ASC
            `)
        ]);

        res.json({
            totalBooks: parseInt(booksRes.rows[0].total) || 0,
            availableBooks: parseInt(booksRes.rows[0].available) || 0,
            issuedBooks: parseInt(booksRes.rows[0].issued) || 0,
            missingBooks: parseInt(booksRes.rows[0].other) || 0,
            popularCategories: catRes.rows.map(r => ({ name: r.name, count: parseInt(r.count) })),
            mostStudiedBooks: popRes.rows.map(r => ({ title: r.title, count: parseInt(r.borrow_count) })),
            stockIssues: auditRes.rows,
            liveUsers: parseInt(liveRes.rows[0].live_users) || 0,
            transactingUsers: parseInt(transactingRes.rows[0].transacting_users) || 0,
            monthlyIssuance: issuanceStats.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching analytics' });
    }
});

// GET /api/analytics/predictive
router.get('/predictive', async (req, res) => {
    try {
        const query = await pool.query(`
            SELECT c.name_slug as category, SUM(b.borrow_count) as current_demand
            FROM BOOKS b
            JOIN CATEGORIES c ON b.category_id = c.category_id
            GROUP BY c.name_slug
        `);

        const predictions = query.rows.map(row => {
            const current = parseInt(row.current_demand) || 0;
            const growthFactor = 1.1 + (Math.random() * 0.4); 
            return {
                category: row.category,
                current_demand: current,
                predicted_demand: Math.round(current * growthFactor)
            };
        });

        res.json(predictions);
    } catch (err) {
        console.error("Predictive Analytics Error:", err);
        res.status(500).json({ error: 'Failed to generate predictions' });
    }
});

module.exports = router;
