const fs = require('fs');

const portalPath = 'C:/Users/yendl/OneDrive/Desktop/librarymanagement/frontend/src/pages/StudentPortal.jsx';
let portalContent = fs.readFileSync(portalPath, 'utf8');

const oldCode = `const handleReserveBook = async (bookId) => {
    try {
      await axios.post('/api/reservations', { student_id: user.id, book_id: bookId });
      fetchBooksData();
      fetchReservations();
    } catch (err) { console.error(err); }
  };`;

const newCode = `const handleReserveBook = async (bookId) => {
    try {
      await axios.post('/api/reservations', { student_id: user.id, book_id: bookId });
      fetchBooksData();
      fetchReservations();
      alert('Reservation successful! You can check its status in the Reservations tab.');
    } catch (err) { 
      console.error(err); 
      alert('Failed to reserve book. Please try again.');
    }
  };`;

if (portalContent.includes(oldCode)) {
    portalContent = portalContent.replace(oldCode, newCode);
    fs.writeFileSync(portalPath, portalContent);
    console.log("Patched handleReserveBook");
} else {
    console.log("Could not find handleReserveBook string exactly.");
}
