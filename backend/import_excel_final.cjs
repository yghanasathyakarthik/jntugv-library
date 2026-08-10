const pool = require('./db');
const xlsx = require('xlsx');

async function chunkedInsert(queryStr, valuesList, batchSize = 100) {
    // valuesList is an array of arrays, e.g. [[val1, val2], [val1, val2]]
    for (let i = 0; i < valuesList.length; i += batchSize) {
        const batch = valuesList.slice(i, i + batchSize);
        if (batch.length === 0) continue;
        
        let valueStrings = [];
        let flatValues = [];
        let counter = 1;
        
        for (let row of batch) {
            let placeholders = [];
            for (let val of row) {
                placeholders.push(`$${counter++}`);
                flatValues.push(val);
            }
            valueStrings.push(`(${placeholders.join(', ')})`);
        }
        
        const finalQuery = `${queryStr} ${valueStrings.join(', ')} RETURNING *;`;
        try {
            await pool.query(finalQuery, flatValues);
        } catch(err) {
            console.error('Batch error:', err);
            throw err;
        }
    }
}

async function runImport() {
    let client;
    try {
        console.log("Loading Excel File...");
        const workbook = xlsx.readFile('../Library data 2023 (3).xlsx');
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);
        console.log(`Found ${data.length} rows.`);

        client = await pool.connect();
        console.log("1. Normalizing Authors & Categories...");
        const uniqueAuthors = [...new Set(data.map(r => r.Author).filter(Boolean))];
        const uniqueCategories = [...new Set(data.map(r => r.Department).filter(Boolean))];

        // Fetch existing categories
        let existingCats = await client.query('SELECT category_id, department_tag FROM CATEGORIES');
        let catMap = {};
        for (let r of existingCats.rows) catMap[r.department_tag] = r.category_id;

        // Insert missing categories in batch
        const missingCats = uniqueCategories.filter(c => !catMap[c]);
        if (missingCats.length > 0) {
            console.log(`Inserting ${missingCats.length} missing categories...`);
            let values = [];
            let placeholders = [];
            let c = 1;
            for (const cat of missingCats) {
                placeholders.push(`($${c++}, $${c++})`);
                values.push(cat.toLowerCase().replace(/[^a-z0-9]+/g, '-'), cat);
            }
            if (placeholders.length > 0) {
                await client.query(`INSERT INTO CATEGORIES (name_slug, department_tag) VALUES ${placeholders.join(', ')} ON CONFLICT DO NOTHING`, values);
            }
            existingCats = await client.query('SELECT category_id, department_tag FROM CATEGORIES');
            for (let r of existingCats.rows) catMap[r.department_tag] = r.category_id;
        }

        // Fetch existing authors
        let existingAuth = await client.query('SELECT author_id, first_name FROM AUTHORS');
        let authMap = {};
        for (let r of existingAuth.rows) authMap[r.first_name] = r.author_id;

        // Insert missing authors in batch
        const missingAuth = uniqueAuthors.filter(a => !authMap[a]);
        if (missingAuth.length > 0) {
            console.log(`Inserting ${missingAuth.length} missing authors...`);
            // Batch them in chunks of 500 to avoid too many parameters
            for (let i = 0; i < missingAuth.length; i+=500) {
                const chunk = missingAuth.slice(i, i+500);
                let values = [];
                let placeholders = [];
                let c = 1;
                for (const auth of chunk) {
                    placeholders.push(`($${c++}, $${c++})`);
                    values.push(auth, '');
                }
                if (placeholders.length > 0) {
                    await client.query(`INSERT INTO AUTHORS (first_name, last_name) VALUES ${placeholders.join(', ')} ON CONFLICT DO NOTHING`, values);
                }
            }
            existingAuth = await client.query('SELECT author_id, first_name FROM AUTHORS');
            for (let r of existingAuth.rows) authMap[r.first_name] = r.author_id;
        }

        console.log("2. Grouping Books...");
        const booksMap = {}; 
        
        for (const row of data) {
            if (!row.Title) continue;
            const key = `${row.Title}_${row.Author || 'Unknown'}_${row.Edition || '1'}`;
            if (!booksMap[key]) {
                booksMap[key] = {
                    title: row.Title,
                    author_id: authMap[row.Author] || null,
                    category_id: catMap[row.Department] || null,
                    publication_year: parseInt(row.Year) || null,
                    edition: row.Edition ? String(row.Edition) : null,
                    copies: []
                };
            }
            booksMap[key].copies.push(row.FromAccNo);
        }

        const bookKeys = Object.keys(booksMap);
        console.log(`Found ${bookKeys.length} unique books. Inserting in chunks...`);
        
        let booksProcessed = 0;
        let totalAssets = 0;
        
        // Chunk sizes
        const CHUNK_SIZE = 250;
        
        for (let i = 0; i < bookKeys.length; i += CHUNK_SIZE) {
            const chunk = bookKeys.slice(i, i + CHUNK_SIZE);
            
            await client.query('BEGIN');
            
            let bookValues = [];
            let bookPlaceholders = [];
            let bookCounter = 1;

            let assetsList = [];
            
            for (const key of chunk) {
                const b = booksMap[key];
                const bookIdStr = 'B' + Math.random().toString(36).substr(2, 8).toUpperCase();
                
                bookPlaceholders.push(`($${bookCounter++}, $${bookCounter++}, $${bookCounter++}, $${bookCounter++}, $${bookCounter++}, $${bookCounter++}, 'Available')`);
                bookValues.push(bookIdStr, b.title, b.author_id, b.category_id, b.publication_year, b.edition);

                // Prepare assets for this book
                b.copies.forEach(accNo => {
                    assetsList.push([`ACC-${accNo}`, bookIdStr]);
                });
                
                booksProcessed++;
            }
            
            if (bookPlaceholders.length > 0) {
                await client.query(`INSERT INTO BOOKS (book_id, title, author_id, category_id, publication_year, edition, status) VALUES ${bookPlaceholders.join(', ')}`, bookValues);
            }

            totalAssets += assetsList.length;
                
            let valueStrings = [];
            let flatValues = [];
            let counter = 1;
            for (let row of assetsList) {
                valueStrings.push(`($${counter++}, $${counter++})`);
                flatValues.push(row[0], row[1]);
            }
            
            if (valueStrings.length > 0) {
                await client.query(`INSERT INTO BOOK_ASSET_MAP (asset_id, book_id) VALUES ${valueStrings.join(', ')} ON CONFLICT DO NOTHING`, flatValues);
            }
            
            await client.query('COMMIT');
            console.log(`Committed chunk. Processed ${booksProcessed} / ${bookKeys.length} books...`);
        }

        console.log(`Successfully imported ${booksProcessed} unique books and ${totalAssets} physical copies.`);
    } catch(err) {
        if(client) await client.query('ROLLBACK');
        console.error("Import failed, rolled back current chunk.", err);
    } finally {
        if(client) client.release();
        process.exit();
    }
}
runImport();
