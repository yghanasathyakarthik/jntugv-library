const pool=require('./backend/db'); 
async function fix(){ 
  try { 
    await pool.query('ALTER TABLE "STUDY_SEATS" RENAME TO study_seats;'); 
    console.log('Renamed STUDY_SEATS'); 
  } catch(e) { console.error(e.message) } 
  try { 
    await pool.query('ALTER TABLE "BOOK_SWIPES" RENAME TO book_swipes;'); 
    console.log('Renamed BOOK_SWIPES'); 
  } catch(e) { console.error(e.message) } 
  process.exit(); 
} 
fix();
