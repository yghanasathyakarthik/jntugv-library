const pool = require('./backend/db');

pool.query("INSERT INTO RESERVATIONS (book_id, student_id, status) VALUES ('BK-1002', 6, 'Pending') RETURNING *")
.then(res => {
    console.log(res.rows);
    process.exit(0);
})
.catch(err => {
    console.error(err.message);
    process.exit(1);
});
