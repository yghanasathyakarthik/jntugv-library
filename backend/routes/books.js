const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let query = '';
        const values = [];

        if (search) {
            query += ` WHERE b.title ILIKE $1 OR a.first_name ILIKE $1 OR a.last_name ILIKE $1 OR b.isbn_number ILIKE $1 OR bam.asset_id ILIKE $1 OR b.book_id ILIKE $1`;
            values.push(`%${search}%`);
        }

        const finalQuery = `
            SELECT b.book_id AS id, b.title, b.isbn_number AS isbn, b.publication_year as year, b.status, 
                   b.total_copies, b.available_copies,
                   a.first_name || ' ' || a.last_name AS author,
                   c.name_slug AS category,
                   pl.room_number AS room, pl.section_name AS section, pl.rack_number AS rack, pl.shelf_number AS shelf, pl.position_grid_index AS position,
                   bam.barcode_payload_string as barcode, bam.qr_code_uri_path as qr_code_data, bam.asset_id
            FROM BOOKS b
            LEFT JOIN AUTHORS a ON b.author_id = a.author_id
            LEFT JOIN CATEGORIES c ON b.category_id = c.category_id
            LEFT JOIN BOOK_ASSET_MAP bam ON b.book_id = bam.book_id
            LEFT JOIN PHYSICAL_LOCATIONS pl ON bam.location_id = pl.location_id
            ${query}
        `;
        const result = await pool.query(finalQuery, values);
        
        // Remove duplicates if joining with multiple asset maps
        const uniqueBooks = [];
        const seen = new Set();
        for (const row of result.rows) {
           if (!seen.has(row.id)) {
              seen.add(row.id);
              uniqueBooks.push(row);
           }
        }
        res.json(uniqueBooks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching books' });
    }
});

router.post('/', async (req, res) => {
    const client = await pool.connect();
    try {
        const { book_id, title, isbn, year, room, section, rack, shelf, position, count } = req.body;
        const total = parseInt(count) || 1;
        const generated_book_id = book_id || `BK-${Math.floor(Math.random()*1000000)}`;
        
        await client.query('BEGIN');
        
        // 1. Insert book
        await client.query(
            'INSERT INTO BOOKS (book_id, title, isbn_number, publication_year, status, total_copies, available_copies) VALUES ($1, $2, $3, $4, $5, $6, $7)', 
            [generated_book_id, title, isbn || null, year || null, 'Available', total, total]
        );

        // 2. Insert Location
        const locRes = await client.query(
            'INSERT INTO PHYSICAL_LOCATIONS (room_number, section_name, rack_number, shelf_number, position_grid_index) VALUES ($1, $2, $3, $4, $5) RETURNING location_id',
            [room || 'TBD', section || 'TBD', rack || 'TBD', shelf || 'TBD', position || 'TBD']
        );
        const location_id = locRes.rows[0].location_id;

        // 3. Insert Asset Maps
        const generatedAssets = [];
        for (let i = 0; i < total; i++) {
            const asset_id = `AST-${generated_book_id}-${i+1}`;
            const barcode_payload = asset_id;
            const qr_payload = `http://localhost:5000/api/barcode/${asset_id}`;
            
            await client.query(
                'INSERT INTO BOOK_ASSET_MAP (asset_id, book_id, location_id, barcode_payload_string, qr_code_uri_path) VALUES ($1, $2, $3, $4, $5)',
                [asset_id, generated_book_id, location_id, barcode_payload, qr_payload]
            );
            generatedAssets.push(asset_id);
        }

        await client.query('COMMIT');
        res.status(201).json({ message: `Book successfully saved! Generated ${total} assets: ${generatedAssets.join(', ')}`, assets: generatedAssets });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        if (err.code === '23505') {
            return res.status(400).json({ error: `The Book ID '${req.body.book_id}' is already taken. It must be unique!` });
        }
        res.status(500).json({ error: 'Database error adding book' });
    } finally {
        client.release();
    }
});

module.exports = router;

// Bulk insert books
router.post('/bulk', async (req, res) => {
    const client = await pool.connect();
    try {
        const books = req.body;
        if (!Array.isArray(books) || books.length === 0) {
            return res.status(400).json({ error: 'Expected an array of books' });
        }
        
        await client.query('BEGIN');
        let totalInserted = 0;
        let totalAssets = 0;

        for (const book of books) {
            const { book_id, title, isbn, year, room, section, rack, shelf, position, count } = book;
            if (!title) continue; // Skip invalid rows
            
            const total = parseInt(count) || 1;
            const generated_book_id = book_id || `BK-${Math.floor(Math.random()*1000000)}`;
            
            await client.query(
                'INSERT INTO BOOKS (book_id, title, isbn_number, publication_year, status, total_copies, available_copies) VALUES ($1, $2, $3, $4, $5, $6, $7)', 
                [generated_book_id, title, isbn || null, year || null, 'Available', total, total]
            );

            const locRes = await client.query(
                'INSERT INTO PHYSICAL_LOCATIONS (room_number, section_name, rack_number, shelf_number, position_grid_index) VALUES ($1, $2, $3, $4, $5) RETURNING location_id',
                [room || 'TBD', section || 'TBD', rack || 'TBD', shelf || 'TBD', position || 'TBD']
            );
            const location_id = locRes.rows[0].location_id;

            const barcodes = book.barcode ? book.barcode.toString().split(',').map(s => s.trim()) : [];

            for (let i = 0; i < total; i++) {
                const asset_id = barcodes[i] ? barcodes[i] : `AST-${generated_book_id}-${i+1}`;
                const barcode_payload = asset_id;
                const qr_payload = `http://localhost:5000/api/barcode/${asset_id}`;
                
                await client.query(
                    'INSERT INTO BOOK_ASSET_MAP (asset_id, book_id, location_id, barcode_payload_string, qr_code_uri_path) VALUES ($1, $2, $3, $4, $5)',
                    [asset_id, generated_book_id, location_id, barcode_payload, qr_payload]
                );
                totalAssets++;
            }
            totalInserted++;
        }

        await client.query('COMMIT');
        res.status(201).json({ message: `Successfully imported ${totalInserted} books with ${totalAssets} total copies!` });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Database error processing bulk upload' });
    } finally {
        client.release();
    }
});
// Edit book details
router.put('/:id', async (req, res) => {
    try {
        const { title, isbn, total_copies, available_copies } = req.body;
        await pool.query(
            'UPDATE BOOKS SET title = $1, isbn_number = $2, total_copies = $3, available_copies = $4 WHERE book_id = $5',
            [title, isbn, total_copies, available_copies, req.params.id]
        );
        res.json({ message: 'Book updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update book details' });
    }
});
