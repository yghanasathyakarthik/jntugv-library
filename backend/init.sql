-- Clean existing tables
DROP TABLE IF EXISTS INVENTORY_AUDITS CASCADE;
DROP TABLE IF EXISTS ISSUANCE_LOGS CASCADE;
DROP TABLE IF EXISTS BOOK_ASSET_MAP CASCADE;
DROP TABLE IF EXISTS PHYSICAL_LOCATIONS CASCADE;
DROP TABLE IF EXISTS BOOKS CASCADE;
DROP TABLE IF EXISTS CATEGORIES CASCADE;
DROP TABLE IF EXISTS AUTHORS CASCADE;
DROP TABLE IF EXISTS USERS CASCADE;

-- USERS (Admins, Librarians, Students)
CREATE TABLE USERS (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    barcode_id VARCHAR(50) UNIQUE, -- e.g. STU-1001
    fines DECIMAL(10,2) DEFAULT 0.00,
    score INT DEFAULT 100,
    library_time_minutes INT DEFAULT 0,
    last_active_at TIMESTAMP
);

-- AUTHORS
CREATE TABLE AUTHORS (
    author_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    biography_summary TEXT
);

-- CATEGORIES
CREATE TABLE CATEGORIES (
    category_id SERIAL PRIMARY KEY,
    name_slug VARCHAR(100) NOT NULL,
    department_tag VARCHAR(100),
    description_payload TEXT
);

-- BOOKS
CREATE TABLE BOOKS (
    book_id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    isbn_number VARCHAR(20) UNIQUE,
    edition VARCHAR(50),
    publication_year INT,
    language_code VARCHAR(10),
    status VARCHAR(20) DEFAULT 'Available', -- Available, Issued, Reserved, Missing
    borrow_count INT DEFAULT 0,
    author_id INT REFERENCES AUTHORS(author_id),
    category_id INT REFERENCES CATEGORIES(category_id)
);

-- PHYSICAL_LOCATIONS
CREATE TABLE PHYSICAL_LOCATIONS (
    location_id SERIAL PRIMARY KEY,
    room_number VARCHAR(50) NOT NULL,
    section_name VARCHAR(50) NOT NULL,
    rack_number VARCHAR(20) NOT NULL,
    shelf_number VARCHAR(20) NOT NULL,
    position_grid_index VARCHAR(20) NOT NULL
);

-- BOOK_ASSET_MAP
CREATE TABLE BOOK_ASSET_MAP (
    asset_id VARCHAR(50) PRIMARY KEY, -- e.g. AST-BK1001-1
    book_id VARCHAR(20) REFERENCES BOOKS(book_id) ON DELETE CASCADE,
    location_id INT REFERENCES PHYSICAL_LOCATIONS(location_id) ON DELETE SET NULL,
    barcode_payload_string TEXT,
    qr_code_uri_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ISSUANCE_LOGS
CREATE TABLE ISSUANCE_LOGS (
    issuance_id SERIAL PRIMARY KEY,
    asset_id VARCHAR(50) REFERENCES BOOK_ASSET_MAP(asset_id) ON DELETE CASCADE,
    user_identifier_string VARCHAR(50) REFERENCES USERS(barcode_id) ON DELETE CASCADE,
    issued_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expected_return_date TIMESTAMP,
    actual_return_timestamp TIMESTAMP
);

-- INVENTORY_AUDITS
CREATE TABLE INVENTORY_AUDITS (
    audit_id SERIAL PRIMARY KEY,
    asset_id VARCHAR(50) REFERENCES BOOK_ASSET_MAP(asset_id) ON DELETE CASCADE,
    librarian_id INT REFERENCES USERS(id),
    condition_status VARCHAR(20) NOT NULL, -- pristine, damaged, lost
    verified_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DEMO DATA SEEDING --

INSERT INTO USERS (name, email, password, role, barcode_id) VALUES 
('System Admin', 'admin@lib.com', 'admin123', 'admin', 'ADM-001'),
('Head Librarian', 'librarian@lib.com', 'lib123', 'librarian', 'LIB-001'),
('Alice (Student)', 'alice@student.com', 'student123', 'student', 'STU-1001'),
('Bob (Student)', 'bob@student.com', 'student123', 'student', 'STU-1002');

-- Update Alice to have a fine and low score to test block
UPDATE USERS SET fines = 5.50, score = 85 WHERE barcode_id = 'STU-1002';

INSERT INTO AUTHORS (first_name, last_name) VALUES 
('John', 'Smith'), ('Ada', 'Lovelace');

INSERT INTO CATEGORIES (name_slug, department_tag) VALUES 
('Software Engineering', 'Computer Science'), 
('Deep Learning', 'Artificial Intelligence');

INSERT INTO PHYSICAL_LOCATIONS (room_number, section_name, rack_number, shelf_number, position_grid_index) VALUES 
('CS Room 02', 'Software Engineering Section', 'Rack 05', 'Shelf 03', 'Position 12'),
('AI Room 01', 'Deep Learning Vault', 'Rack 02', 'Shelf 01', 'Position 01');

INSERT INTO BOOKS (book_id, title, isbn_number, status, borrow_count, author_id, category_id) VALUES 
('BK1001', 'Clean Code', '978-1', 'Available', 150, 1, 1),
('BK1002', 'Neural Networks', '978-2', 'Issued', 45, 2, 2),
('BK1003', 'Design Patterns', '978-3', 'Available', 200, 1, 1);

INSERT INTO BOOK_ASSET_MAP (asset_id, book_id, location_id, barcode_payload_string) VALUES 
('AST-1001', 'BK1001', 1, 'AST-1001'),
('AST-1002', 'BK1002', 2, 'AST-1002'),
('AST-1003', 'BK1003', 1, 'AST-1003');

INSERT INTO ISSUANCE_LOGS (asset_id, user_identifier_string, expected_return_date) VALUES 
('AST-1002', 'STU-1001', CURRENT_TIMESTAMP + INTERVAL '7 days');

INSERT INTO INVENTORY_AUDITS (asset_id, librarian_id, condition_status) VALUES 
('AST-1001', 2, 'pristine');
