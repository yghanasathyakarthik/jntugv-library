const fs = require('fs');

const path = 'C:/Users/yendl/OneDrive/Desktop/librarymanagement/frontend/src/pages/StudentPortal.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add States
const stateAnchor = "const [notifications, setNotifications] = useState([]);";
const newStates = `const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);
`;
content = content.replace(stateAnchor, newStates);

// 2. Dashboard Dynamic Values
// Popular Categories Logic
const renderDashboardAnchor = "activeTab === 'dashboard' && (";

// We need to inject variables for the dynamic stats before the dashboard tab renders.
const dynamicStatsLogic = `
  // Dynamic Calculations for Dashboard
  const activeIssuedBooks = history.filter(h => h.status === 'Issued' || h.status === 'Active').length;
  const activeReservedBooks = reservations.filter(r => r.status === 'Pending').length;
  
  const booksReadCount = history.filter(h => h.status === 'Returned' || h.status === 'Completed').length;
  const pagesReadEst = booksReadCount * 250;
  const readingTimeMins = gamification?.library_time_minutes || (booksReadCount * 60);
  const readingTimeStr = \`\${Math.floor(readingTimeMins / 60)}h \${readingTimeMins % 60}m\`;

  // Popular Categories
  const categoryCounts = {};
  books.forEach(b => {
      const cat = b.category || 'Uncategorized';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  
  const popularCats = Object.keys(categoryCounts)
      .map(cat => ({ name: cat, count: categoryCounts[cat] }))
      .sort((a,b) => b.count - a.count)
      .slice(0, 5)
      .map((cat, i) => {
          const colors = [
            { color: 'bg-indigo-500', iconBg: 'bg-indigo-50', icon: <Zap className="w-3.5 h-3.5 text-indigo-500" /> },
            { color: 'bg-cyan-500', iconBg: 'bg-cyan-50', icon: <Laptop className="w-3.5 h-3.5 text-cyan-500" /> },
            { color: 'bg-emerald-500', iconBg: 'bg-emerald-50', icon: <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> },
            { color: 'bg-amber-500', iconBg: 'bg-amber-50', icon: <Briefcase className="w-3.5 h-3.5 text-amber-500" /> },
            { color: 'bg-rose-500', iconBg: 'bg-rose-50', icon: <Users className="w-3.5 h-3.5 text-rose-500" /> }
          ];
          const colorObj = colors[i % colors.length];
          const totalCatBooks = books.length || 1;
          return {
             ...cat,
             countStr: \`\${cat.count} Books\`,
             percent: Math.round((cat.count / totalCatBooks) * 100),
             ...colorObj
          };
      });

  const renderTopBar = () => (
`;

content = content.replace("const renderTopBar = () => (", dynamicStatsLogic);

fs.writeFileSync('C:/Users/yendl/OneDrive/Desktop/librarymanagement/frontend/src/pages/StudentPortal_stage1.jsx', content);
console.log("Stage 1 done.");
