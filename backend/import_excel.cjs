const pool = require('./db');
const xlsx = require('xlsx');

async function checkData() {
    try {
        const workbook = xlsx.readFile('../Library data 2023 (3).xlsx'); 
        const sheetName = workbook.SheetNames[0]; 
        const sheet = workbook.Sheets[sheetName]; 
        const data = xlsx.utils.sheet_to_json(sheet, {header: 1}); 
        
        console.log('Columns: ', data[0]); 
        for(let i=1; i<=15; i++) {
            console.log(`Row ${i}: `, data[i]); 
        }
    } catch(err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
checkData();
