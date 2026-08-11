const pool = require('./db');
const { execSync } = require('child_process');

async function reupload() {
    console.log('Wiping existing books data...');
    await pool.query('TRUNCATE TABLE BOOK_SWIPES, INVENTORY_AUDITS, ISSUANCE_LOGS, BOOK_ASSET_MAP, BOOKS CASCADE;');
    console.log('Done wiping. Running import script...');
    execSync('node import_excel_final.cjs', { stdio: 'inherit' });
    console.log('Done importing!');
    process.exit(0);
}

reupload().catch(err => {
    console.error(err);
    process.exit(1);
});
