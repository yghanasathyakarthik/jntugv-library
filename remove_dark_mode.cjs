const fs = require('fs');

const path = 'C:/Users/yendl/OneDrive/Desktop/librarymanagement/frontend/src/pages/StudentPortal.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove darkMode state and useEffect
const stateToRemoveRegex = /const \[darkMode, setDarkMode\] = useState\(\(\) => localStorage\.getItem\('darkMode'\) === 'true'\);\s*useEffect\(\(\) => \{\s*if \(darkMode\) \{\s*document\.documentElement\.classList\.add\('dark'\);\s*localStorage\.setItem\('darkMode', 'true'\);\s*\} else \{\s*document\.documentElement\.classList\.remove\('dark'\);\s*localStorage\.setItem\('darkMode', 'false'\);\s*\}\s*\}, \[darkMode\]\);/g;

content = content.replace(stateToRemoveRegex, "");

// 2. Remove Moon button
const buttonToRemoveRegex = /<button onClick=\{\(\) => setDarkMode\(!darkMode\)\} className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">\s*<Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" strokeWidth=\{2.5\} \/>\s*<\/button>/g;

content = content.replace(buttonToRemoveRegex, "");

fs.writeFileSync(path, content);
console.log("Removed Dark Mode successfully.");
