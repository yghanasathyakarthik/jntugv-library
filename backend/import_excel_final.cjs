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
        await client.query('BEGIN');

        console.log("1. Normalizing Authors & Categories...");
        const uniqueAuthors = [...new Set(data.map(r => r.Author).filter(Boolean))];
        const uniqueCategories = [...new Set(data.map(r => r.Department).filter(Boolean))];

        // Insert Categories
        const catMap = {};
        for (const cat of uniqueCategories) {
            const res = await client.query(
                `INSERT INTO CATEGORIES (name_slug, department_tag) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING category_id`,
                [cat.toLowerCase().replace(/[^a-z0-9]+/g, '-'), cat]
            );
            if (res.rows.length > 0) catMap[cat] = res.rows[0].category_id;
            else {
                const existing = await client.query(`SELECT category_id FROM CATEGORIES WHERE department_tag = $1`, [cat]);
                catMap[cat] = existing.rows[0].category_id;
            }
        }

        // Insert Authors
        const authMap = {};
        for (const auth of uniqueAuthors) {
            const res = await client.query(
                `INSERT INTO AUTHORS (first_name, last_name) VALUES ($1, '') ON CONFLICT DO NOTHING RETURNING author_id`,
                [auth]
            );
            if (res.rows.length > 0) authMap[auth] = res.rows[0].author_id;
            else {
                const existing = await client.query(`SELECT author_id FROM AUTHORS WHERE first_name = $1`, [auth]);
                authMap[auth] = existing.rows[0].author_id;
            }
        }

        console.log("2. Grouping Books...");
        // Title + Author + Edition -> Book Info
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
                    total_copies: 0,
                    copies: []
                };
            }
            booksMap[key].total_copies += 1;
            booksMap[key].copies.push(row.FromAccNo);
        }

        console.log(`Found ${Object.keys(booksMap).length} unique books. Inserting...`);
        let booksProcessed = 0;
        let totalAssets = 0;
        for (const key of Object.keys(booksMap)) {
            const b = booksMap[key];
            const bookIdStr = 'B' + Math.random().toString(36).substr(2, 8).toUpperCase();
            
            await client.query(
                `INSERT INTO BOOKS (book_id, title, author_id, category_id, publication_year, edition, status)
                 VALUES ($1, $2, $3, $4, $5, $6, 'Available')`,
                [bookIdStr, b.title, b.author_id, b.category_id, b.publication_year, b.edition]
            );

            // Prepare assets for this book
            const assetsList = b.copies.map(accNo => [
                `ACC-${accNo}`, 
                bookIdStr
            ]);
            
            totalAssets += assetsList.length;
            
            // Insert Assets directly
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
            
            booksProcessed++;
            if (booksProcessed % 500 === 0) console.log(`Processed ${booksProcessed} books...`);
        }

        console.log(`Successfully imported ${booksProcessed} unique books and ${totalAssets} physical copies.`);
        await client.query('COMMIT');
        console.log("Transaction committed!");
    } catch(err) {
        if(client) await client.query('ROLLBACK');
        console.error("Import failed, rolled back.", err);
    } finally {
        if(client) client.release();
        process.exit();
    }
}
runImport();
