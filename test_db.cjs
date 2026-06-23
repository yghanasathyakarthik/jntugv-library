const pool = require('./backend/db');

pool.query(`
    SELECT i.issuance_id as id, i.asset_id, i.issued_timestamp as issue_date, 
           i.expected_return_date as due_date, i.actual_return_timestamp as return_date,
           CASE WHEN i.actual_return_timestamp IS NULL THEN 'Issued' ELSE 'Returned' END as status,
           b.title, b.author, b.isbn, b.cover_image, b.section, b.room, b.rack, b.shelf
    FROM ISSUANCE_LOGS i
    JOIN BOOK_ASSET_MAP a ON i.asset_id = a.asset_id
    JOIN BOOKS b ON a.book_id = b.book_id
    WHERE i.user_identifier_string = 'STU-28876'
    ORDER BY i.issued_timestamp DESC
`).then(res => {
    console.log(res.rows);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
