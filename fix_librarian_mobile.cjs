const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'src', 'pages', 'LibrarianPortal.jsx');
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

// Modify Sidebar outer wrapper
content = content.replace(/const Sidebar = \(\) => \(\s*<div className="w-full md:w-72 h-auto md:h-screen sticky top-0 shrink-0 z-20 p-2 md:p-4 flex flex-col">\s*<div className="bg-white\/40 backdrop-blur-3xl rounded-\[24px\] shadow-\[0_4px_24px_rgba\(0,0,0,0.02\)\] border border-white\/50 flex flex-row md:flex-col h-full overflow-x-auto md:overflow-hidden">/, 
`const Sidebar = () => (
    <div className="w-full md:w-72 h-[100dvh] shrink-0 z-20 p-4 flex flex-col overflow-y-auto custom-scrollbar">
      <div className="bg-white/40 backdrop-blur-3xl rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-white/50 flex flex-col h-full overflow-hidden">`);

// Show the logo header and add a close button for mobile
content = content.replace(/<div className="p-4 md:p-6 flex items-center gap-3 shrink-0">\s*<div className="w-10 h-10 md:w-12 md:h-12 bg-white p-1 md:p-1.5 rounded-xl shrink-0 overflow-hidden border border-\[#e2e8f0\] shadow-\[0_4px_12px_rgba\(0,0,0,0.05\)\] flex items-center justify-center">\s*<img src="\/jntugv-logo.png" alt="JNTUGV" className="w-full h-full object-contain " \/>\s*<\/div>\s*<h1 className="text-\[14px\] md:text-\[18px\] font-black text-slate-800 tracking-tight leading-tight hidden md:block">JNTUGV<br\/>(?:<span.*?>)?Smart Library(?:<\/span>)?<\/h1>\s*<\/div>/,
`<div className="p-4 md:p-6 flex items-center justify-between gap-3 shrink-0">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 md:w-12 md:h-12 bg-white p-1 md:p-1.5 rounded-xl shrink-0 overflow-hidden border border-[#e2e8f0] shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex items-center justify-center">
      <img src="/jntugv-logo.png" alt="JNTUGV" className="w-full h-full object-contain " />
    </div>
    <h1 className="text-[18px] font-black text-slate-800 tracking-tight leading-tight block">JNTUGV<br/><span className="text-[#9073fd] text-[11px] uppercase tracking-widest font-bold">Smart Library</span></h1>
  </div>
  <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 text-slate-500 bg-white rounded-lg shadow-sm">
    <X className="w-5 h-5" />
  </button>
</div>`);

// Display profile in mobile too
content = content.replace(/<div className="px-5 pb-4 hidden md:block">/, '<div className="px-5 pb-4 block">');

// Fix horizontal nav on mobile
content = content.replace(/<nav className="flex-1 px-2 md:px-4 space-x-2 md:space-x-0 space-y-0 md:space-y-1.5 overflow-x-auto md:overflow-y-auto py-2 flex flex-row md:flex-col items-center md:items-stretch">/,
`<nav className="flex-1 px-4 space-y-1.5 overflow-y-auto py-2 flex flex-col items-stretch custom-scrollbar">`);

// Fix button text on mobile and add close behavior
content = content.replace(/onClick=\{\(\) => setActiveTab\(item.id\)\}/, "onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}");

content = content.replace(/className=\{`whitespace-nowrap shrink-0 w-auto md:w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl text-\[10px\] md:text-xs font-bold transition-all \$\{activeTab === item.id \? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500\/20' : 'text-slate-500 hover:bg-\[#f4f7fe\] hover:text-blue-600'}`\}/,
`className={\`whitespace-nowrap shrink-0 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all \${activeTab === item.id ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20' : 'text-slate-500 hover:bg-[#f4f7fe] hover:text-blue-600'}\`}`);

// Remove border-l md:border-l-0 from logout
content = content.replace(/<div className="p-2 md:p-4 shrink-0 flex items-center justify-center border-l md:border-l-0 md:border-t border-slate-100">/,
`<div className="p-4 shrink-0 flex items-center justify-center border-t border-slate-100">`);

// Layout wrapper changes
content = content.replace(/<div className="flex flex-col md:flex-row w-full h-\[100dvh\] bg-\[#f4f7fe\] overflow-hidden font-sans relative">\s*<Sidebar \/>/,
`<div className="flex flex-col md:flex-row w-full h-[100dvh] bg-[#f4f7fe] overflow-hidden font-sans relative">
  {/* Mobile Header */}
  <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 z-30 shrink-0 shadow-sm">
     <div className="flex items-center gap-3">
       <img src="/jntugv-logo.png" alt="Logo" className="w-8 h-8 object-contain" />
       <span className="font-black text-slate-800 text-lg">JNTUGV Library</span>
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
     <Sidebar />
  </div>`);

fs.writeFileSync(filePath, content);
console.log("LibrarianPortal patched successfully");
