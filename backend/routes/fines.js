const express = require('express');
const router = express.Router();
const pool = require('../db');

// Calculate fines and send reminder notifications
router.post('/calculate', async (req, res) => {
    try {
        // Find all issuances that haven't been returned
        const result = await pool.query(`
            SELECT i.issuance_id, i.asset_id, i.user_identifier_string, i.expected_return_date, 
                   b.title, u.id as user_id
            FROM ISSUANCE_LOGS i
            JOIN BOOK_ASSET_MAP a ON i.asset_id = a.asset_id
            JOIN BOOKS b ON a.book_id = b.book_id
            JOIN USERS u ON i.user_identifier_string = u.barcode_id
            WHERE i.actual_return_timestamp IS NULL
        `);

        let notificationsSent = 0;
        
        for (const log of result.rows) {
            const expectedDate = new Date(log.expected_return_date);
            const currentDate = new Date();
            const timeDiff = expectedDate - currentDate;
            const daysUntilDue = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            
            // If the book is due exactly 3 days from now, send a reminder
            if (daysUntilDue === 3) {
                // Check if we already sent a reminder for this issuance to avoid spam
                const notifCheck = await pool.query(
                    "SELECT 1 FROM NOTIFICATIONS WHERE recipient_id = $1 AND title LIKE $2",
                    [log.user_id, `%${log.asset_id}%`]
                );
                
                if (notifCheck.rows.length === 0) {
                    await pool.query(
                        "INSERT INTO NOTIFICATIONS (recipient_id, title, message, type) VALUES ($1, $2, $3, 'warning')",
                        [
                            log.user_id, 
                            `Upcoming Return: ${log.asset_id}`, 
                            `Reminder: The book "${log.title}" is due in exactly 3 days. Please return it to avoid fines.`
                        ]
                    );
                    notificationsSent++;
                }
            }
        }
        
        res.json({ message: 'Fines and notifications processed', notificationsSent });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error processing fines' });
    }
});

// Get all students with fines or overdue books
router.get('/all', async (req, res) => {
    try {
        // Query to get all students who either have recorded fines or currently overdue books
        // Since we calculate exact fines on return, for currently overdue books we calculate the running fine.
        
        const result = await pool.query(`
            SELECT u.id, u.barcode_id, u.name, u.department, u.roll_no, u.semester, COALESCE(u.fines, 0) as paid_or_locked_fines,
            (
                SELECT json_agg(json_build_object(
                    'title', b.title,
                    'asset_id', i.asset_id,
                    'expected_return_date', i.expected_return_date,
                    'days_overdue', GREATEST(0, EXTRACT(DAY FROM CURRENT_TIMESTAMP - i.expected_return_date)),
                    'running_fine', GREATEST(0, EXTRACT(DAY FROM CURRENT_TIMESTAMP - i.expected_return_date)) * 10
                ))
                FROM ISSUANCE_LOGS i
                JOIN BOOK_ASSET_MAP a ON i.asset_id = a.asset_id
                JOIN BOOKS b ON a.book_id = b.book_id
                WHERE i.user_identifier_string = u.barcode_id 
                  AND i.actual_return_timestamp IS NULL 
                  AND i.expected_return_date < CURRENT_TIMESTAMP
            ) as overdue_books
            FROM USERS u
            WHERE u.fines > 0 OR EXISTS (
                SELECT 1 FROM ISSUANCE_LOGS i2
                WHERE i2.user_identifier_string = u.barcode_id 
                  AND i2.actual_return_timestamp IS NULL 
                  AND i2.expected_return_date < CURRENT_TIMESTAMP
            )
        `);

        // Calculate total current fine (locked fines + running fines)
        const students = result.rows.map(s => {
            const overdueBooks = s.overdue_books || [];
            const runningFinesTotal = overdueBooks.reduce((acc, book) => acc + (book.running_fine || 0), 0);
            return {
                ...s,
                total_current_fine: parseFloat(s.paid_or_locked_fines) + runningFinesTotal
            };
        });

        res.json(students);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching fines' });
    }
});

module.exports = router;
