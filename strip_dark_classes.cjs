const fs = require('fs');

const path = 'C:/Users/yendl/OneDrive/Desktop/librarymanagement/frontend/src/pages/StudentPortal.jsx';
let content = fs.readFileSync(path, 'utf8');

// Regex to remove all dark: prefix utility classes
const removeDarkClassesRegex = /\bdark:[a-zA-Z0-9/-]+\b/g;

content = content.replace(removeDarkClassesRegex, '');

// Sometimes replacing leaves double spaces
content = content.replace(/  +/g, ' ');

fs.writeFileSync(path, content);
console.log("Stripped all dark: classes from StudentPortal.jsx");
