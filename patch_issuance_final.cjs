const fs = require('fs');

const backendPath = 'C:/Users/yendl/OneDrive/Desktop/librarymanagement/backend/routes/issuance.js';
let backendContent = fs.readFileSync(backendPath, 'utf8');

// Replace the buggy query with the correct one
const oldQuery = "b.title, b.isbn, b.cover_image, b.section, b.room, b.rack, b.shelf";
const newQuery = "b.title, b.isbn_number as isbn";

if (backendContent.includes(oldQuery)) {
    backendContent = backendContent.replace(oldQuery, newQuery);
    fs.writeFileSync(backendPath, backendContent);
    console.log("Patched issuance.js successfully.");
} else {
    console.log("Could not find the query string to patch.");
}
