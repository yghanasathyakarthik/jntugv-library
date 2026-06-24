const pool=require('./backend/db');
async function run() {
  try {
    const r1 = await pool.query(`
    SELECT b.book_id, b.title, a.first_name || ' ' || a.last_name as author, c.name_slug as category
    FROM BOOKS b
    LEFT JOIN AUTHORS a ON b.author_id = a.author_id
    LEFT JOIN CATEGORIES c ON b.category_id = c.category_id
    WHERE b.book_id NOT IN (
        SELECT book_id FROM BOOK_SWIPES WHERE user_id = 1
    )
    ORDER BY RANDOM()
    LIMIT 10
    `);
    console.log("DISCOVER:", r1.rows);
  } catch(e) {
    console.error("DISCOVER ERR:", e.message);
  }

  try {
    const r2 = await pool.query(`
    SELECT s.seat_id, s.zone, s.status, s.last_updated, u.name as occupied_by_name
    FROM STUDY_SEATS s
    LEFT JOIN USERS u ON s.occupied_by = u.barcode_id
    ORDER BY s.seat_id ASC
    `);
    console.log("SPACES:", r2.rows.length, "rows");
  } catch(e) {
    console.error("SPACES ERR:", e.message);
  }
  process.exit();
}
run();
