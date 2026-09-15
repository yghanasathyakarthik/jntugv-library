const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, 'frontend/src/pages/AdminPortal.jsx'),
  path.join(__dirname, 'frontend/src/pages/LibrarianPortal.jsx')
];

// We will replace the entire fallback block in both files
// from `const url = URL.createObjectURL(blob);` to `if (typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(url);`

const fallbackReplacement = `    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(url);
    
    // Aggressive mobile fallback for bare WebViews: Copy to clipboard
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(csvContent || csv);
        alert("If the download didn't start, the data has been copied to your clipboard! You can paste it into Notes or Excel.");
      }
    } catch(e) {}`;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Regex to match the fallback block in both functions
  const fallbackRegex = /const url = URL\.createObjectURL\(blob\);[\s\S]*?if \(typeof URL\.revokeObjectURL === 'function'\) URL\.revokeObjectURL\(url\);/g;
  
  content = content.replace(fallbackRegex, fallbackReplacement);
  
  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
}
