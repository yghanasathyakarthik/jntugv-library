const fs = require('fs');
const path = 'C:/Users/yendl/OneDrive/Desktop/librarymanagement/frontend/src/pages/StudentPortal.jsx';
let content = fs.readFileSync(path, 'utf8');

const missingCode = `      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(\`/api/transactions/user/\${user.id}\`);
      setHistory(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchStudentInfo = async () => {
    try {
      const res = await axios.get(\`/api/users/\${user.id}\`);
      setStudentInfo(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchBooksData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/books');
      setBooks(res.data);
      setTotalBooks(res.data.length);
      setAvailableBooks(res.data.filter(b => b.status === 'Available').length);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchAppeals = async () => {
    try {
      const res = await axios.get(\`/api/appeals/user/\${user.id}\`);
      setAppeals(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchReservations = async () => {
    try {
      const res = await axios.get(\`/api/reservations/user/\${user.id}\`);
      setReservations(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(\`/api/notifications/user/\${user.id}\`);
      setNotifications(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchGamification = async () => {
    try {
      const res = await axios.get(\`/api/gamification/user/\${user.id}\`);
      setGamification(res.data);
      const leadRes = await axios.get('/api/gamification/leaderboard');
      setLeaderboard(leadRes.data);
    } catch (err) { console.error(err); }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await axios.get(\`/api/recommendations/\${user.id}\`);
      setRecommendations(res.data);
    } catch (err) { console.error(err); }
  };

  const submitAppeal = async (e) => {
    e.preventDefault();
    if (!appealDescription) return;
    setSubmittingAppeal(true);
    try {
      await axios.post('/api/appeals', {
        user_id: user.id,
        type: appealType,
        description: appealDescription
      });
      setAppealDescription('');
      fetchAppeals();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAppeal(false);
    }
  };

  const handleReserve = async (bookId) => {
    try {
      await axios.post('/api/reservations', { user_id: user.id, book_id: bookId });
      fetchBooksData();
      fetchReservations();
    } catch (err) { console.error(err); }
  };
  
  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await axios.post(\`/api/reviews\`, { book_id: selectedBook.book_id, user_id: user.id, rating: newReviewRating, review_text: newReviewText });
      setNewReviewText('');
      setNewReviewRating(5);
      // fetchReviews();
    } catch (err) { console.error(err); }
  };

  const Sidebar = () => (
    <div className="w-[280px] bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 z-20">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100/50 shadow-sm overflow-hidden">
          <img src="/jntugv-logo.png" alt="Logo" className="w-8 h-8 object-contain" />
        </div>
        <h2 className="text-[18px] font-black tracking-tight text-slate-800 leading-tight">JNTUGV Central<br/><span className="text-indigo-600 text-[13px] uppercase tracking-widest font-bold">Smart Library</span></h2>
      </div>
      <nav className="p-4 flex-1 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar">
        <button onClick={() => setActiveTab('dashboard')} className={\`w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] font-bold transition-all \${activeTab === 'dashboard' ? 'bg-indigo-500 text-white shadow-[0_4px_12px_rgba(99,102,241,0.25)]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}\`}>
          <LayoutDashboard className="w-[18px] h-[18px]" /> Dashboard
        </button>
        <button onClick={() => {setActiveTab('search'); fetchBooksData();}} className={\`w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] font-bold transition-all \${activeTab === 'search' ? 'bg-indigo-500 text-white shadow-[0_4px_12px_rgba(99,102,241,0.25)]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}\`}>
          <SearchIcon className="w-[18px] h-[18px]" /> Search Catalog
        </button>
        <button onClick={() => setActiveTab('mybooks')} className={\`w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] font-bold transition-all \${activeTab === 'mybooks' ? 'bg-indigo-500 text-white shadow-[0_4px_12px_rgba(99,102,241,0.25)]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}\`}>
          <BookCopy className="w-[18px] h-[18px]" /> My Books
        </button>
        <button onClick={() => setActiveTab('reservations')} className={\`w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] font-bold transition-all \${activeTab === 'reservations' ? 'bg-indigo-500 text-white shadow-[0_4px_12px_rgba(99,102,241,0.25)]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}\`}>
          <Calendar className="w-[18px] h-[18px]" /> Reservations
        </button>
        <button onClick={() => setActiveTab('appeals')} className={\`w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] font-bold transition-all \${activeTab === 'appeals' ? 'bg-indigo-500 text-white shadow-[0_4px_12px_rgba(99,102,241,0.25)]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}\`}>
          <MessageSquare className="w-[18px] h-[18px]" /> Appeals
        </button>
        <button onClick={() => setActiveTab('profile')} className={\`w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] font-bold transition-all \${activeTab === 'profile' ? 'bg-indigo-500 text-white shadow-[0_4px_12px_rgba(99,102,241,0.25)]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}\`}>
          <UserIcon className="w-[18px] h-[18px]" /> My Profile
        </button>

        {/* Promo Card */}
        <div className="mt-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[24px] p-6 text-white relative overflow-hidden group shadow-[0_8px_24px_rgba(99,102,241,0.25)]">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
           <h3 className="text-[16px] font-black mb-1 relative z-10 leading-tight">Upgrade Your<br/>Reading Journey</h3>
           <p className="text-[11px] font-medium text-indigo-100 mb-4 relative z-10 opacity-90">Unlock premium features and personalized AI insights.</p>
           <button className="bg-white text-indigo-600 w-full py-2.5 rounded-xl text-[12px] font-bold shadow-sm hover:shadow-md transition-all relative z-10">
              Upgrade Now
           </button>
        </div>
      </nav>
      <div className="p-4 shrink-0 flex flex-col gap-2 border-t border-slate-100">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-[16px] font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all">
          <Settings className="w-[18px] h-[18px]" /> Settings
        </button>
        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-[16px] font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all">
          <LogOut className="w-[18px] h-[18px]" /> Sign Out
        </button>
      </div>
    </div>
  );

  const TopBar = () => (
    <header className="h-[88px] bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 relative z-10">
      <div className="relative w-full max-w-[480px]">
         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="w-4 h-4 text-slate-400" />
         </div>
         <input 
            type="text" 
            placeholder="Search for books, authors, or ISBN..." 
            className="w-full bg-[#f8fafc] text-[13px] font-bold text-slate-800 rounded-2xl pl-11 pr-16 py-3.5 border-0 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-500 outline-none transition-all"
         />
         <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded text-[10px] font-bold text-slate-400 shadow-sm">
               <span>Ctrl</span><span>K</span>
            </div>
         </div>
      </div>

      <div className="flex items-center gap-4">
         <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center transition-colors relative">
               <Bell className="w-5 h-5 text-slate-600" strokeWidth={2.5} />
               <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center transition-colors">
               <Moon className="w-5 h-5 text-slate-600" strokeWidth={2.5} />
            </button>
         </div>
         
         <div className="flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer group">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-100">
               <img src={studentInfo?.profile_photo || user?.profile_photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
               <span className="text-[14px] font-bold text-slate-800 leading-none mb-1">{studentInfo?.name?.split(' ')[0] || user?.name || 'Karthik'}</span>
               <span className="text-[11px] font-medium text-slate-500 leading-none">Student</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 ml-2 group-hover:text-slate-600" />
         </div>
      </div>
    </header>
  );

  return (`;

content = content.replace('      return (\r\n    <>\r\n    <div className="flex w-full h-[100dvh] bg-[#f8fafc] font-sans text-slate-800 overflow-hidden">', missingCode + '\n    <>\n    <div className="flex w-full h-[100dvh] bg-[#f8fafc] font-sans text-slate-800 overflow-hidden">');
content = content.replace('      return (\n    <>\n    <div className="flex w-full h-[100dvh] bg-[#f8fafc] font-sans text-slate-800 overflow-hidden">', missingCode + '\n    <>\n    <div className="flex w-full h-[100dvh] bg-[#f8fafc] font-sans text-slate-800 overflow-hidden">');

fs.writeFileSync(path, content);
console.log('Fixed');
