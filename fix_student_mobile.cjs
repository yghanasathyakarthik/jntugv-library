const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'src', 'pages', 'StudentPortal.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

// Add Menu, X to imports
if (!content.includes('Menu,') && !content.includes('X,')) {
    content = content.replace(/import \{([^}]+)\}\s+from\s+['"]lucide-react['"];/, (match, p1) => {
        return `import { ${p1.trim()}, Menu, X } from 'lucide-react';`;
    });
}

// Add state
if (!content.includes('isMobileMenuOpen')) {
    content = content.replace(/(const { user, logout } = useContext\(AuthContext\);)/, '$1\n  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);');
}

// Modify renderSidebar
content = content.replace(/const renderSidebar = \(\) => \(\s*<div className="w-\[280px\] bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 z-20">/, 
`const renderSidebar = () => (
 <div className="w-[280px] bg-white border-r border-slate-200 flex flex-col h-[100dvh] shrink-0 overflow-y-auto">`);

content = content.replace(/<div className="p-6 border-b border-slate-100 flex items-center gap-3 shrink-0">\s*<div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100\/50 shadow-sm overflow-hidden">\s*<img src="\/jntugv-logo.png" alt="Logo" className="w-8 h-8 object-contain" \/>\s*<\/div>\s*<h2 className="text-\[18px\] font-black tracking-tight text-slate-800 leading-tight">JNTUGV Central<br\/>(?:<span.*?>)?Smart Library(?:<\/span>)?<\/h2>\s*<\/div>/,
`<div className="p-6 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100/50 shadow-sm overflow-hidden">
      <img src="/jntugv-logo.png" alt="Logo" className="w-8 h-8 object-contain" />
    </div>
    <h2 className="text-[18px] font-black tracking-tight text-slate-800 leading-tight">JNTUGV Central<br/><span className="text-indigo-600 text-[13px] uppercase tracking-widest font-bold">Smart Library</span></h2>
  </div>
  <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 text-slate-500 bg-slate-100 rounded-lg">
    <X className="w-5 h-5" />
  </button>
</div>`);

// Also fix sidebar clicks on mobile
content = content.replace(/onClick=\{\(\) => setActiveTab\('([a-z]+)'\)\}/g, "onClick={() => { setActiveTab('$1'); setIsMobileMenuOpen(false); }}");
content = content.replace(/onClick=\{\(\) => \{setActiveTab\('([a-z]+)'\); fetchBooksData\(\);\}\}/g, "onClick={() => { setActiveTab('$1'); fetchBooksData(); setIsMobileMenuOpen(false); }}");
content = content.replace(/onClick=\{\(\) => \{setActiveTab\('([a-z]+)'\); fetchGamification\(\);\}\}/g, "onClick={() => { setActiveTab('$1'); fetchGamification(); setIsMobileMenuOpen(false); }}");


// Modify layout wrapper
content = content.replace(/<div className="flex w-full h-\[100dvh\] bg-\[#f8fafc\] font-sans text-slate-800 overflow-hidden">\s*\{renderSidebar\(\)\}/,
`<div className="flex flex-col md:flex-row w-full h-[100dvh] bg-[#f8fafc] font-sans text-slate-800 overflow-hidden relative">
 
  {/* Mobile Header */}
  <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 z-30 shrink-0 shadow-sm">
     <div className="flex items-center gap-3">
       <img src="/jntugv-logo.png" alt="Logo" className="w-8 h-8 object-contain" />
       <span className="font-black text-slate-800 text-lg">JNTUGV Central</span>
     </div>
     <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 bg-slate-100 rounded-lg">
       <Menu className="w-6 h-6" />
     </button>
  </div>

  {/* Mobile Overlay */}
  {isMobileMenuOpen && (
    <div className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
  )}

  <div className={\`fixed inset-y-0 left-0 z-50 md:z-0 md:static transform \${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out\`}>
     {renderSidebar()}
  </div>`);

fs.writeFileSync(filePath, content);
console.log("StudentPortal patched successfully");
