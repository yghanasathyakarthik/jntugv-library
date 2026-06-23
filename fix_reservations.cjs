const fs = require('fs');

// 1. Fix StudentPortal.jsx
const portalPath = 'C:/Users/yendl/OneDrive/Desktop/librarymanagement/frontend/src/pages/StudentPortal.jsx';
let portalContent = fs.readFileSync(portalPath, 'utf8');

const oldPost = "await axios.post('/api/reservations', { user_id: user.id, book_id: bookId });";
const newPost = "await axios.post('/api/reservations', { student_id: user.id, book_id: bookId });";

if (portalContent.includes(oldPost)) {
    portalContent = portalContent.replace(oldPost, newPost);
    fs.writeFileSync(portalPath, portalContent);
    console.log("Fixed handleReserveBook in StudentPortal.jsx");
}

// 2. Fix backend/routes/reservations.js
const backendPath = 'C:/Users/yendl/OneDrive/Desktop/librarymanagement/backend/routes/reservations.js';
let backendContent = fs.readFileSync(backendPath, 'utf8');

// There are two queries in reservations.js that reference "AUTHORS" table
// We will replace them to avoid crashing if AUTHORS table doesn't exist or if author_id is missing.

const oldQuery1 = "SELECT r.reservation_id, r.book_id, b.title as book_title, b.author_id, a.first_name || ' ' || a.last_name as author,";
const newQuery1 = "SELECT r.reservation_id, r.book_id, b.title as book_title, b.author_id, 'Unknown' as author,";

const oldJoin1 = "LEFT JOIN AUTHORS a ON b.author_id = a.author_id";
const newJoin1 = "";

const oldQuery2 = "SELECT r.reservation_id, r.book_id, b.title as book_title, a.first_name || ' ' || a.last_name as author,";
const newQuery2 = "SELECT r.reservation_id, r.book_id, b.title as book_title, 'Unknown' as author,";

if (backendContent.includes(oldQuery1)) {
    backendContent = backendContent.replace(oldQuery1, newQuery1);
    backendContent = backendContent.replace(oldJoin1, newJoin1);
}
if (backendContent.includes(oldQuery2)) {
    backendContent = backendContent.replace(oldQuery2, newQuery2);
    backendContent = backendContent.replace(oldJoin1, newJoin1); // Replace the second LEFT JOIN AUTHORS
}

fs.writeFileSync(backendPath, backendContent);
console.log("Fixed reservations.js backend route");
