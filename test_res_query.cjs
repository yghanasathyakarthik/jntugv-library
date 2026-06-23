const pool = require('./backend/db');
pool.query(`
    SELECT r.reservation_id, r.book_id, b.title as book_title, 'Unknown' as author,
           r.status, r.created_at, r.estimated_availability,
           (SELECT COUNT(*) FROM RESERVATIONS r2 WHERE r2.book_id = r.book_id AND r2.created_at < r.created_at AND r2.status = 'Pending') as queue_position
    FROM RESERVATIONS r
    JOIN BOOKS b ON r.book_id = b.book_id
    WHERE r.student_id = 6
    ORDER BY r.created_at DESC
`)
.then(res => {
    console.log("Joined:", res.rows);
    return pool.query(`SELECT * FROM RESERVATIONS WHERE student_id = 6`);
})
.then(res => {
    console.log("Raw:", res.rows);
    process.exit(0);
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
