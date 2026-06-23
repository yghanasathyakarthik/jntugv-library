const pool = require('./backend/db');
pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'books' OR table_name = 'BOOKS'`)
.then(res => {
    console.log(res.rows.map(r => r.column_name));
    process.exit(0);
});
