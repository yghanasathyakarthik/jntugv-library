const pool = require('./db');
pool.query("SELECT title, edition, book_id FROM BOOKS WHERE title='Computer Networks'")
  .then(r => console.log(r.rows))
  .catch(console.error)
  .finally(()=>pool.end());
