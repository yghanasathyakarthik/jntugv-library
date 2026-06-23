const pool = require('./db');
pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' OR table_name = 'USERS';`).then(res => {
    console.log(res.rows);
    process.exit();
}).catch(console.error);
