const pool = require('./backend/db');

async function addIndexes() {
  try {
    console.log("Adding indexes to improve performance...");
    
    // Books Search indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_books_title ON BOOKS(title);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_authors_names ON AUTHORS(first_name, last_name);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_categories_name ON CATEGORIES(name_slug);');
    
    // Auth indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON USERS(email);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_barcode ON USERS(barcode_id);');

    // Asset Map indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_book_asset_map_book_id ON BOOK_ASSET_MAP(book_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_book_asset_map_location_id ON BOOK_ASSET_MAP(location_id);');
    
    // Issuance Log indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_issuance_logs_user ON ISSUANCE_LOGS(user_identifier_string);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_issuance_logs_asset ON ISSUANCE_LOGS(asset_id);');

    console.log("Indexes added successfully!");
  } catch (err) {
    console.error("Error adding indexes:", err);
  } finally {
    process.exit(0);
  }
}

addIndexes();
