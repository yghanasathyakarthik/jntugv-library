const fs = require('fs');

const path = 'C:/Users/yendl/OneDrive/Desktop/librarymanagement/frontend/src/pages/StudentPortal_stage1.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Stats replacements
content = content.replace(/value: '1,245'/, "value: activeIssuedBooks");
content = content.replace(/value: '234'/, "value: activeReservedBooks");
content = content.replace(/value: '20,458'/, "value: totalBooks");
content = content.replace(/value: '16,234'/, "value: availableBooks");

// 2. Reading Activity replacements
content = content.replace(/<span className="text-\[16px\] font-black text-slate-800">8<\/span>/, `<span className="text-[16px] font-black text-slate-800 dark:text-slate-100">{booksReadCount}</span>`);
content = content.replace(/<span className="text-\[16px\] font-black text-slate-800">1,248<\/span>/, `<span className="text-[16px] font-black text-slate-800 dark:text-slate-100">{pagesReadEst.toLocaleString()}</span>`);
content = content.replace(/<span className="text-\[16px\] font-black text-slate-800">18h 45m<\/span>/, `<span className="text-[16px] font-black text-slate-800 dark:text-slate-100">{readingTimeStr}</span>`);

// 3. Popular Categories mapping
const popCatsRegex = /\{\[\s*\{\s*name:\s*'Engineering'[\s\S]*?\]\.map\(\(cat, i\) => \(/;
content = content.replace(popCatsRegex, `{popularCats.map((cat, i) => (`);

// 4. Notifications & Dark Mode in Top Bar
const topBarRegex = /<button className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center transition-colors relative">\s*<Bell className="w-5 h-5 text-slate-600" strokeWidth=\{2.5\} \/>\s*<span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"><\/span>\s*<\/button>\s*<button className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center transition-colors">\s*<Moon className="w-5 h-5 text-slate-600" strokeWidth=\{2.5\} \/>\s*<\/button>/;

const newTopBarBtns = `<button onClick={() => setNotificationsOpen(!notificationsOpen)} className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors relative">
               <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" strokeWidth={2.5} />
               {notifications.length > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>}
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
               <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" strokeWidth={2.5} />
            </button>
            
            {/* NOTIFICATIONS DROPDOWN */}
            {notificationsOpen && (
               <div className="absolute top-[70px] right-24 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 dark:border-slate-700 z-50 overflow-hidden">
                 <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">Notifications</h3>
                    <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">{notifications.length} New</span>
                 </div>
                 <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                       <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">No new notifications</div>
                    ) : (
                       notifications.map(n => (
                          <div key={n.notification_id} onClick={() => markNotificationRead(n.notification_id)} className="px-4 py-3 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors flex gap-3">
                             <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                             <div>
                               <p className="text-[13px] text-slate-800 dark:text-slate-200 font-medium leading-snug">{n.message}</p>
                               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(n.created_at).toLocaleDateString()}</span>
                             </div>
                          </div>
                       ))
                    )}
                 </div>
               </div>
            )}`;

if (content.includes('className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center transition-colors relative"')) {
    content = content.replace(topBarRegex, newTopBarBtns);
    console.log("Top bar replaced.");
} else {
    console.log("Could not find top bar match.");
}

// 5. Recommended Books OnClick
const recBooksRegex = /<div key=\{book\.book_id\} className="min-w-\[180px\] bg-white/;
const newRecBooks = `<div onClick={() => { setActiveTab('search'); setSearchTerm(book.title); }} key={book.book_id} className="min-w-[180px] cursor-pointer bg-white dark:bg-slate-800`;
if (content.includes('<div key={book.book_id} className="min-w-[180px] bg-white')) {
    content = content.replace(new RegExp('<div key=\\{book\\.book_id\\} className="min-w-\\[180px\\] bg-white', 'g'), newRecBooks);
    console.log("Recommended books onClick added.");
}

// 6. Very Basic Dark Mode replacements for major container backgrounds
content = content.replace(/bg-\[\#f8fafc\]/g, "bg-[#f8fafc] dark:bg-slate-900");
content = content.replace(/bg-white/g, "bg-white dark:bg-slate-800");
content = content.replace(/text-slate-800/g, "text-slate-800 dark:text-slate-100");
content = content.replace(/text-slate-900/g, "text-slate-900 dark:text-white");
content = content.replace(/border-slate-100/g, "border-slate-100 dark:border-slate-700");
content = content.replace(/border-slate-200/g, "border-slate-200 dark:border-slate-700");

fs.writeFileSync('C:/Users/yendl/OneDrive/Desktop/librarymanagement/frontend/src/pages/StudentPortal.jsx', content);
console.log("Stage 2 done.");
