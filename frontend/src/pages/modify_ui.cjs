const fs = require('fs');
const path = 'C:/Users/yendl/OneDrive/Desktop/librarymanagement/frontend/src/pages/StudentPortal.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove Promo Card from renderSidebar
const promoRegex = /\{\/\* Promo Card \*\/\}\s*<div className="mt-8 bg-gradient-to-br[\s\S]*?<\/div>\s*<\/nav>/;
content = content.replace(promoRegex, '</nav>');

// 2. Make Settings working
const settingsRegex = /<button className="w-full flex items-center gap-3 px-4 py-3 rounded-\[16px\] font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all">\s*<Settings className="w-\[18px\] h-\[18px\]" \/> Settings\s*<\/button>/;
content = content.replace(settingsRegex, `<button onClick={() => setActiveTab('settings')} className="w-full flex items-center gap-3 px-4 py-3 rounded-[16px] font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all">
          <Settings className="w-[18px] h-[18px]" /> Settings
        </button>`);

// 3. Add Settings tab in main content (let's put it right before "LOCATE BOOK MAP TAB")
const searchTabEndRegex = /\{\/\* LOCATE BOOK MAP TAB \(Pathfinding\) \*\/\}/;
const settingsTabCode = `
          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                 <h2 className="text-3xl font-black text-slate-800 mb-6 tracking-tight">Account Settings</h2>
                 <p className="text-slate-500 font-medium mb-8">Manage your account preferences, notifications, and library profile settings.</p>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <div>
                          <h4 className="font-bold text-slate-800">Email Notifications</h4>
                          <p className="text-xs text-slate-500">Receive emails for due dates and reservations</p>
                       </div>
                       <input type="checkbox" className="toggle" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <div>
                          <h4 className="font-bold text-slate-800">Dark Mode</h4>
                          <p className="text-xs text-slate-500">Toggle dark theme interface (Beta)</p>
                       </div>
                       <input type="checkbox" className="toggle" />
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* LOCATE BOOK MAP TAB (Pathfinding) */}`;
content = content.replace(searchTabEndRegex, settingsTabCode);

// 4. Remove right side panel completely
// We look for: <div className="w-[340px] ... hidden xl:flex"> up to its matching </div> which is right before </div>\n\n{selectedBook && (
// The exact string in StudentPortal starts at line 1100. Let's find it.
const rightSidebarRegex = /<div className="w-\[340px\] bg-\[#f8fafc\] border-l border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 z-20 px-6 py-6 overflow-y-auto custom-scrollbar hidden xl:flex">[\s\S]*?\{\/\* Upcoming Reservations \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

// Let's be more precise.
const rightSidebarStart = '<div className="w-[340px] bg-[#f8fafc] border-l border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 z-20 px-6 py-6 overflow-y-auto custom-scrollbar hidden xl:flex">';
const rightPanelIndex = content.indexOf(rightSidebarStart);
if (rightPanelIndex !== -1) {
  // We need to find the matching closing div for the right sidebar.
  // Then the next closing div is for the overall flex wrapper.
  const endMarker = '      </div>\n\n    </div>\n\n{selectedBook && (';
  const endMarkerIndex = content.indexOf(endMarker, rightPanelIndex);
  if (endMarkerIndex !== -1) {
     const beforeRightPanel = content.substring(0, rightPanelIndex);
     const afterRightPanel = '\n    </div>\n\n{selectedBook && (' + content.substring(endMarkerIndex + endMarker.length);
     content = beforeRightPanel + afterRightPanel;
  }
}

fs.writeFileSync(path, content);
console.log('UI Modifications applied');
