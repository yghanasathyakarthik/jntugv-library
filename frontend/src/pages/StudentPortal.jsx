import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Search, MapPin, Map, Navigation, QrCode, Bookmark, BookOpen, Clock, AlertTriangle, Trophy, Download, CheckCircle, CreditCard, Sparkles, User as UserIcon, Users, LayoutDashboard, Search as SearchIcon, BookCopy, Calendar, Bell, Settings, LogOut, ChevronRight, Check, MessageSquare, Send, History, Barcode, Camera, Zap, Keyboard, XCircle, AlertCircle, ChevronDown, Library, Scan, Bot, Moon, MoreHorizontal, Briefcase, Laptop } from 'lucide-react';
import QRCode from 'react-qr-code';
import { AuthContext } from '../context/AuthContext';
import Scanner from '../components/Scanner';
import LibraryAssistant from '../components/LibraryAssistant';
import SpatialMap from '../components/SpatialMap';

export default function StudentPortal() {
 const { user, logout } = useContext(AuthContext);
 const [activeTab, setActiveTab] = useState('dashboard');
 const [searchTerm, setSearchTerm] = useState('');
 const [books, setBooks] = useState([]);
 const [history, setHistory] = useState([]);
 const [studentInfo, setStudentInfo] = useState(null);
 const [recommendations, setRecommendations] = useState([]);
 const [loading, setLoading] = useState(false);
 const [gamification, setGamification] = useState({ score: 0, badge: { name: 'Reader', icon: '🥉' } });
 const [leaderboard, setLeaderboard] = useState([]);
 const [bookReviews, setBookReviews] = useState([]);
 const [showSpatialMap, setShowSpatialMap] = useState(false);
 const [newReviewText, setNewReviewText] = useState('');
 const [newReviewRating, setNewReviewRating] = useState(5);
 const [locatingBook, setLocatingBook] = useState(null);
 const [selectedBook, setSelectedBook] = useState(null);
 
 // Dashboard stats
 const [totalBooks, setTotalBooks] = useState(0);
 const [availableBooks, setAvailableBooks] = useState(0);

 // Appeals
 const [appeals, setAppeals] = useState([]);
 const [appealType, setAppealType] = useState('New Book Request');
 const [appealDescription, setAppealDescription] = useState('');
 const [submittingAppeal, setSubmittingAppeal] = useState(false);

 // Reservations
 const [reservations, setReservations] = useState([]);

 // Notifications
 const [notifications, setNotifications] = useState([]);
 const [notificationsOpen, setNotificationsOpen] = useState(false);
 


 

 const fetchHistory = async () => {
 try {
 const res = await axios.get(`/api/issuance/student/${user.barcode_id}`);
 setHistory(res.data);
 } catch (err) { console.error(err); }
 };

 const fetchStudentInfo = async () => {
 try {
 const res = await axios.get(`/api/users/${user.id}`);
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
 const res = await axios.get(`/api/appeals/user/${user.id}`);
 setAppeals(res.data);
 } catch (err) { console.error(err); }
 };

 const fetchReservations = async () => {
 try {
 const res = await axios.get(`/api/reservations/student/${user.id}`);
 setReservations(res.data);
 } catch (err) { console.error(err); }
 };

 const fetchNotifications = async () => {
 try {
 const res = await axios.get(`/api/notifications/student/${user.id}`);
 setNotifications(res.data);
 } catch (err) { console.error(err); }
 };

 const fetchGamification = async () => {
 try {
 const res = await axios.get(`/api/gamification/user/${user.id}`);
 setGamification(res.data);
 const leadRes = await axios.get('/api/gamification/leaderboard');
 setLeaderboard(leadRes.data);
 } catch (err) { console.error(err); }
 };

 const fetchRecommendations = async () => {
 try {
 const res = await axios.get(`/api/recommendations/${user.id}`);
 setRecommendations(res.data);
 } catch (err) { console.error(err); }
 };

 useEffect(() => {
 fetchHistory();
 fetchStudentInfo();
 fetchBooksData();
 
 if (user?.id) {
 fetchAppeals();
 fetchReservations();
 fetchNotifications();
 fetchGamification();
 fetchRecommendations();
 
 // Ping immediately, then every 60 seconds
 const pingActive = () => axios.post(`/api/users/${user.id}/ping`).catch(console.error);
 pingActive();
 const interval = setInterval(pingActive, 60000);

 // Auto-refresh data every 10 seconds to ensure real-time sync with Librarian
 const dataSyncInterval = setInterval(() => {
 fetchNotifications();
 fetchAppeals();
 fetchReservations();
 }, 10000);

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

 return () => { clearInterval(interval); clearInterval(geoInterval); clearInterval(dataSyncInterval); };
 }
 }, [user?.id]);

 
 const handleSearch = async (e) => {
 e?.preventDefault();
 fetchBooksData();
 };

 const handleCameraScan = (data) => {
 if (data && data.text) {
 setSearchTerm(data.text);
 setActiveTab('search');
 fetchBooksData();
 }
 };

 const markNotificationRead = async (id) => {
 try {
 await axios.put(`/api/notifications/${id}/read`);
 fetchNotifications();
 } catch(err) { console.error(err); }
 };

 const handlePhotoUpload = async (e) => {
 // dummy photo upload
 };

 const submitAppeal = async (e) => {
 e.preventDefault();
 if (!appealDescription) return;
 setSubmittingAppeal(true);
 try {
 await axios.post('/api/appeals', {
 student_id: user.id,
 appeal_type: appealType,
 description: appealDescription
 });
 setAppealDescription('');
 fetchAppeals();
 alert('Appeal submitted successfully!');
 } catch (err) {
 console.error(err);
 } finally {
 setSubmittingAppeal(false);
 }
 };

 const handleReserveBook = async (bookId) => {
 try {
 await axios.post('/api/reservations', { student_id: user.id, book_id: bookId });
 fetchBooksData();
 fetchReservations();
 alert('Reservation successful! You can check its status in the Reservations tab.');
 } catch (err) { 
 console.error(err); 
 alert('Failed to reserve book. Please try again.');
 }
 };
 
 const submitReview = async (e) => {
 e.preventDefault();
 try {
 await axios.post(`/api/reviews`, { book_id: selectedBook.book_id, user_id: user.id, rating: newReviewRating, review_text: newReviewText });
 setNewReviewText('');
 setNewReviewRating(5);
 // fetchReviews();
 } catch (err) { console.error(err); }
 };

 const renderSidebar = () => (
 <div className="w-[280px] bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0 z-20">
 <div className="p-6 border-b border-slate-100 flex items-center gap-3 shrink-0">
 <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100/50 shadow-sm overflow-hidden">
 <img src="/jntugv-logo.png" alt="Logo" className="w-8 h-8 object-contain" />
 </div>
 <h2 className="text-[18px] font-black tracking-tight text-slate-800 leading-tight">JNTUGV Central<br/><span className="text-indigo-600 text-[13px] uppercase tracking-widest font-bold">Smart Library</span></h2>
 </div>
 <nav className="p-4 flex-1 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar">
 <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] font-bold transition-all ${activeTab === 'dashboard' ? 'bg-indigo-500 text-white shadow-[0_4px_12px_rgba(99,102,241,0.25)]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 '}`}>
 <LayoutDashboard className="w-[18px] h-[18px]" /> Dashboard
 </button>
 <button onClick={() => {setActiveTab('search'); fetchBooksData();}} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] font-bold transition-all ${activeTab === 'search' ? 'bg-indigo-500 text-white shadow-[0_4px_12px_rgba(99,102,241,0.25)]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 '}`}>
 <SearchIcon className="w-[18px] h-[18px]" /> Search Catalog
 </button>
 <button onClick={() => setActiveTab('mybooks')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] font-bold transition-all ${activeTab === 'mybooks' ? 'bg-indigo-500 text-white shadow-[0_4px_12px_rgba(99,102,241,0.25)]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 '}`}>
 <BookCopy className="w-[18px] h-[18px]" /> My Books
 </button>
 <button onClick={() => setActiveTab('reservations')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] font-bold transition-all ${activeTab === 'reservations' ? 'bg-indigo-500 text-white shadow-[0_4px_12px_rgba(99,102,241,0.25)]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 '}`}>
 <Calendar className="w-[18px] h-[18px]" /> Reservations
 </button>
 <button onClick={() => setActiveTab('appeals')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] font-bold transition-all ${activeTab === 'appeals' ? 'bg-indigo-500 text-white shadow-[0_4px_12px_rgba(99,102,241,0.25)]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 '}`}>
 <MessageSquare className="w-[18px] h-[18px]" /> Appeals
 </button>

 <button onClick={() => {setActiveTab('leaderboard'); fetchGamification();}} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] font-bold transition-all ${activeTab === 'leaderboard' ? 'bg-indigo-500 text-white shadow-[0_4px_12px_rgba(99,102,241,0.25)]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 '}`}>
 <Trophy className="w-[18px] h-[18px]" /> Leaderboard
 </button>

 <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] font-bold transition-all ${activeTab === 'profile' ? 'bg-indigo-500 text-white shadow-[0_4px_12px_rgba(99,102,241,0.25)]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 '}`}>
 <UserIcon className="w-[18px] h-[18px]" /> My Profile
 </button>

 </nav>
 <div className="p-4 shrink-0 flex flex-col gap-2 border-t border-slate-100 ">
 <button onClick={() => setActiveTab('settings')} className="w-full flex items-center gap-3 px-4 py-3 rounded-[16px] font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all">
 <Settings className="w-[18px] h-[18px]" /> Settings
 </button>
 <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-[16px] font-bold text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all">
 <LogOut className="w-[18px] h-[18px]" /> Sign Out
 </button>
 </div>
 </div>
 );

 
 // Dynamic Calculations for Dashboard
 const activeIssuedBooks = history.filter(h => h.status === 'Issued' || h.status === 'Active').length;
 const activeReservedBooks = reservations.filter(r => r.status === 'Pending').length;
 
 const booksReadCount = history.filter(h => h.status === 'Returned' || h.status === 'Completed').length;
 const pagesReadEst = booksReadCount * 250;
 const readingTimeMins = gamification?.library_time_minutes || (booksReadCount * 60);
 const readingTimeStr = `${Math.floor(readingTimeMins / 60)}h ${readingTimeMins % 60}m`;

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
 countStr: `${cat.count} Books`,
 percent: Math.round((cat.count / totalCatBooks) * 100),
 ...colorObj
 };
 });

 const renderTopBar = () => (

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
 <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="w-10 h-10 rounded-full hover:bg-slate-100 :bg-slate-800 flex items-center justify-center transition-colors relative">
 <Bell className="w-5 h-5 text-slate-600 " strokeWidth={2.5} />
 {notifications.length > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white "></span>}
 </button>
 
 
 {/* NOTIFICATIONS DROPDOWN */}
 {notificationsOpen && (
 <div className="absolute top-[70px] right-24 w-80 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 z-50 overflow-hidden">
 <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50 ">
 <h3 className="font-bold text-slate-800 ">Notifications</h3>
 <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">{notifications.length} New</span>
 </div>
 <div className="max-h-80 overflow-y-auto custom-scrollbar">
 {notifications.length === 0 ? (
 <div className="px-4 py-8 text-center text-slate-500 text-sm font-medium">No new notifications</div>
 ) : (
 notifications.map(n => (
 <div key={n.notification_id} onClick={() => markNotificationRead(n.notification_id)} className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 :bg-slate-700/30 cursor-pointer transition-colors flex gap-3">
 <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-500 shrink-0"></div>
 <div>
 <p className="text-[13px] text-slate-800 font-medium leading-snug">{n.message}</p>
 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(n.created_at).toLocaleDateString()}</span>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 )}
 </div>
 
 <div className="flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer group">
 <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-100 ">
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

 return (
 <>
 <div className="flex w-full h-[100dvh] bg-[#f8fafc] font-sans text-slate-800 overflow-hidden">
 
 {renderSidebar()}

 {/* CENTER COLUMN (DASHBOARD) */}
 <div className="flex-1 flex flex-col h-full overflow-hidden relative border-r border-slate-200 ">
 {renderTopBar()}

 <main className="flex-1 overflow-y-auto p-8 relative bg-[#f8fafc] custom-scrollbar">
 
 {/* DASHBOARD TAB */}
 {activeTab === 'dashboard' && (
 <div className="space-y-8 animate-in fade-in duration-300 max-w-[1000px] mx-auto">
 
 {/* HERO BANNER */}
 <div className="bg-gradient-to-r from-[#f3e8ff] via-[#e0e7ff] to-[#fae8ff] rounded-[32px] p-10 flex items-center justify-between relative overflow-hidden">
 <div className="relative z-10 max-w-sm">
 <h2 className="text-[28px] font-medium text-slate-800 mb-1 tracking-tight">Good Morning,</h2>
 <h1 className="text-[44px] font-black text-slate-900 mb-4 tracking-tight leading-none">{studentInfo?.name?.split(' ')[0] || user?.name || 'Karthik'}! <span className="inline-block animate-wave origin-bottom-right">👋</span></h1>
 <p className="text-slate-600 font-medium text-[14px] mb-8 leading-relaxed">
 Welcome back to JNTUGV Central Library<br/>Continue your quest for knowledge.
 </p>
 <div className="flex gap-4">
 <button onClick={() => {setActiveTab('search'); fetchBooksData();}} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-6 py-3.5 rounded-2xl shadow-[0_8px_20px_rgba(99,102,241,0.3)] transition-all flex items-center gap-2 text-[14px]">
 Explore Books <ChevronRight className="w-4 h-4" />
 </button>
 <button onClick={() => setActiveTab('mybooks')} className="bg-white hover:bg-slate-50 text-slate-700 font-bold px-6 py-3.5 rounded-2xl shadow-sm border border-white transition-all flex items-center gap-2 text-[14px]">
 <BookCopy className="w-4 h-4" /> My Bookshelf
 </button>
 </div>
 </div>
 {/* Decorative 3D Book Illustration Placeholder */}
 <div className="absolute right-0 bottom-0 top-0 w-[45%] bg-gradient-to-l from-white/40 to-transparent pointer-events-none"></div>
 <div className="absolute right-10 bottom-0 pointer-events-none w-64 h-64 opacity-90">
 <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
 <rect x="120" y="40" width="30" height="140" rx="4" fill="#a78bfa" />
 <rect x="85" y="60" width="30" height="120" rx="4" fill="#60a5fa" />
 <rect x="50" y="80" width="30" height="100" rx="4" fill="#fbbf24" />
 <rect x="15" y="100" width="30" height="80" rx="4" fill="#34d399" />
 <path d="M120 45 L150 45 L150 175 L120 175 Z" fill="#8b5cf6" />
 <path d="M85 65 L115 65 L115 175 L85 175 Z" fill="#3b82f6" />
 </svg>
 </div>
 </div>

 {/* STATS CARDS */}
 <div className="grid grid-cols-4 gap-4">
 {[
 { title: 'Total Books', value: totalBooks, icon: <BookOpen className="w-5 h-5 text-indigo-500" />, bg: 'bg-indigo-50', stat: '+265 this month', statColor: 'text-indigo-500', lineChart: 'M0,20 Q10,10 20,25 T40,15 T60,30 T80,10 T100,20', stroke: '#6366f1' },
 { title: 'Available', value: availableBooks, icon: <BookCopy className="w-5 h-5 text-emerald-500" />, bg: 'bg-emerald-50', stat: '+ 78.9% Available', statColor: 'text-emerald-500', lineChart: 'M0,30 Q10,20 20,35 T40,15 T60,20 T80,5 T100,25', stroke: '#10b981' },
 { title: 'Issued', value: activeIssuedBooks, icon: <Bookmark className="w-5 h-5 text-amber-500" />, bg: 'bg-amber-50', stat: '+34 this week', statColor: 'text-amber-500', lineChart: 'M0,25 Q10,35 20,20 T40,30 T60,15 T80,25 T100,10', stroke: '#f59e0b' },
 { title: 'Reserved', value: activeReservedBooks, icon: <Calendar className="w-5 h-5 text-pink-500" />, bg: 'bg-pink-50', stat: '+12 this week', statColor: 'text-pink-500', lineChart: 'M0,15 Q10,5 20,20 T40,10 T60,30 T80,20 T100,5', stroke: '#ec4899' }
 ].map((s, i) => (
 <div key={i} className="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-6 relative overflow-hidden flex flex-col hover:shadow-md transition-shadow">
 <div className="flex gap-4 mb-4">
 <div className={`w-12 h-12 rounded-full ${s.bg} flex items-center justify-center shrink-0`}>
 {s.icon}
 </div>
 <div className="flex flex-col justify-center">
 <p className="text-[13px] font-bold text-slate-500">{s.title}</p>
 <h3 className="text-[24px] font-black text-slate-800 leading-none">{s.value}</h3>
 </div>
 </div>
 <p className={`text-[10px] font-bold ${s.statColor} mb-6`}>{s.stat}</p>
 <svg className="w-full h-8 absolute bottom-0 left-0 right-0 opacity-40" viewBox="0 0 100 40" preserveAspectRatio="none">
 <path d={s.lineChart} fill="none" stroke={s.stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
 <path d={`${s.lineChart} L100,40 L0,40 Z`} fill={`url(#grad${i})`} stroke="none" />
 <defs>
 <linearGradient id={`grad${i}`} x1="0" x2="0" y1="0" y2="1">
 <stop offset="0%" stopColor={s.stroke} stopOpacity="0.3" />
 <stop offset="100%" stopColor={s.stroke} stopOpacity="0" />
 </linearGradient>
 </defs>
 </svg>
 </div>
 ))}
 </div>

 {/* READING ACTIVITY & POPULAR CATEGORIES */}
 <div className="grid grid-cols-2 gap-6">
 {/* Reading Activity */}
 <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-8 flex flex-col">
 <div className="flex justify-between items-center mb-6">
 <h3 className="text-[16px] font-black text-slate-800 ">Reading Activity</h3>
 <span className="text-[11px] font-bold text-indigo-500 cursor-pointer">View Report</span>
 </div>
 <div className="flex items-center gap-8">
 <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
 <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
 <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
 <circle cx="50" cy="50" r="40" fill="none" stroke="#6366f1" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - 0.72)} strokeLinecap="round" />
 </svg>
 <div className="absolute inset-0 flex flex-col items-center justify-center">
 <span className="text-[24px] font-black text-slate-800 leading-none">72%</span>
 <span className="text-[10px] font-bold text-slate-400">This Month</span>
 </div>
 </div>
 <div className="flex-1 space-y-5">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
 <BookOpen className="w-4 h-4 text-indigo-500" />
 </div>
 <div className="flex-1">
 <p className="text-[11px] font-bold text-slate-500">Books Read</p>
 <div className="flex justify-between items-end">
 <span className="text-[16px] font-black text-slate-800 ">{booksReadCount}</span>
 <span className="text-[9px] font-bold text-slate-400">+2 from last month</span>
 </div>
 </div>
 </div>
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center shrink-0">
 <BookCopy className="w-4 h-4 text-cyan-500" />
 </div>
 <div className="flex-1">
 <p className="text-[11px] font-bold text-slate-500">Pages Read</p>
 <div className="flex justify-between items-end">
 <span className="text-[16px] font-black text-slate-800 ">{pagesReadEst.toLocaleString()}</span>
 <span className="text-[9px] font-bold text-slate-400">+320 from last month</span>
 </div>
 </div>
 </div>
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
 <Clock className="w-4 h-4 text-rose-500" />
 </div>
 <div className="flex-1">
 <p className="text-[11px] font-bold text-slate-500">Reading Time</p>
 <div className="flex justify-between items-end">
 <span className="text-[16px] font-black text-slate-800 ">{readingTimeStr}</span>
 <span className="text-[9px] font-bold text-slate-400">+4h 30m from last month</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Popular Categories */}
 <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-8 flex flex-col">
 <div className="flex justify-between items-center mb-6">
 <h3 className="text-[16px] font-black text-slate-800 ">Popular Categories</h3>
 <span className="text-[11px] font-bold text-indigo-500 cursor-pointer">View All</span>
 </div>
 <div className="space-y-4">
 {popularCats.map((cat, i) => (
 <div key={i} className="flex items-center gap-4">
 <div className={`w-8 h-8 rounded-lg ${cat.iconBg} flex items-center justify-center shrink-0`}>
 {cat.icon}
 </div>
 <div className="flex-1">
 <div className="flex justify-between items-center mb-1.5">
 <span className="text-[12px] font-bold text-slate-700">{cat.name}</span>
 <span className="text-[10px] font-bold text-slate-400">{cat.count}</span>
 </div>
 <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
 <div className={`h-full ${cat.color} rounded-full`} style={{width: `${cat.percent}%`}}></div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* RECOMMENDED FOR YOU */}
 <div className="flex flex-col">
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center gap-2">
 <h3 className="text-[18px] font-black text-slate-800 ">Recommended for You</h3>
 <span className="text-[11px] font-bold text-slate-400">Based on your reading history</span>
 </div>
 </div>
 <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
 {books.slice(0, 5).map((book, i) => (
 <div onClick={() => { setActiveTab('search'); setSearchTerm(book.title); }} key={book.book_id || i} className="bg-white p-3 rounded-[20px] border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)] min-w-[240px] flex gap-3 hover:shadow-md transition-all cursor-pointer group">
 <div className={`w-[72px] h-[100px] rounded-xl bg-indigo-500 shadow-inner flex items-center justify-center p-2 relative overflow-hidden group-hover:scale-105 transition-transform`}>
 <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
 <span className="text-[8px] text-white/80 font-black text-center relative z-10 leading-tight">{(book.title || '').toUpperCase()}</span>
 </div>
 <div className="flex flex-col justify-center py-1">
 <h4 className="text-[13px] font-black text-slate-800 leading-tight mb-1 line-clamp-2">{book.title}</h4>
 <p className="text-[10px] font-medium text-slate-500 mb-2">{book.author || 'Unknown'}</p>
 <div className="mt-auto flex items-center gap-1 text-[11px] font-bold text-emerald-500">
 <span>●</span> Available
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>

 </div>
 )}

 
 {/* LEADERBOARD TAB */}
 {activeTab === 'leaderboard' && (
 <div className="space-y-6 animate-in fade-in duration-300">
 <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[32px] p-8 text-white relative overflow-hidden shadow-[0_4px_24px_rgba(99,102,241,0.3)]">
 <div className="absolute right-0 top-0 w-64 h-64 bg-white rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
 <h2 className="text-3xl font-black mb-2 relative z-10">Library Leaderboard</h2>
 <p className="text-indigo-100 font-medium relative z-10 max-w-lg">Rank up by spending time studying in the library, and issuing or returning books. See how you compare to other students!</p>
 </div>

 <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50/50 border-b border-slate-100 ">
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
 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${i === 0 ? 'bg-amber-100 text-amber-600' : i === 1 ? 'bg-slate-200 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
 #{i + 1}
 </div>
 </td>
 <td className="py-5 px-8">
 <span className="font-bold text-slate-800 ">{u.name}</span>
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

{/* SEARCH TAB */}

 {activeTab === 'search' && !locatingBook && (
 <div className="space-y-6 animate-in fade-in duration-300">
 <div className="bg-gradient-to-br from-white to-blue-50/30 p-8 rounded-[32px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] mb-8 relative overflow-hidden">
 <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
 <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight relative z-10">Global Catalog Search</h2>
 <p className="text-slate-500 font-medium relative z-10">Locate books instantly across the entire library system. Matches titles, authors, and ISBNs.</p>
 
 <div className="mt-8 flex flex-col md:flex-row gap-4 relative z-10">
 <div className="relative flex-1 group">
 <SearchIcon className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
 <input 
 type="text"
 value={searchTerm}
 onChange={e => setSearchTerm(e.target.value)}
 placeholder="Search by title, author, ISBN, category keywords..."
 className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700 shadow-sm"
 />
 </div>
 <button onClick={handleSearch} className="bg-indigo-600 text-white font-black px-10 py-4 rounded-2xl shadow-[0_4px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 transition-all whitespace-nowrap">
 Search Catalog
 </button>
 </div>
 </div>

 <div className="flex items-center justify-between mb-4">
 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">{books.length} results found</p>
 </div>
 
 <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
 {books.map(book => (
 <div key={book.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all flex flex-col group relative overflow-hidden">
 {/* Decorative background blur */}
 <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
 
 <div className="flex gap-5 mb-6 relative z-10">
 <div className="w-[84px] h-[116px] bg-indigo-50/50 border border-indigo-100/50 rounded-2xl flex items-center justify-center shrink-0 shadow-inner overflow-hidden group-hover:scale-105 transition-transform">
 <BookOpen className="w-8 h-8 text-indigo-300" />
 </div>
 <div className="flex flex-col pt-1">
 <h3 className="text-lg font-black text-slate-800 leading-tight mb-2 line-clamp-2">{book.title}</h3>
 <p className="text-slate-500 text-sm font-medium mb-3">{book.author}</p>
 <div className="mt-auto">
 <span className={`px-2.5 py-1 text-[9px] font-black rounded-full uppercase tracking-widest border ${book.status === 'Available' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>{book.status}</span>
 </div>
 </div>
 </div>

 <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 flex items-center gap-3 text-xs font-bold text-slate-600 relative z-10 shadow-inner">
 <div className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0">
 <MapPin className="w-4 h-4 text-indigo-500" />
 </div>
 <div className="flex flex-col">
 <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-0.5">Location ID</span>
 <span>Room {book.room?.split(' ')[1] || '02'} • Shelf {book.shelf?.split(' ')[1] || '03'} • Pos 12</span>
 </div>
 </div>

 <div className="flex gap-3 relative z-10 mt-auto">
 <button onClick={() => setSelectedBook(book)} className="flex-1 py-3 rounded-xl border-2 border-slate-100 text-slate-600 font-bold text-sm hover:border-slate-300 hover:bg-slate-50 transition-all">
 Details
 </button>
 <button onClick={() => handleReserveBook(book.id)} className="flex-1 py-3 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm hover:bg-indigo-100 transition-all">
 Reserve
 </button>
 <button onClick={() => setLocatingBook(book)} className="flex-1 py-3 rounded-xl bg-[#0f172a] text-white font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-md">
 <Navigation className="w-4 h-4" /> Locate
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 
 {/* SETTINGS TAB */}
 {activeTab === 'settings' && (
 <div className="space-y-6 animate-in fade-in duration-300">
 <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
 <h2 className="text-3xl font-black text-slate-800 mb-6 tracking-tight">Account Settings</h2>
 <p className="text-slate-500 font-medium mb-8">Manage your account preferences, notifications, and library profile settings.</p>
 <div className="space-y-4">
 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 ">
 <div>
 <h4 className="font-bold text-slate-800 ">Email Notifications</h4>
 <p className="text-xs text-slate-500">Receive emails for due dates and reservations</p>
 </div>
 <input type="checkbox" className="toggle" defaultChecked />
 </div>
 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 ">
 <div>
 <h4 className="font-bold text-slate-800 ">Dark Mode</h4>
 <p className="text-xs text-slate-500">Toggle dark theme interface (Beta)</p>
 </div>
 <input type="checkbox" className="toggle" />
 </div>
 </div>
 </div>
 </div>
 )}

 {/* LOCATE BOOK MAP TAB (Pathfinding) */}
 {activeTab === 'search' && locatingBook && (
 <div className="space-y-6 animate-in fade-in duration-300">
 <button onClick={() => setLocatingBook(null)} className="text-slate-500 font-bold text-sm flex items-center gap-2 hover:text-indigo-600 mb-2 transition-colors">
 <div className="w-8 h-8 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center">
 <ChevronRight className="w-4 h-4 rotate-180" />
 </div>
 Back to Catalog
 </button>

 {showSpatialMap && locatingBook && (
 <SpatialMap locationData={{
 room_number: locatingBook.room || 'CS Room 02',
 section_name: locatingBook.section || 'General',
 rack_number: locatingBook.rack || 'Rack 05',
 shelf_number: locatingBook.shelf || 'Shelf 03',
 position_grid_index: 'Position 12'
 }} onClose={() => setShowSpatialMap(false)} />
 )}

 <div className="flex flex-col lg:flex-row gap-8">
 {/* Left Side: Guidance */}
 <div className="w-full lg:w-[380px] shrink-0 space-y-6">
 <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Target Volume</p>
 <div className="flex items-center gap-5">
 <div className="w-16 h-20 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl flex items-center justify-center shrink-0">
 <BookOpen className="w-6 h-6 text-indigo-400" />
 </div>
 <div>
 <h3 className="font-black text-slate-800 text-lg leading-tight mb-2">{locatingBook.title}</h3>
 <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border border-indigo-100">
 <MapPin className="w-3.5 h-3.5" /> Floor 02 • Room 02
 </div>
 </div>
 </div>
 
 <button onClick={() => setShowSpatialMap(true)} className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 group">
 <Map className="w-5 h-5 group-hover:scale-110 transition-transform" />
 View Interactive 3D Map
 </button>
 </div>

 <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
 <Navigation className="w-4 h-4 text-indigo-500" /> Navigation Guidance
 </p>
 <div className="space-y-8 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500/20 before:via-indigo-500/20 before:to-transparent">
 {[
 { step: 1, title: 'Go to Floor 02', desc: 'Take the elevator or stairs to the designated floor level.' },
 { step: 2, title: 'Enter Room 02', desc: 'Locate the door signpost marking Room 02.' },
 { step: 3, title: `Find "${locatingBook.section || 'Software Engineering'}"`, desc: 'Locate the hanging signs denoting the category section.' },
 { step: 4, title: `Go to ${locatingBook.rack || 'Rack 05'}`, desc: 'Walk down the aisle to find the index labeled 05.', active: true },
 { step: 5, title: `Locate ${locatingBook.shelf || 'Shelf 03'}`, desc: 'Scan vertically to find the 3rd level from the bottom.' },
 { step: 6, title: 'Retrieve Position 12', desc: 'Count horizontally to find the specific slot.' },
 ].map(nav => (
 <div key={nav.step} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
 <div className="flex items-center justify-center w-8 h-8 rounded-full border-[3px] border-white bg-slate-100 text-slate-500 font-black text-xs shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 data-[active=true]:bg-indigo-600 data-[active=true]:text-white data-[active=true]:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-colors" data-active={nav.active}>
 {nav.step}
 </div>
 <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] data-[active=true]:border-indigo-200 data-[active=true]:ring-4 data-[active=true]:ring-indigo-50 transition-all hover:shadow-md" data-active={nav.active}>
 <h4 className="font-black text-slate-800 text-sm mb-1.5">{nav.title}</h4>
 <p className="text-xs text-slate-500 font-medium leading-relaxed">{nav.desc}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 </div>
 </div>
 )}

 {/* MY BOOKS TAB */}
 {activeTab === 'mybooks' && (
 <div className="space-y-6 animate-in fade-in duration-300">
 <div className="bg-white p-8 rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-indigo-500/10 transition-colors duration-500"></div>
 <div className="relative z-10 flex items-center gap-4 mb-2">
 <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm">
 <BookOpen className="w-6 h-6 text-indigo-600" />
 </div>
 <div>
 <h2 className="text-2xl font-black text-slate-800 ">My Books</h2>
 <p className="text-slate-500 font-medium text-sm mt-1">Manage books currently checked out under your account.</p>
 </div>
 </div>
 </div>

 <div className="grid lg:grid-cols-2 gap-6">
 {history.filter(log => log.status === 'Issued').length === 0 ? (
 <div className="col-span-full p-12 text-center flex flex-col items-center justify-center bg-white rounded-[32px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] min-h-[300px]">
 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 ">
 <BookOpen className="w-8 h-8 text-slate-300" />
 </div>
 <p className="text-slate-500 font-medium text-lg">You have no books currently issued.</p>
 <button onClick={() => setActiveTab('search')} className="mt-4 px-6 py-2.5 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-colors text-sm">Browse Catalog</button>
 </div>
 ) : (
 history.filter(log => log.status === 'Issued').map(log => (
 <div key={log.id} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-lg hover:border-indigo-100 transition-all group">
 <div className="flex gap-5 mb-6">
 <div className="w-20 h-28 bg-gradient-to-br from-indigo-50 to-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0 shadow-inner p-2 relative overflow-hidden group-hover:scale-[1.02] transition-transform">
 <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500/20"></div>
 <span className="text-[10px] font-bold text-indigo-400/70 text-center uppercase tracking-widest break-words leading-tight">{log.title}</span>
 </div>
 <div className="flex-1">
 <h3 className="text-lg font-black text-slate-800 leading-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">{log.title}</h3>
 <p className="text-slate-500 font-medium text-xs mb-3 flex items-center gap-1.5"><Barcode className="w-3.5 h-3.5" /> ISBN: {log.isbn || 'N/A'}</p>
 <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider border mb-3 ${log.due_date && new Date(log.due_date) < new Date() ? 'bg-red-50 text-red-600 border-red-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
 {(() => {
 const days = log.due_date ? Math.ceil((new Date(log.due_date) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
 if (days < 0) return <><AlertTriangle className="w-3 h-3" /> Overdue by {Math.abs(days)} days</>;
 return <><Clock className="w-3 h-3" /> Due in {days} days</>;
 })()}
 </div>
 <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
 <MapPin className="w-3.5 h-3.5" /> {log.room || 'Room 01'} • Rack {log.rack || '01'} • Shelf {log.shelf || '01'}
 </div>
 </div>
 </div>
 <div className="flex gap-3 mt-auto">
 <button onClick={() => setSelectedBook(log)} className="flex-1 py-3 rounded-xl border-2 border-slate-100 text-slate-600 font-bold text-xs hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
 Details
 </button>
 <button onClick={() => { setActiveTab('search'); setLocatingBook(log); }} className="flex-1 py-3 rounded-xl bg-[#0f172a] text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2">
 <Navigation className="w-3.5 h-3.5"/> Locate in Library
 </button>
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 )}

 {/* RESERVATIONS TAB */}
 {activeTab === 'reservations' && (
 <div className="space-y-8 animate-in fade-in duration-300">
 <div className="bg-white p-8 rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-fuchsia-500/10 transition-colors duration-500"></div>
 <div className="relative z-10 flex items-center gap-4 mb-2">
 <div className="w-12 h-12 bg-fuchsia-50 rounded-2xl flex items-center justify-center border border-fuchsia-100 shadow-sm">
 <Bookmark className="w-6 h-6 text-fuchsia-600" />
 </div>
 <div>
 <h2 className="text-2xl font-black text-slate-800 ">Reservations & Holds</h2>
 <p className="text-slate-500 font-medium text-sm mt-1">Track your pending book hold requests and queue positions.</p>
 </div>
 </div>
 </div>
 
 <div className="grid xl:grid-cols-2 gap-6">
 {reservations.length === 0 ? (
 <div className="col-span-full p-12 text-center flex flex-col items-center justify-center bg-white rounded-[32px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] min-h-[250px]">
 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 ">
 <Bookmark className="w-6 h-6 text-slate-300" />
 </div>
 <p className="text-slate-500 font-medium text-lg">You have no active reservations.</p>
 </div>
 ) : (
 reservations.map(res => (
 <div key={res.reservation_id} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-lg transition-all group relative overflow-hidden">
 <div className={`absolute top-0 left-0 w-1.5 h-full ${res.status === 'Ready' ? 'bg-emerald-500' : res.status === 'Completed' ? 'bg-blue-500' : res.status === 'Cancelled' ? 'bg-slate-300' : 'bg-amber-500'}`}></div>
 <div className="pl-4">
 <div className="flex justify-between items-start mb-5">
 <div>
 {res.status === 'Ready' ? (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black bg-emerald-50 text-emerald-600 uppercase tracking-widest rounded-lg border border-emerald-100">
 <CheckCircle className="w-3 h-3" /> Ready for Pickup
 </span>
 ) : res.status === 'Completed' ? (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black bg-blue-50 text-blue-600 uppercase tracking-widest rounded-lg border border-blue-100">
 <CheckCircle className="w-3 h-3" /> Completed
 </span>
 ) : res.status === 'Cancelled' ? (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black bg-slate-50 text-slate-600 uppercase tracking-widest rounded-lg border border-slate-200 ">
 <XCircle className="w-3 h-3" /> Cancelled
 </span>
 ) : (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black bg-amber-50 text-amber-600 uppercase tracking-widest rounded-lg border border-amber-100">
 <Clock className="w-3 h-3" /> Waitlisted
 </span>
 )}
 <h3 className="text-xl font-black text-slate-800 mt-3 leading-tight">{res.book_title}</h3>
 <p className="text-sm font-medium text-slate-500 mt-1">{res.author}</p>
 </div>
 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${res.status === 'Ready' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'}`}>
 {res.status === 'Ready' ? <BookOpen className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
 </div>
 </div>
 <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 font-bold flex flex-col gap-2 mb-6">
 {res.status === 'Ready' ? (
 <>
 <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500"/> Item retrieved by librarian</span>
 <span className="flex items-center gap-2 text-rose-500"><AlertTriangle className="w-4 h-4"/> Please collect from the front desk within 48h</span>
 </>
 ) : res.status === 'Pending' ? (
 <>
 <span className="flex items-center gap-2"><Users className="w-4 h-4 text-amber-500"/> Queue Position: <span className="text-slate-800 bg-white px-2 py-0.5 rounded shadow-sm">#{parseInt(res.queue_position) + 1}</span></span>
 <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400"/> Requested on: {new Date(res.created_at).toLocaleDateString()}</span>
 </>
 ) : (
 <span className="flex items-center gap-2 text-slate-400">Status: {res.status}</span>
 )}
 </div>
 </div>
 <div className="pl-4 mt-auto">
 {res.status === 'Ready' && (
 <button className="w-full bg-[#0f172a] text-white font-bold py-3 rounded-xl text-sm hover:bg-slate-800 transition-colors shadow-md flex items-center justify-center gap-2">
 <QrCode className="w-4 h-4" /> Show Collection QR Code
 </button>
 )}
 {res.status === 'Pending' && (
 <button onClick={async () => {
 try {
 await axios.put(`/api/reservations/${res.reservation_id}/status`, { status: 'Cancelled' });
 fetchReservations();
 } catch(e) { console.error(e); }
 }} className="w-full bg-white border-2 border-slate-100 text-slate-600 font-bold py-3 rounded-xl text-sm hover:bg-slate-50 hover:border-slate-300 transition-all">Cancel Reservation</button>
 )}
 </div>
 </div>
 ))
 )}
 </div>
 </div>
 )}

 {/* APPEALS TAB */}
 {activeTab === 'appeals' && (
 <div className="space-y-6 animate-in fade-in duration-300">
 <div className="bg-white p-8 rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 relative overflow-hidden">
 <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
 <div className="relative z-10 flex items-center gap-4 mb-8">
 <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 shadow-sm">
 <MessageSquare className="w-6 h-6 text-amber-600" />
 </div>
 <div>
 <h2 className="text-2xl font-black text-slate-800 ">Submit an Appeal / Request</h2>
 <p className="text-slate-500 font-medium text-sm mt-1">Request a new book to be added to the library or suggest a new feature.</p>
 </div>
 </div>

 <div className="grid lg:grid-cols-2 gap-8 relative z-10">
 {/* Form */}
 <div className="bg-slate-50 p-8 rounded-[24px] border border-slate-100 shadow-inner">
 <form onSubmit={submitAppeal} className="space-y-5">
 <div>
 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Appeal Type</label>
 <div className="relative">
 <select 
 value={appealType} 
 onChange={(e) => setAppealType(e.target.value)}
 className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer"
 >
 <option value="New Book Request">New Book Request</option>
 <option value="Feature Request">Feature Request</option>
 <option value="Other">Other</option>
 </select>
 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
 </div>
 </div>
 <div>
 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
 <textarea 
 value={appealDescription}
 onChange={(e) => setAppealDescription(e.target.value)}
 placeholder="Provide detailed justification for your request..."
 rows={4}
 className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 px-4 text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none"
 required
 />
 </div>
 <button type="submit" disabled={submittingAppeal} className="w-full bg-[#0f172a] text-white font-bold py-3.5 rounded-xl shadow-[0_4px_20px_rgba(15,23,42,0.2)] hover:bg-slate-800 transition-all disabled:opacity-70 disabled:shadow-none flex items-center justify-center gap-2 mt-2">
 {submittingAppeal ? 'Submitting...' : <><Send className="w-4 h-4" /> Submit Request</>}
 </button>
 </form>
 </div>

 {/* History */}
 <div className="flex flex-col">
 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
 <History className="w-3.5 h-3.5" /> Your Appeal History
 </h3>
 <div className="flex-1 bg-white p-6 rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-y-auto max-h-[400px]">
 {appeals.length === 0 ? (
 <div className="flex flex-col items-center justify-center h-full text-slate-400">
 <MessageSquare className="w-8 h-8 mb-3 opacity-20" />
 <p className="text-sm font-bold">No appeals submitted yet.</p>
 </div>
 ) : (
 <div className="space-y-4">
 {appeals.map(app => (
 <div key={app.appeal_id} className="group relative pl-4 pb-4 border-l-2 border-slate-100 last:border-transparent last:pb-0">
 <div className="absolute top-0 left-[-5px] w-2 h-2 rounded-full bg-slate-300 group-hover:bg-indigo-500 transition-colors"></div>
 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:border-indigo-100 group-hover:shadow-sm transition-all">
 <div className="flex justify-between items-start mb-3">
 <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg uppercase tracking-wider border border-indigo-100">{app.appeal_type}</span>
 <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
 app.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
 app.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
 'bg-amber-50 text-amber-600 border-amber-100'
 }`}>{app.status}</span>
 </div>
 <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">{app.description}</p>
 <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(app.created_at).toLocaleDateString()}</p>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* SCAN BOOK TAB */}
 {activeTab === 'scan' && (
 <div className="space-y-6 animate-in fade-in duration-300">
 <div className="bg-white p-8 rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-emerald-500/10 transition-colors duration-500"></div>
 <div className="relative z-10 flex items-center gap-4 mb-2">
 <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
 <Scan className="w-6 h-6 text-emerald-600" />
 </div>
 <div>
 <h2 className="text-2xl font-black text-slate-800 ">QR / Barcode Scanner</h2>
 <p className="text-slate-500 font-medium text-sm mt-1">Automate book checkout and return operations. Simulates linear barcode scans and matrix QR decodes.</p>
 </div>
 </div>
 </div>

 <div className="flex flex-col lg:flex-row gap-6">
 <div className="w-full lg:w-1/2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col">
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Camera className="w-4 h-4" /> Camera Viewfinder</p>
 <div className="flex-1 bg-[#0f172a] rounded-[24px] overflow-hidden relative border-4 border-slate-800 shadow-2xl min-h-[300px]">
 <Scanner onScanSuccess={handleCameraScan} />
 {/* Overlay to make it look premium */}
 <div className="absolute inset-0 pointer-events-none border-[4px] border-white/10 rounded-[20px] z-10"></div>
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-emerald-500/50 rounded-2xl pointer-events-none z-10 shadow-[0_0_0_999px_rgba(15,23,42,0.8)]">
 <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400"></div>
 <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400"></div>
 <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400"></div>
 <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400"></div>
 </div>
 </div>
 </div>
 
 <div className="w-full lg:w-1/2 space-y-6 flex flex-col">
 <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-[32px] border border-indigo-400 shadow-[0_8px_32px_rgba(99,102,241,0.2)] flex flex-col justify-center relative overflow-hidden flex-1 text-white">
 <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
 <div className="absolute -top-24 -right-24 w-48 h-48 bg-white rounded-full blur-3xl"></div>
 <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10"><Zap className="w-4 h-4" /> Instant Locate</p>
 <h3 className="text-3xl font-black mb-3 relative z-10 leading-tight">Scan a book's barcode to instantly locate its position.</h3>
 <p className="text-indigo-100 font-medium text-sm relative z-10">Hold the barcode steady inside the viewfinder frame. Lighting conditions may affect scan speed.</p>
 </div>

 <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Keyboard className="w-4 h-4" /> Manual Entry Override</p>
 <div className="relative mb-4">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
 <Barcode className="w-5 h-5 text-slate-400" />
 </div>
 <input 
 type="text" 
 value={searchTerm} 
 onChange={e => setSearchTerm(e.target.value)} 
 className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 pl-12 pr-4 font-bold text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:font-medium placeholder:text-slate-400" 
 placeholder="Enter book barcode manually..." 
 />
 </div>
 <button onClick={() => handleCameraScan(searchTerm)} className="w-full bg-[#0f172a] text-white font-bold py-3.5 rounded-xl shadow-[0_4px_20px_rgba(15,23,42,0.2)] hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
 <Search className="w-4 h-4" /> Locate Book Manually
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* NOTIFICATIONS TAB */}
 {activeTab === 'notifications' && (
 <div className="space-y-8 animate-in fade-in duration-300">
 <div className="bg-white p-8 rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-blue-500/10 transition-colors duration-500"></div>
 <div className="relative z-10 flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
 <Bell className="w-6 h-6 text-blue-600" />
 </div>
 <div>
 <h2 className="text-2xl font-black text-slate-800 ">Notifications Center</h2>
 <p className="text-slate-500 font-medium text-sm mt-1">Review your personalized advisories, return reminders, and announcements.</p>
 </div>
 </div>
 <div className="text-center bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
 <p className="text-3xl font-black text-indigo-600 leading-none">{notifications.filter(n => !n.is_read).length}</p>
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">UNREAD</p>
 </div>
 </div>
 </div>

 <div className="space-y-4 max-w-4xl mx-auto">
 {notifications.length === 0 && (
 <div className="text-center py-16 flex flex-col items-center justify-center bg-white rounded-[32px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] min-h-[300px]">
 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 ">
 <Bell className="w-8 h-8 text-slate-300" />
 </div>
 <p className="text-slate-500 font-medium text-lg">You have no notifications.</p>
 </div>
 )}
 {notifications.map(notif => (
 <div key={notif.notification_id} className={`p-6 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex gap-5 items-start transition-all relative overflow-hidden group hover:shadow-md ${
 notif.is_read ? 'bg-white border border-slate-100 opacity-70 hover:opacity-100' : 
 notif.type === 'error' ? 'bg-white border border-rose-100' :
 notif.type === 'success' ? 'bg-white border border-emerald-100' :
 notif.type === 'warning' ? 'bg-white border border-amber-100' :
 'bg-white border border-blue-100'
 }`}>
 {!notif.is_read && (
 <div className={`absolute top-0 left-0 w-1.5 h-full ${
 notif.type === 'error' ? 'bg-rose-500' :
 notif.type === 'success' ? 'bg-emerald-500' :
 notif.type === 'warning' ? 'bg-amber-500' :
 'bg-blue-500'
 }`}></div>
 )}
 
 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
 notif.is_read ? 'bg-slate-50 text-slate-400 border border-slate-100 ' :
 notif.type === 'error' ? 'bg-rose-50 text-rose-500 border border-rose-100' :
 notif.type === 'success' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' :
 notif.type === 'warning' ? 'bg-amber-50 text-amber-500 border border-amber-100' :
 'bg-blue-50 text-blue-500 border border-blue-100'
 }`}>
 {notif.type === 'error' ? <AlertTriangle className="w-5 h-5" /> :
 notif.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
 notif.type === 'warning' ? <AlertCircle className="w-5 h-5" /> :
 <Bell className="w-5 h-5" />}
 </div>
 
 <div className="flex-1 pt-1 pl-1">
 <div className="flex justify-between items-start gap-4">
 <h4 className={`font-black text-lg ${notif.is_read ? 'text-slate-600' : 'text-slate-800 '}`}>{notif.title}</h4>
 {!notif.is_read && (
 <button onClick={() => markNotificationRead(notif.notification_id)} className="shrink-0 text-[10px] font-black text-indigo-600 hover:text-white uppercase tracking-widest bg-indigo-50 hover:bg-indigo-600 px-3 py-1.5 rounded-lg shadow-sm border border-indigo-100 hover:border-indigo-600 transition-colors">
 Mark Read
 </button>
 )}
 </div>
 <p className={`text-sm mt-2 ${notif.is_read ? 'text-slate-500' : 'text-slate-600 font-medium whitespace-pre-wrap'}`}>{notif.message}</p>
 <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-widest flex items-center gap-1.5">
 <Clock className="w-3 h-3" /> {new Date(notif.created_at).toLocaleString()}
 </p>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* PROFILE TAB */}
 {activeTab === 'profile' && (
 <div className="space-y-6 animate-in fade-in duration-300">
 <div className="bg-white p-8 rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 relative overflow-hidden group">
 <div className="absolute top-0 right-0 w-64 h-64 bg-slate-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-slate-500/10 transition-colors duration-500"></div>
 <div className="relative z-10 flex items-center gap-4 mb-2">
 <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm">
 <UserIcon className="w-6 h-6 text-slate-600" />
 </div>
 <div>
 <h2 className="text-2xl font-black text-slate-800 ">User Profile</h2>
 <p className="text-slate-500 font-medium text-sm mt-1">Personal details and account preferences.</p>
 </div>
 </div>
 </div>

 <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-center md:items-start gap-10">
 <div className="relative group">
 <div className="w-32 h-32 bg-slate-50 text-indigo-600 rounded-[32px] flex items-center justify-center font-bold text-4xl shadow-inner overflow-hidden border-4 border-white ring-1 ring-slate-100 transition-transform group-hover:scale-105">
 <img src={studentInfo?.profile_photo || user?.profile_photo || "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} alt="Student Profile" className="w-full h-full object-cover" />
 <label className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center text-white text-[10px] uppercase tracking-widest font-black cursor-pointer transition-all">
 Change
 <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
 </label>
 </div>
 <div className="absolute -bottom-3 -right-3 bg-emerald-50 text-emerald-600 p-2 rounded-xl border border-emerald-100 shadow-sm" title="Verified Account">
 <CheckCircle className="w-5 h-5" />
 </div>
 </div>
 
 <div className="flex-1">
 <h3 className="text-3xl font-black text-slate-800 mb-1">{studentInfo?.name || user?.name}</h3>
 <p className="text-indigo-600 font-bold text-sm mb-8 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Premium Access Level</p>
 
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">USERNAME / ID</p>
 <p className="font-bold text-slate-700 truncate">{studentInfo?.barcode_id || user?.name}</p>
 </div>
 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">EMAIL ADDRESS</p>
 <p className="font-bold text-slate-700 truncate">{user?.name}@sdbms.edu</p>
 </div>
 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner col-span-2 lg:col-span-2">
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">INSTITUTION</p>
 <p className="font-bold text-slate-700">SDLBMS Engineering Academy</p>
 </div>
 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">STATUS</p>
 <p className="font-bold text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Active Reader</p>
 </div>
 </div>
 </div>
 
 <div className="flex flex-col items-center bg-slate-50 p-8 rounded-[32px] border border-slate-100 shrink-0 shadow-inner">
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><QrCode className="w-3.5 h-3.5" /> YOUR DIGITAL ID</p>
 <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-md">
 <QRCode value={studentInfo?.barcode_id || user?.barcode_id || user?.name || 'UNKNOWN'} size={140} />
 </div>
 <p className="text-xs font-black text-slate-600 mt-5 tracking-widest uppercase bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">{studentInfo?.barcode_id || user?.barcode_id || user?.name}</p>
 </div>
 </div>
 </div>
 )}

 </main>
 </div>

 {/* RIGHT SIDEBAR (WIDGETS) */}
 
 </div>

{selectedBook && (
 <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
 <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">
 <button onClick={() => setSelectedBook(null)} className="sticky top-0 float-right -mr-2 -mt-2 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors z-10">
 <XCircle className="w-5 h-5"/>
 </button>
 <h3 className="text-2xl font-black text-slate-800 mb-2">{selectedBook.title}</h3>
 <p className="text-slate-500 font-medium mb-6">Author: {selectedBook.author || 'Unknown'}</p>
 <div className="space-y-4">
 <div className="bg-slate-50 p-4 rounded-2xl flex justify-between">
 <span className="font-bold text-slate-500">ISBN</span>
 <span className="font-black text-slate-800 text-right">{selectedBook.isbn || 'N/A'}</span>
 </div>
 <div className="bg-slate-50 p-4 rounded-2xl flex justify-between">
 <span className="font-bold text-slate-500">Category Section</span>
 <span className="font-black text-slate-800 text-right">{selectedBook.section || 'General'}</span>
 </div>
 <div className="bg-slate-50 p-4 rounded-2xl flex justify-between">
 <span className="font-bold text-slate-500">Total Copies</span>
 <span className="font-black text-slate-800 text-right">{selectedBook.total_copies || selectedBook.count || 1}</span>
 </div>
 <div className="bg-slate-50 p-4 rounded-2xl flex justify-between">
 <span className="font-bold text-slate-500">Location</span>
 <span className="font-black text-slate-800 text-right">{selectedBook.room || 'Room 01'} • Rack {selectedBook.rack || '01'} • Shelf {selectedBook.shelf || '01'}</span>
 </div>
 </div>
 <button onClick={() => setSelectedBook(null)} className="mt-8 w-full py-4 rounded-xl bg-[#0f172a] text-white font-black text-sm hover:bg-slate-800 transition-colors shadow-md">
 Close Details
 </button>

 {/* Reviews Section */}
 <div className="mt-8 border-t border-slate-100 pt-6">
 <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-indigo-500"/> Student Reviews</h4>
 
 {/* Review Form */}
 {user?.role === 'student' && (
 <form onSubmit={submitReview} className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 ">
 <div className="flex items-center gap-2 mb-3">
 <span className="text-xs font-bold text-slate-500">Rating:</span>
 <select value={newReviewRating} onChange={e => setNewReviewRating(Number(e.target.value))} className="bg-white border border-slate-200 rounded-lg text-xs py-1 px-2 font-bold text-slate-700 outline-none">
 {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
 </select>
 </div>
 <textarea 
 value={newReviewText} 
 onChange={e => setNewReviewText(e.target.value)} 
 placeholder="Write your review here... Earn +15 points!" 
 className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all min-h-[80px]"
 required
 ></textarea>
 <button type="submit" className="mt-2 w-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-bold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
 <Send className="w-3 h-3" /> Submit Review
 </button>
 </form>
 )}

 {/* Review List */}
 <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
 {bookReviews.map(r => (
 <div key={r.review_id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
 <div className="flex items-center justify-between mb-2">
 <span className="text-xs font-bold text-slate-800 ">{r.reviewer_name}</span>
 <span className="text-xs font-black text-amber-500">{'⭐'.repeat(r.rating)}</span>
 </div>
 <p className="text-sm text-slate-600">{r.review_text}</p>
 </div>
 ))}
 {bookReviews.length === 0 && <p className="text-xs text-slate-500 text-center py-4">No reviews yet. Be the first!</p>}
 </div>
 </div>
 </div>
 </div>
)}

 <LibraryAssistant />
 </>
 );
}



