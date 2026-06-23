const fs = require('fs');

const portalPath = 'C:/Users/yendl/OneDrive/Desktop/librarymanagement/frontend/src/pages/StudentPortal.jsx';
let portalContent = fs.readFileSync(portalPath, 'utf8');

const oldFetch = "const res = await axios.get(`/api/reservations/user/${user.id}`);";
const newFetch = "const res = await axios.get(`/api/reservations/student/${user.id}`);";

if (portalContent.includes(oldFetch)) {
    portalContent = portalContent.replace(oldFetch, newFetch);
    fs.writeFileSync(portalPath, portalContent);
    console.log("Fixed reservations fetch URL!");
} else {
    console.log("Could not find old fetch to replace.");
}
