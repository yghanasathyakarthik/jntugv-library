const pool = require('./backend/db');
pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'reservations' OR table_name = 'RESERVATIONS'`)
.then(res => {
    console.log(res.rows);
    process.exit(0);
})
.catch(console.log);
