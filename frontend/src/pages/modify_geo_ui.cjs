const fs = require('fs');
const path = 'C:/Users/yendl/OneDrive/Desktop/librarymanagement/frontend/src/pages/StudentPortal.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add Trophy to imports
if (!content.includes('Trophy,')) {
   content = content.replace('import { ', 'import { Trophy, ');
}

// 2. Add geolocation ping to useEffect
const pingHook = `
      // Geofencing Ping
      const pingLocation = () => {
         if (navigator.geolocation) {
             navigator.geolocation.getCurrentPosition((position) => {
                 axios.post('/api/gamification/ping-location', {
                     userId: user.id,
                     lat: position.coords.latitude,
                     lon: position.coords.longitude
                 }).catch(console.error);
             }, (error) => console.error("Geolocation error:", error));
         }
      };
      pingLocation();
      const geoInterval = setInterval(pingLocation, 60000);
`;
// find where pingActive is set up
const pingActiveRegex = /const interval = setInterval\(pingActive, 60000\);/;
if (content.match(pingActiveRegex)) {
    content = content.replace(pingActiveRegex, (match) => match + '\n' + pingHook);
    // update clearInterval
    content = content.replace('return () => clearInterval(interval);', 'return () => { clearInterval(interval); clearInterval(geoInterval); };');
}

// 3. Add Leaderboard to Sidebar
const appealsBtn = /<button onClick=\{\(\) => setActiveTab\('appeals'\)\}.*?>\s*<MessageSquare className="w-\[18px\] h-\[18px\]" \/> Appeals\s*<\/button>/;
const leaderboardBtn = `
        <button onClick={() => {setActiveTab('leaderboard'); fetchGamification();}} className={\`w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] font-bold transition-all \${activeTab === 'leaderboard' ? 'bg-indigo-500 text-white shadow-[0_4px_12px_rgba(99,102,241,0.25)]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}\`}>
          <Trophy className="w-[18px] h-[18px]" /> Leaderboard
        </button>
`;
content = content.replace(appealsBtn, (match) => match + '\n' + leaderboardBtn);

// 4. Add Leaderboard UI in main area
const searchTabRegex = /\{\/\* SEARCH TAB \*\/\}/;
const leaderboardUI = `
          {/* LEADERBOARD TAB */}
          {activeTab === 'leaderboard' && (
             <div className="space-y-6 animate-in fade-in duration-300">
               <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[32px] p-8 text-white relative overflow-hidden shadow-[0_4px_24px_rgba(99,102,241,0.3)]">
                  <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                  <h2 className="text-3xl font-black mb-2 relative z-10">Library Leaderboard</h2>
                  <p className="text-indigo-100 font-medium relative z-10 max-w-lg">Rank up by spending time studying in the library, and issuing or returning books. See how you compare to other students!</p>
               </div>

               <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                           <th className="py-5 px-8 font-black text-slate-400 text-[11px] uppercase tracking-widest w-24">Rank</th>
                           <th className="py-5 px-8 font-black text-slate-400 text-[11px] uppercase tracking-widest">Student</th>
                           <th className="py-5 px-8 font-black text-slate-400 text-[11px] uppercase tracking-widest">Badge</th>
                           <th className="py-5 px-8 font-black text-slate-400 text-[11px] uppercase tracking-widest text-center">Library Time</th>
                           <th className="py-5 px-8 font-black text-slate-400 text-[11px] uppercase tracking-widest text-right">Total Score</th>
                        </tr>
                     </thead>
                     <tbody>
                        {leaderboard.map((u, i) => (
                           <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                              <td className="py-5 px-8">
                                 <div className={\`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm \${i === 0 ? 'bg-amber-100 text-amber-600' : i === 1 ? 'bg-slate-200 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400'}\`}>
                                    #{i + 1}
                                 </div>
                              </td>
                              <td className="py-5 px-8">
                                 <span className="font-bold text-slate-800">{u.name}</span>
                              </td>
                              <td className="py-5 px-8">
                                 <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100">
                                    <span>{u.badge?.icon}</span>
                                    <span className="text-[11px] font-bold text-indigo-600">{u.badge?.name}</span>
                                 </div>
                              </td>
                              <td className="py-5 px-8 text-center">
                                 <span className="font-bold text-slate-600">{u.library_time_minutes || 0} min</span>
                              </td>
                              <td className="py-5 px-8 text-right">
                                 <span className="font-black text-slate-800 text-lg">{u.score}</span>
                              </td>
                           </tr>
                        ))}
                        {leaderboard.length === 0 && (
                           <tr>
                              <td colSpan="5" className="py-12 text-center text-slate-500 font-medium">No leaderboard data available yet.</td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
             </div>
          )}

`;
content = content.replace(searchTabRegex, leaderboardUI + searchTabRegex.source.replace(/\\/g, '')); // Reinsert comment

fs.writeFileSync(path, content);
console.log("Frontend Geolocation UI Updated");
