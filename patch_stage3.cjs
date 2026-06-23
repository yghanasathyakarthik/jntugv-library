const fs = require('fs');

const path = 'C:/Users/yendl/OneDrive/Desktop/librarymanagement/frontend/src/pages/StudentPortal.jsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /\{\[\s*\{\s*title:\s*'Design Patterns'[\s\S]*?\]\.map\(\(book, i\) => \(/;

const newRecBooksLogic = `{books.slice(0, 5).map((book, i) => (
                        <div onClick={() => { setActiveTab('search'); setSearchTerm(book.title); }} key={book.book_id || i} className="bg-white dark:bg-slate-800 p-3 rounded-[20px] border border-slate-100 dark:border-slate-700 shadow-[0_4px_12px_rgba(0,0,0,0.02)] min-w-[240px] flex gap-3 hover:shadow-md transition-all cursor-pointer group">
                           <div className={\`w-[72px] h-[100px] rounded-xl bg-indigo-500 shadow-inner flex items-center justify-center p-2 relative overflow-hidden group-hover:scale-105 transition-transform\`}>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                              <span className="text-[8px] text-white/80 font-black text-center relative z-10 leading-tight">{(book.title || '').toUpperCase()}</span>
                           </div>
                           <div className="flex flex-col justify-center py-1">
                              <h4 className="text-[13px] font-black text-slate-800 dark:text-slate-100 leading-tight mb-1 line-clamp-2">{book.title}</h4>
                              <p className="text-[10px] font-medium text-slate-500 mb-2">{book.author || 'Unknown'}</p>
                              <div className="mt-auto flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                                 <span>●</span> Available
                              </div>
                           </div>
                        </div>`;

if (content.match(regex)) {
    // We need to match the entire map function block to replace it.
    // However, the original block has:
    // ].map((book, i) => (
    //    <div key={i} ... >
    //      ...
    //    </div>
    
    // Instead of full regex replace which is risky with nested divs, we'll replace just the array part.
    // Wait, since I wrote a precise replacement in newRecBooksLogic, I can just replace the array and map signature.
    
    // Let's do string replacement instead.
    const oldStr = `{[
                       { title: 'Design Patterns', author: 'Erich Gamma', rating: '4.6', color: 'bg-blue-600' },
                       { title: 'Clean Code', author: 'Robert C. Martin', rating: '4.7', color: 'bg-slate-800' },
                       { title: 'The Pragmatic Programmer', author: 'Andrew Hunt', rating: '4.8', color: 'bg-emerald-900' },
                       { title: 'Introduction to Algorithms', author: 'Cormen et al.', rating: '4.6', color: 'bg-rose-600' },
                       { title: 'Deep Work', author: 'Cal Newport', rating: '4.5', color: 'bg-indigo-900' },
                     ].map((book, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 p-3 rounded-[20px] border border-slate-100 dark:border-slate-700 shadow-[0_4px_12px_rgba(0,0,0,0.02)] min-w-[240px] flex gap-3 hover:shadow-md transition-all cursor-pointer group">
                           <div className={\`w-[72px] h-[100px] rounded-xl \${book.color} shadow-inner flex items-center justify-center p-2 relative overflow-hidden group-hover:scale-105 transition-transform\`}>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                              <span className="text-[8px] text-white/80 font-black text-center relative z-10 leading-tight">{book.title.toUpperCase()}</span>
                           </div>
                           <div className="flex flex-col justify-center py-1">
                              <h4 className="text-[13px] font-black text-slate-800 dark:text-slate-100 leading-tight mb-1 line-clamp-2">{book.title}</h4>
                              <p className="text-[10px] font-medium text-slate-500 mb-2">{book.author}</p>
                              <div className="mt-auto flex items-center gap-1 text-[11px] font-bold text-amber-500">
                                 <span>★</span> {book.rating}
                              </div>
                           </div>
                        </div>`;
    if (content.includes(oldStr)) {
       content = content.replace(oldStr, newRecBooksLogic);
       fs.writeFileSync(path, content);
       console.log("Recommended books updated successfully!");
    } else {
       console.log("Could not find the exact string to replace.");
    }
} else {
    console.log("Regex did not match.");
}
