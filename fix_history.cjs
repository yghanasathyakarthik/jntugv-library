const fs = require('fs');

// 1. Update Backend
const backendPath = 'C:/Users/yendl/OneDrive/Desktop/librarymanagement/backend/routes/issuance.js';
let backendContent = fs.readFileSync(backendPath, 'utf8');

const newRoute = `
// Get issuance logs for a specific student
router.get('/student/:barcodeId', async (req, res) => {
    try {
        const result = await pool.query(\`
            SELECT i.issuance_id as id, i.asset_id, i.issued_timestamp as issue_date, 
                   i.expected_return_date as due_date, i.actual_return_timestamp as return_date,
                   CASE WHEN i.actual_return_timestamp IS NULL THEN 'Issued' ELSE 'Returned' END as status,
                   b.title, b.author, b.isbn, b.cover_image, b.section, b.room, b.rack, b.shelf
            FROM ISSUANCE_LOGS i
            JOIN BOOK_ASSET_MAP a ON i.asset_id = a.asset_id
            JOIN BOOKS b ON a.book_id = b.book_id
            WHERE i.user_identifier_string = $1
            ORDER BY i.issued_timestamp DESC
        \`, [req.params.barcodeId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
`;

backendContent = backendContent.replace(/module\.exports = router;/, newRoute);
fs.writeFileSync(backendPath, backendContent);


// 2. Update Frontend
const frontendPath = 'C:/Users/yendl/OneDrive/Desktop/librarymanagement/frontend/src/pages/StudentPortal.jsx';
let frontendContent = fs.readFileSync(frontendPath, 'utf8');

const oldFetch = /const res = await axios\.get\(`\/api\/transactions\/user\/\$\{user\.id\}`\);/;
const newFetch = "const res = await axios.get(`/api/issuance/student/${user.barcode_id}`);";

if (frontendContent.match(oldFetch)) {
    frontendContent = frontendContent.replace(oldFetch, newFetch);
    fs.writeFileSync(frontendPath, frontendContent);
    console.log("Fixed history API call and added backend route!");
} else {
    console.log("Could not find frontend fetch call.");
}
