const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function fixLocations() {
    try {
        console.log("Starting location fix...");
        const categoriesRes = await pool.query('SELECT category_id, name_slug FROM CATEGORIES');
        const categories = categoriesRes.rows;
        
        for (const cat of categories) {
            const slug = cat.name_slug ? cat.name_slug.toUpperCase() : 'GENERAL';
            
            let room = 'Circulating Rm';
            let section = '1st Flr Right';
            
            // Swap logic: Non-Circulating is Left Side. Circulating is Right Side.
            if (slug.includes('MANAGEMENT') || slug.includes('MATH') || slug.includes('ENGLISH') || slug.includes('CIVIL')) {
                room = 'Non-Circulating Rm';
                section = '1st Flr Left';
            }
            
            const rackName = slug.substring(0, 10) + ' Rack';
            const shelfName = ''; // Removed shelf
            
            // We can just update the existing PHYSICAL_LOCATIONS for this category if we find them, 
            // or just insert a new one and remap. Let's insert a new one and remap for safety.
            
            const locRes = await pool.query(`
                INSERT INTO PHYSICAL_LOCATIONS (room_number, section_name, rack_number, shelf_number, position_grid_index)
                VALUES ($1, $2, $3, $4, 'TBD')
                RETURNING location_id
            `, [room, section, rackName, shelfName]);
            const locId = locRes.rows[0].location_id;
            
            const updateRes = await pool.query(`
                UPDATE BOOK_ASSET_MAP bam
                SET location_id = $1
                FROM BOOKS b
                WHERE bam.book_id = b.book_id AND b.category_id = $2
            `, [locId, cat.category_id]);
            
            console.log(`Updated ${updateRes.rowCount} assets for category ${slug} to ${room} (${section}), Rack: ${rackName}`);
        }
        console.log("Done.");
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

fixLocations();
