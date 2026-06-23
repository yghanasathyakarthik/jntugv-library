import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Library, Users, BookOpen, AlertCircle, ShieldAlert, Download, Database, LayoutDashboard, PlusCircle, ArrowLeftRight, ClipboardCheck, FileText, Settings as SettingsIcon, LogOut, CheckCircle, Search, QrCode, MapPin, XCircle, Navigation, Calendar, MessageSquare, Check, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Scanner from '../components/Scanner';
import Papa from 'papaparse';
import QRCode from 'react-qr-code';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler);

export default function AdminPortal() {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [predictiveStats, setPredictiveStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleExportCSV = () => {
    if (!stats) return;
    const csvContent = "data:text/csv;charset=utf-8," 
        + "Metric,Value\n"
        + `Total Books,${stats.totalBooks}\n`
        + `Available,${stats.availableBooks}\n`
        + `Issued,${stats.issuedBooks}\n`
        + `Missing,${stats.missingBooks}\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "library_analytics_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Explorer Data
  const [allUsers, setAllUsers] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [adminReservations, setAdminReservations] = useState([]);
  const [adminAppeals, setAdminAppeals] = useState([]);

  // Add Book State
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', section: 'Software Engineering', room: 'Room 02', rack: '', shelf: '', count: 1 });
  const [addMsg, setAddMsg] = useState('');
  const [csvLoading, setCsvLoading] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [showQrBook, setShowQrBook] = useState(null);
  const [localPhoto, setLocalPhoto] = useState(null);

  // Issue / Return State
  const [scanMode, setScanMode] = useState('issue');
  const [scanSuccessModal, setScanSuccessModal] = useState(false);
  const [studentBarcode, setStudentBarcode] = useState('');
  const [locatingBook, setLocatingBook] = useState(null);
  const [assetBarcode, setAssetBarcode] = useState('');
  const [scanMsg, setScanMsg] = useState('');
  const [scanErr, setScanErr] = useState('');

  useEffect(() => {
    fetchStats();
    fetchExplorerData();
    const interval = setInterval(() => { fetchStats(); fetchExplorerData(); }, 10000);
    
    // Request notification permission for PWA
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }

    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/analytics');
      setStats(res.data);
      const predRes = await axios.get('/api/analytics/predictive');
      setPredictiveStats(predRes.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExplorerData = async () => {
    try {
      const [usersRes, logsRes, booksRes, reservationsRes, appealsRes] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/analytics/issuance-logs'),
        axios.get('/api/books'),
        axios.get('/api/reservations'),
        axios.get('/api/appeals')
      ]);
      setAllUsers(usersRes.data);
      setAllLogs(logsRes.data);
      setAllBooks(booksRes.data);
      setAdminReservations(reservationsRes.data);
      setAdminAppeals(appealsRes.data);
    } catch (err) {
      console.error('Failed to fetch explorer data', err);
    }
  };

  const handleAddBook = async () => {
    setAddMsg('');
    try {
      const res = await axios.post('/api/books', newBook);
      setAddMsg('Book registered successfully!');
      if (res.data.assets && res.data.assets.length > 0) {
        setShowQrBook({ title: newBook.title, asset_id: res.data.assets[0] });
      }
      setNewBook({ title: '', author: '', isbn: '', section: 'Software Engineering', room: 'Room 02', rack: '', shelf: '', count: 1 });
      fetchExplorerData();
      fetchStats();
    } catch (err) {
      setAddMsg('Error adding book.');
      console.error(err);
    }
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvLoading(true);
    setAddMsg('');
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const mappedBooks = results.data.map(row => ({
            title: row.Title || row.title,
            author: row.Author || row.author,
            isbn: row.ISBN || row.isbn || '',
            section: row.Section || row.section || 'General',
            room: row.Room || row.room || 'Room 01',
            rack: row.Rack || row.rack || '01',
            shelf: row.Shelf || row.shelf || '01',
            count: parseInt(row.Copies || row.copies || 1),
            barcode: row.Barcode || row.barcode || null
          })).filter(b => b.title);

          if (mappedBooks.length === 0) {
            setAddMsg('Error: No valid books found in CSV. Ensure there is a "Title" column.');
            setCsvLoading(false);
            return;
          }

          const res = await axios.post('/api/books/bulk', mappedBooks);
          setAddMsg(res.data.message);
          fetchExplorerData();
          fetchStats();
        } catch (err) {
          setAddMsg('Error processing CSV upload.');
          console.error(err);
        } finally {
          setCsvLoading(false);
          e.target.value = null;
        }
      },
      error: (error) => {
        setAddMsg(`CSV Parsing error: ${error.message}`);
        setCsvLoading(false);
      }
    });
  };

  const handleEditBookSubmit = async () => {
    try {
      await axios.put(`/api/books/${editBook.id}`, editBook);
      setEditBook(null);
      fetchExplorerData();
      fetchStats();
    } catch (err) {
      console.error(err);
      alert('Error updating book details.');
    }
  };

  const updateReservationStatus = async (id, status) => {
    try {
      await axios.put(`/api/reservations/${id}/status`, { status });
      fetchExplorerData();
    } catch(e) { console.error(e); }
  };

  const updateAppealStatus = async (id, status) => {
    try {
      await axios.put(`/api/appeals/${id}/status`, { status });
      fetchExplorerData();
    } catch(e) { console.error(e); }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const id = user?.barcode_id || user?.id;
          if (!id) return;
          await axios.put(`/api/users/${id}/photo`, { photo: reader.result });
          setLocalPhoto(reader.result);
        } catch (err) {
          console.error('Failed to upload photo', err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraScan = async (decodedText) => {
    setScanMsg(''); setScanErr('');
    if (!studentBarcode) {
      setStudentBarcode(decodedText);
      setScanMsg('Student ID captured! Now scan Book Asset ID.');
      setScanSuccessModal(true);
      setTimeout(() => setScanSuccessModal(false), 2500);
    } else if (decodedText !== studentBarcode) {
      setAssetBarcode(decodedText);
      try {
        if (scanMode === 'issue') {
          const res = await axios.post('/api/issuance/issue', { barcode_id: studentBarcode, asset_id: decodedText });
          setScanMsg(res.data.message || 'Book issued successfully!');
          if ("Notification" in window && Notification.permission === "granted") {
             new Notification('Book Issued Successfully', { body: `Asset ${decodedText} issued to ${studentBarcode}`, icon: '/pwa-192x192.png' });
          }
        } else {
          const res = await axios.post('/api/issuance/return', { barcode_id: studentBarcode, asset_id: decodedText });
          setScanMsg(res.data.message || 'Book returned successfully!');
          if ("Notification" in window && Notification.permission === "granted") {
             new Notification('Book Returned Successfully', { body: `Asset ${decodedText} returned by ${studentBarcode}`, icon: '/pwa-192x192.png' });
          }
        }
        setAssetBarcode('');
        fetchExplorerData();
        fetchStats();
      } catch (err) {
        setScanErr(err.response?.data?.message || 'Transaction failed.');
        setAssetBarcode('');
      }
    }
  };

  const handleScanAction = async () => {
    setScanMsg(''); setScanErr('');
    if (!studentBarcode || !assetBarcode) {
      setScanErr('Both Student Barcode and Asset Barcode are required.');
      return;
    }
    try {
      if (scanMode === 'issue') {
        const res = await axios.post('/api/issuance/issue', { barcode_id: studentBarcode, asset_id: assetBarcode });
        setScanMsg(res.data.message || 'Book issued successfully!');
        if ("Notification" in window && Notification.permission === "granted") {
           new Notification('Book Issued Successfully', { body: `Asset ${assetBarcode} issued to ${studentBarcode}`, icon: '/pwa-192x192.png' });
        }
      } else {
        const res = await axios.post('/api/issuance/return', { barcode_id: studentBarcode, asset_id: assetBarcode });
        setScanMsg(res.data.message || 'Book returned successfully!');
        if ("Notification" in window && Notification.permission === "granted") {
           new Notification('Book Returned Successfully', { body: `Asset ${assetBarcode} returned by ${studentBarcode}`, icon: '/pwa-192x192.png' });
        }
      }
      setStudentBarcode('');
      setAssetBarcode('');
      fetchExplorerData();
      fetchStats();
    } catch (err) {
      setScanErr(err.response?.data?.message || 'Transaction failed.');
    }
  };

  const Sidebar = () => (
    <div className="w-full md:w-72 h-auto md:h-screen sticky top-0 shrink-0 z-20 p-2 md:p-4 flex flex-col">
      <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-row md:flex-col h-full border border-slate-100 overflow-x-auto md:overflow-hidden">
        <div className="p-4 md:p-6 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white p-1 md:p-1.5 rounded-xl shrink-0 overflow-hidden border border-[#e2e8f0] shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex items-center justify-center">
             <img src="/jntugv-logo.png" alt="JNTUGV" className="w-full h-full object-contain " />
          </div>
          <h1 className="text-[14px] md:text-[18px] font-black text-slate-800 tracking-tight leading-tight hidden md:block">JNTUGV<br/><span className="text-[#9073fd] text-[10px] md:text-[11px] uppercase tracking-widest font-bold">Smart Library</span></h1>
        </div>
        
        <div className="px-5 pb-4 hidden md:block">
          <div className="bg-[#f4f7fe] rounded-2xl p-3 flex items-center gap-3 border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm overflow-hidden shrink-0 relative group">
              <img src={localPhoto || user?.profile_photo || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} alt="Admin Profile" className="w-full h-full object-cover" />
              <label className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white text-[10px] font-bold cursor-pointer transition-all">
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
            <div>
              <p className="text-xs font-black text-slate-800">{user?.name || 'System Admin'}</p>
              <p className="text-[10px] font-bold text-slate-400 capitalize">Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-2 md:px-4 space-x-2 md:space-x-0 space-y-0 md:space-y-1.5 overflow-x-auto md:overflow-y-auto py-2 flex flex-row md:flex-col items-center md:items-stretch">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'addbook', icon: PlusCircle, label: 'Add Book' },
            { id: 'manage', icon: Library, label: 'Manage Books' },
            { id: 'members', icon: Users, label: 'Members' },
            { id: 'issue', icon: ArrowLeftRight, label: 'Issue / Return' },
            { id: 'audit', icon: ClipboardCheck, label: 'Inventory Audit' },
            { id: 'reports', icon: FileText, label: 'Reports' },
            { id: 'reservations', icon: Calendar, label: 'Reservations' },
            { id: 'appeals', icon: MessageSquare, label: 'Appeals' },
            { id: 'settings', icon: SettingsIcon, label: 'Settings' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`whitespace-nowrap shrink-0 w-auto md:w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl text-[10px] md:text-xs font-bold transition-all ${activeTab === item.id ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20' : 'text-slate-500 hover:bg-[#f4f7fe] hover:text-blue-600'}`}
            >
              <item.icon className={`w-4 h-4 md:w-[18px] md:h-[18px] ${activeTab === item.id ? 'text-white' : 'text-blue-400'}`} /> <span className="hidden sm:inline md:inline">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-2 md:p-4 shrink-0 flex items-center justify-center border-l md:border-l-0 md:border-t border-slate-100">
          <button onClick={logout} className="w-auto md:w-full flex items-center justify-center md:justify-start gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl text-xs font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all">
            <LogOut className="w-[18px] h-[18px] text-red-400" /> <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  const TopBar = () => (
    <div className="flex flex-col md:flex-row items-center justify-between px-4 md:px-6 w-full pt-4 md:pt-6 pb-2 gap-4 md:gap-6">
      {/* Left side: Profile & Greeting */}
      <div className="flex flex-col gap-1 shrink-0 z-10 w-full md:w-auto text-center md:text-left">
        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Dashboard Overview</h1>
        <div className="flex items-center justify-center md:justify-start gap-3 mt-2 bg-white rounded-full py-1.5 pl-1.5 pr-5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] w-fit mx-auto md:mx-0 hover:shadow-md transition-all cursor-pointer">
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
            <img src={localPhoto || user?.profile_photo || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <span className="text-sm font-bold text-slate-700">{user?.name || 'System Admin'}</span>
        </div>
      </div>

      {/* Right side: Beautiful Framed Photo */}
      <div className="w-full md:flex-1 h-32 md:h-36 max-w-[600px] rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] border-4 border-white md:ml-auto relative group">
        <img src="/library-building.jpg" alt="Library Building" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" onError={(e) => {e.target.src="https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80"}} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent opacity-80"></div>
        <div className="absolute bottom-4 left-5 flex items-center gap-2">
           <Library className="w-4 h-4 text-white" />
           <span className="text-white text-[11px] font-black tracking-widest uppercase">JNTUGV Campus Library</span>
        </div>
      </div>
    </div>
  );

  const lineData = {
    labels: ['1 May', '8 May', '15 May', '22 May', '29 May'],
    datasets: [
      {
        label: 'Issued',
        data: [120, 190, 170, 240, 280],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Returned',
        data: [100, 160, 140, 210, 250],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const statusData = {
    labels: ['Computer Science', 'Electronics & Comm.'],
    datasets: [{
      data: [65, 35],
      backgroundColor: ['#3b82f6', '#94a3b8'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  return (
    <>
    <div className="flex flex-col md:flex-row w-full h-[100dvh] bg-[#f4f7fe] overflow-hidden font-sans relative">
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative z-10 px-2 md:px-4">
        <TopBar />
        
        <div className="p-4 md:p-6 max-w-7xl mx-auto w-full relative pb-20">
          
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Verified Access Pill */}
              <div className="absolute top-0 right-6 flex justify-end w-full -mt-2">
                <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-green-100 shadow-sm">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified Access
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#d9e8fc] to-[#e8f1fd] p-10 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-blue-100 flex flex-col md:flex-row items-center justify-between overflow-hidden relative mt-4">
                <div className="z-10 relative max-w-lg">
                  <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Admin Control Hub</h2>
                  <p className="text-slate-600 font-medium text-sm leading-relaxed max-w-sm">Real-time spatial inventory status, user management & comprehensive system transaction logs.</p>
                </div>
                <div className="hidden md:block absolute right-[-5%] top-0 bottom-0 w-1/2">
                  <div className="absolute right-10 top-1/2 -translate-y-1/2 w-64 h-64 bg-white/40 rounded-full blur-3xl"></div>
                  <div className="absolute right-32 top-1/2 -translate-y-1/2 w-48 h-48 bg-blue-300/30 rounded-full blur-2xl"></div>
                  <Database className="absolute right-16 top-1/2 -translate-y-1/2 w-48 h-48 text-blue-500/20 drop-shadow-xl" strokeWidth={1} />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'TOTAL BOOKS', value: stats?.totalBooks || 0, color: 'text-slate-800', icon: <Library className="w-5 h-5 text-blue-500" />, bg: 'bg-blue-50' },
                  { label: 'AVAILABLE', value: stats?.availableBooks || 0, color: 'text-green-600', icon: <BookOpen className="w-5 h-5 text-green-600" />, bg: 'bg-green-50' },
                  { label: 'ISSUED', value: stats?.issuedBooks || 0, color: 'text-amber-500', icon: <ArrowLeftRight className="w-5 h-5 text-amber-500" />, bg: 'bg-amber-50' },
                  { label: 'MISSING', value: stats?.missingBooks || 0, color: 'text-rose-500', icon: <AlertCircle className="w-5 h-5 text-rose-500" />, bg: 'bg-rose-50' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${stat.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                        {stat.icon}
                      </div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight">{stat.label}</p>
                    </div>
                    <p className={`text-4xl font-black ${stat.color} pl-1`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Predictive Analytics Chart */}
              <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] mt-8">
                 <h3 className="font-black text-slate-800 mb-6 tracking-tight text-lg flex items-center gap-2">
                   <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                   AI Predictive Demand Analysis
                 </h3>
                 <div className="h-[300px] w-full">
                   {predictiveStats && predictiveStats.length > 0 ? (
                     <Bar 
                       options={{
                         responsive: true,
                         maintainAspectRatio: false,
                         plugins: { legend: { position: 'top' }, title: { display: false } },
                         scales: {
                           y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                           x: { grid: { display: false } }
                         }
                       }} 
                       data={{
                         labels: predictiveStats.map(p => p.category),
                         datasets: [
                           {
                             label: 'Current Demand',
                             data: predictiveStats.map(p => p.current_demand),
                             backgroundColor: 'rgba(148, 163, 184, 0.5)',
                             borderRadius: 4
                           },
                           {
                             label: 'Predicted Growth (Next 30 Days)',
                             data: predictiveStats.map(p => p.predicted_demand),
                             backgroundColor: 'rgba(79, 70, 229, 0.8)',
                             borderRadius: 4
                           }
                         ]
                       }}
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-medium">Insufficient data for prediction</div>
                   )}
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Issued vs Returned Chart */}
                <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100 p-6 lg:col-span-2">
                  <h3 className="text-lg font-black text-slate-800 mb-6">Issued vs Returned (This Month)</h3>
                  <div className="h-64">
                    <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }} />
                  </div>
                </div>

                {/* Top Subjects Chart */}
                <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100 p-6 flex flex-col items-center justify-between">
                  <h3 className="text-lg font-black text-slate-800 mb-6 w-full">Top Subject Departments</h3>
                  <div className="w-full max-w-[200px] flex-1 flex items-center justify-center">
                    <Doughnut data={statusData} options={{ plugins: { legend: { position: 'bottom' } }, cutout: '75%' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ADD BOOK TAB */}
          {activeTab === 'addbook' && (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
                 <div className="relative z-10">
                   <h2 className="text-2xl font-black text-slate-800 mb-2">Add New Book Volume</h2>
                   <p className="text-slate-500 font-medium">Register dynamic print volumes and assign grid coordinate maps.</p>
                 </div>
               </div>
               
               <div className="flex flex-col xl:flex-row gap-6">
                  <div className="flex-1 space-y-6">
                     {addMsg && <div className={`p-5 rounded-[16px] font-bold text-sm ${addMsg.includes('Error') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>{addMsg}</div>}
                     <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                        <h3 className="text-[11px] font-black text-[#0f172a] uppercase tracking-widest mb-6 flex items-center gap-2"><BookOpen className="w-4 h-4 text-indigo-500"/> Book Metadata Information</h3>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="col-span-2">
                             <label className="block text-[11px] font-black text-[#0f172a] mb-2 uppercase tracking-widest">Book Title</label>
                             <input type="text" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-[14px] py-3.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" placeholder="e.g. Introduction to Algorithms" />
                           </div>
                           <div>
                             <label className="block text-[11px] font-black text-[#0f172a] mb-2 uppercase tracking-widest">Author Name</label>
                             <input type="text" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-[14px] py-3.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" placeholder="e.g. Thomas H. Cormen" />
                           </div>
                           <div>
                             <label className="block text-[11px] font-black text-[#0f172a] mb-2 uppercase tracking-widest">ISBN-13 Number</label>
                             <input type="text" value={newBook.isbn} onChange={e => setNewBook({...newBook, isbn: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-[14px] py-3.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" placeholder="e.g. 978-0262033848" />
                           </div>
                           <div>
                             <label className="block text-[11px] font-black text-[#0f172a] mb-2 uppercase tracking-widest">Number of Copies</label>
                             <input type="number" min="1" value={newBook.count} onChange={e => setNewBook({...newBook, count: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-[14px] py-3.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" placeholder="1" />
                           </div>
                           <div className="col-span-2">
                             <label className="block text-[11px] font-black text-[#0f172a] mb-2 uppercase tracking-widest">Subject Category</label>
                             <select value={newBook.section} onChange={e => setNewBook({...newBook, section: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-[14px] py-3.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[position:right_12px_center] bg-no-repeat pr-10">
                               <option>Software Engineering (Computer Science)</option>
                               <option>Mathematics</option>
                               <option>Physics</option>
                             </select>
                           </div>
                        </div>
                     </div>

                     <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                        <h3 className="text-[11px] font-black text-[#0f172a] uppercase tracking-widest mb-6 flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500"/> Physical Location Assignment Coordinates</h3>
                        <div className="grid grid-cols-2 gap-6">
                           <div>
                             <label className="block text-[11px] font-black text-[#0f172a] mb-2 uppercase tracking-widest">Physical Room</label>
                             <input type="text" value={newBook.room} onChange={e => setNewBook({...newBook, room: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-[14px] py-3.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" placeholder="Room 02" />
                           </div>
                           <div>
                             <label className="block text-[11px] font-black text-[#0f172a] mb-2 uppercase tracking-widest">Rack Number</label>
                             <input type="text" value={newBook.rack} onChange={e => setNewBook({...newBook, rack: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-[14px] py-3.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" placeholder="e.g. 05" />
                           </div>
                           <div className="col-span-2">
                             <label className="block text-[11px] font-black text-[#0f172a] mb-2 uppercase tracking-widest">Shelf Level Number</label>
                             <input type="text" value={newBook.shelf} onChange={e => setNewBook({...newBook, shelf: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-[14px] py-3.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" placeholder="e.g. 03" />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="w-full xl:w-[320px] shrink-0 bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] h-fit relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50 pointer-events-none"></div>
                     <h3 className="text-[11px] font-black text-[#0f172a] uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10"><QrCode className="w-4 h-4 text-purple-500"/> Codes Generator Tools</h3>
                     <div className="flex gap-2 mb-6 relative z-10">
                        <button className="flex-1 py-2.5 bg-slate-50 rounded-[12px] text-slate-500 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-100 transition-colors"><span className="w-3 h-0.5 bg-slate-400"></span> Barcode</button>
                        <button className="flex-1 py-2.5 bg-indigo-50 text-indigo-700 rounded-[12px] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-indigo-100 transition-colors"><QrCode className="w-3.5 h-3.5"/> QR Code</button>
                     </div>
                     <div className="bg-slate-50 border border-slate-100 rounded-[16px] aspect-square flex flex-col items-center justify-center mb-8 relative z-10">
                        <QrCode className="w-20 h-20 text-slate-300 mb-4" />
                        <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">Preview Area</span>
                     </div>
                     <button onClick={handleAddBook} className="w-full bg-indigo-600 text-white font-black text-sm py-4 rounded-[14px] mb-8 shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-colors active:scale-95 relative z-10">
                        Save Book to Database
                     </button>
                     
                     <div className="pt-6 border-t border-slate-100 relative z-10">
                        <p className="text-[11px] font-black text-[#0f172a] uppercase tracking-widest mb-3">Bulk Import via CSV</p>
                        <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">Upload a CSV file with columns: Title, Author, ISBN, Copies, Section, Room, Rack, Shelf, Barcode (comma separated for multiple copies).</p>
                        <div className="relative">
                           <input type="file" accept=".csv" onChange={handleCSVUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={csvLoading} />
                           <div className={`w-full py-3.5 rounded-[14px] border-2 border-dashed font-bold text-xs flex justify-center items-center transition-all ${csvLoading ? 'border-slate-200 text-slate-400 bg-slate-50' : 'border-indigo-200 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50'}`}>
                              {csvLoading ? 'Processing CSV...' : 'Upload CSV File'}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* MANAGE BOOKS TAB */}
          {activeTab === 'manage' && (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex justify-between items-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
                 <div className="relative z-10">
                   <h2 className="text-2xl font-black text-slate-800 mb-2">Manage Books Inventory</h2>
                   <p className="text-slate-500 font-medium">Global catalog of all books in the database.</p>
                 </div>
               </div>
               
               <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
                  <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50/50 text-slate-500 uppercase tracking-widest font-black text-[10px] sticky top-0 z-10 backdrop-blur-md">
                        <tr>
                          <th className="px-8 py-5">Title & Author</th>
                          <th className="px-8 py-5">Asset Barcode</th>
                          <th className="px-8 py-5">Location Map</th>
                          <th className="px-8 py-5">Status</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {allBooks.map((b) => (
                          <tr key={b.id} className="hover:bg-indigo-50/30 transition-colors group">
                            <td className="px-8 py-5">
                               <p className="font-black text-slate-800 text-base group-hover:text-indigo-600 transition-colors">{b.title}</p>
                               <p className="text-slate-500 font-medium text-sm">{b.author || 'Unknown'}</p>
                            </td>
                            <td className="px-8 py-5 font-mono text-slate-500 text-sm font-medium">{b.asset_id}</td>
                            <td className="px-8 py-5 text-slate-500 text-sm font-medium">
                               <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-400"/>{b.room} • Rack {b.rack} • Shelf {b.shelf}</span>
                            </td>
                            <td className="px-8 py-5 font-bold">
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${b.available_copies > 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 'bg-rose-50 text-rose-600 border border-rose-100/50'}`}>
                                {b.available_copies > 0 ? `${b.available_copies} / ${b.total_copies} Available` : 'All Issued'}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right flex gap-3 justify-end items-center">
                               <button onClick={() => setLocatingBook(b)} className="text-blue-600 font-bold hover:text-blue-800 text-sm flex items-center gap-1.5"><Navigation className="w-4 h-4"/> Locate</button>
                               <button onClick={() => setShowQrBook(b)} className="text-emerald-600 font-bold hover:text-emerald-800 text-sm flex items-center gap-1.5"><QrCode className="w-4 h-4"/> Show QR</button>
                               <button onClick={() => setEditBook(b)} className="text-indigo-600 font-bold hover:text-indigo-800 text-sm hover:underline underline-offset-4 decoration-2">Edit Details</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
          )}

          {/* MEMBERS TAB */}
          {activeTab === 'members' && (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex justify-between items-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
                 <div className="relative z-10">
                   <h2 className="text-2xl font-black text-slate-800 mb-2">Members Directory</h2>
                   <p className="text-slate-500 font-medium">Manage student accounts and librarian accesses.</p>
                 </div>
               </div>
               
               <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
                  <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50/50 text-slate-500 uppercase tracking-widest font-black text-[10px] sticky top-0 z-10 backdrop-blur-md">
                        <tr>
                          <th className="px-8 py-5">User Details</th>
                          <th className="px-8 py-5">Barcode ID</th>
                          <th className="px-8 py-5">Role</th>
                          <th className="px-8 py-5">Status / Fines</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {allUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-indigo-50/30 transition-colors group">
                            <td className="px-8 py-5">
                               <p className="font-black text-slate-800 text-base group-hover:text-indigo-600 transition-colors">{u.name}</p>
                               <p className="text-slate-500 font-medium text-sm">{u.email}</p>
                            </td>
                            <td className="px-8 py-5 font-mono text-slate-500 text-sm font-medium">{u.barcode_id}</td>
                            <td className="px-8 py-5 text-slate-500 text-sm font-bold uppercase tracking-widest">{u.role}</td>
                            <td className="px-8 py-5 font-bold">
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${u.fines > 0 ? 'bg-rose-50 text-rose-600 border border-rose-100/50' : 'bg-emerald-50 text-emerald-600 border border-emerald-100/50'}`}>
                                {u.fines > 0 ? `$${u.fines} Fines` : 'Clear Status'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
          )}

          {/* ISSUE / RETURN TAB */}
          {activeTab === 'issue' && (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
                 <div className="relative z-10">
                   <h2 className="text-2xl font-black text-slate-800 mb-2">QR / Barcode Scanning Pipeline</h2>
                   <p className="text-slate-500 font-medium">Automate book check-out and return operations. Simulates linear barcode scans and matrix QR decodes.</p>
                 </div>
                 <div className="relative z-10 flex bg-slate-50/50 p-1.5 rounded-xl border border-slate-100">
                   <button onClick={() => {setScanMode('issue'); setScanMsg(''); setScanErr('');}} className={`px-6 py-2.5 rounded-[10px] font-bold text-xs transition-all ${scanMode === 'issue' ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100/50' : 'text-slate-500 hover:text-slate-800 bg-transparent'}`}>Issue Book</button>
                   <button onClick={() => {setScanMode('return'); setScanMsg(''); setScanErr('');}} className={`px-6 py-2.5 rounded-[10px] font-bold text-xs transition-all ${scanMode === 'return' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100/50' : 'text-slate-500 hover:text-slate-800 bg-transparent'}`}>Return Book</button>
                 </div>
               </div>

               <div className="flex flex-col lg:flex-row gap-6">
                  <div className="w-full lg:w-1/2 bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                     <div className="flex justify-between items-center mb-6">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                           <QrCode className="w-4 h-4 text-slate-400" />
                           CAMERA VIEWFINDER
                        </p>
                        <button onClick={() => {setStudentBarcode(''); setAssetBarcode('');}} className="text-indigo-600 hover:text-indigo-700 font-bold text-[11px] uppercase tracking-widest transition-colors">Clear Scans</button>
                     </div>
                     <div className="w-full max-w-sm mx-auto overflow-hidden rounded-[20px] border-4 border-slate-100 shadow-inner bg-slate-50">
                        <Scanner onScanSuccess={handleCameraScan} onScanFailure={() => {}} />
                     </div>
                     <div className="mt-8 border-t border-slate-100 pt-8 space-y-6">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">MANUAL ENTRY / SCAN SIMULATION</p>
                        <div>
                           <label className="block text-[11px] font-black text-[#0f172a] mb-2 uppercase tracking-widest">Student ID Barcode</label>
                           <input type="text" value={studentBarcode} onChange={e => setStudentBarcode(e.target.value)} className="w-full bg-white border border-slate-200 rounded-[14px] py-3.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" placeholder="Scan or enter student ID..." />
                        </div>
                        <div>
                           <label className="block text-[11px] font-black text-[#0f172a] mb-2 uppercase tracking-widest">Book Asset Barcode</label>
                           <input type="text" value={assetBarcode} onChange={e => setAssetBarcode(e.target.value)} className="w-full bg-white border border-slate-200 rounded-[14px] py-3.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" placeholder="Scan or enter book asset ID..." />
                        </div>
                        <button onClick={handleScanAction} className={`w-full text-white font-bold py-3.5 rounded-[14px] shadow-md transition-all active:scale-95 ${scanMode === 'issue' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'}`}>
                           {scanMode === 'issue' ? 'Issue Book to Student' : 'Process Book Return'}
                        </button>
                     </div>
                  </div>
                  
                  <div className="w-full lg:w-1/2 space-y-6">
                     <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-center items-center text-center h-64 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 w-full text-left relative z-10">Transaction Result Logs</p>
                        <div className="p-4 w-full text-center relative z-10 flex-1 flex items-center justify-center">
                           {scanMsg && <div className="w-full p-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-[14px] font-bold flex flex-col items-center justify-center gap-2 animate-in slide-in-from-bottom-2"><CheckCircle className="w-8 h-8 text-emerald-500"/>{scanMsg}</div>}
                           {scanErr && <div className="w-full p-4 bg-rose-50 text-rose-700 border border-rose-100 rounded-[14px] font-bold flex flex-col items-center justify-center gap-2 animate-in slide-in-from-bottom-2"><AlertCircle className="w-8 h-8 text-rose-500"/>{scanErr}</div>}
                           {!scanMsg && !scanErr && <p className="text-slate-400 font-medium flex flex-col items-center gap-3"><QrCode className="w-8 h-8 opacity-50"/>Ready to scan items.</p>}
                        </div>
                     </div>

                     <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                        <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">Global Issuance Log <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">(Recent)</span></h3>
                        <div className="space-y-3">
                           {allLogs.slice(0, 5).map(log => (
                             <div key={log.issuance_id} className="p-4 bg-slate-50/50 rounded-[16px] border border-slate-100 flex justify-between items-center">
                                <div>
                                   <p className="font-bold text-slate-800 text-sm">{log.book_title}</p>
                                   <p className="text-xs text-slate-500 font-medium mt-0.5">Student: {log.student_name}</p>
                                </div>
                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${log.actual_return_timestamp ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                   {log.actual_return_timestamp ? 'Returned' : 'Issued'}
                                </span>
                             </div>
                           ))}
                           {allLogs.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No logs found.</p>}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* AUDIT TAB */}
          {activeTab === 'audit' && (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
                 <div className="relative z-10">
                   <h2 className="text-2xl font-black text-slate-800 mb-2">Inventory Audit</h2>
                   <p className="text-slate-500 font-medium">Identify discrepancies between the digital database and physical shelves.</p>
                 </div>
                 <button className="relative z-10 bg-indigo-600 text-white font-black text-sm px-8 py-3.5 rounded-[14px] shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5"/> Start Physical Audit
                 </button>
               </div>
               <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center gap-3 mb-8">
                     <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-4 h-4 text-emerald-600"/>
                     </div>
                     <h3 className="text-xs font-black text-emerald-800 tracking-widest uppercase">Latest Discrepancies Found</h3>
                  </div>
                  <div className="p-12 text-center bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[24px] text-slate-500 font-medium flex flex-col items-center">
                     <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                        <ShieldAlert className="w-10 h-10 text-emerald-500" />
                     </div>
                     <p className="text-lg font-bold text-slate-700 mb-2">Perfectly Synced</p>
                     <p className="text-sm">No missing books detected in the last scan. Your inventory is perfectly synced with physical shelves.</p>
                  </div>
               </div>
            </div>
          )}

          {/* REPORTS TAB */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
                 <div className="relative z-10">
                   <h2 className="text-2xl font-black text-slate-800 mb-2">Data Reports & Exports</h2>
                   <p className="text-slate-500 font-medium">Generate compliance logs, fine reports, and catalog exports.</p>
                 </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow group">
                     <div className="w-16 h-16 bg-indigo-50 rounded-[18px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <FileText className="w-8 h-8 text-indigo-600" />
                     </div>
                     <h3 className="text-lg font-black text-slate-800 mb-2">Master Analytics CSV</h3>
                     <p className="text-sm text-slate-500 mb-8 font-medium">A complete breakdown of total books, available stock, and issued assets across all physical locations.</p>
                     <button onClick={handleExportCSV} className="w-full bg-indigo-50 text-indigo-700 font-black text-sm py-3.5 rounded-[14px] hover:bg-indigo-100 transition-colors active:scale-95">
                        Download CSV Report
                     </button>
                  </div>
                  <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow group">
                     <div className="w-16 h-16 bg-emerald-50 rounded-[18px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Users className="w-8 h-8 text-emerald-500" />
                     </div>
                     <h3 className="text-lg font-black text-slate-800 mb-2">Active Fines Report</h3>
                     <p className="text-sm text-slate-500 mb-8 font-medium">Detailed roster of all students with pending monetary fines for late returns or damaged assets.</p>
                     <button className="w-full bg-emerald-50 text-emerald-700 font-black text-sm py-3.5 rounded-[14px] hover:bg-emerald-100 transition-colors active:scale-95">
                        Generate PDF Roster
                     </button>
                  </div>
               </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
                 <div className="relative z-10">
                   <h2 className="text-2xl font-black text-slate-800 mb-2">Account Settings</h2>
                   <p className="text-slate-500 font-medium">Manage your portal preferences and security parameters.</p>
                 </div>
               </div>
               <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] max-w-2xl">
                  <div className="space-y-6">
                     <div>
                        <label className="block text-[11px] font-black text-[#0f172a] mb-2 uppercase tracking-widest">Operator Name</label>
                        <div className="relative">
                           <input type="text" defaultValue={user?.name || 'admin'} className="w-full bg-slate-50 border border-slate-200 rounded-[14px] py-3.5 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                           <Users className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-[11px] font-black text-[#0f172a] mb-2 uppercase tracking-widest">Profile Photo</label>
                        <div className="relative">
                           <input type="file" accept="image/*" onChange={handlePhotoUpload} className="w-full bg-slate-50 border border-slate-200 rounded-[14px] py-2.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-[11px] font-black text-[#0f172a] mb-2 uppercase tracking-widest">System Theme</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-[14px] py-3.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M6%209L12%2015L18%209%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[position:right_12px_center] bg-no-repeat pr-10">
                           <option>Light Mode (Default)</option>
                           <option>Dark Mode</option>
                           <option>Auto (System Sync)</option>
                        </select>
                     </div>
                     <div className="pt-6 border-t border-slate-100 mt-8">
                        <button className="bg-slate-800 text-white font-black text-sm py-3.5 px-8 rounded-[14px] shadow-md hover:bg-slate-700 transition-colors active:scale-95">
                           Save Configuration
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* EDIT BOOK MODAL */}
          {editBook && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
               <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                  <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                     <Library className="w-5 h-5 text-indigo-600" />
                     Edit Book Details
                  </h3>
                  <div className="space-y-5">
                     <div>
                        <label className="block text-[11px] font-black text-[#0f172a] mb-2 uppercase tracking-widest">Book Title</label>
                        <input type="text" value={editBook.title} onChange={e => setEditBook({...editBook, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-[14px] py-3.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                     </div>
                     <div>
                        <label className="block text-[11px] font-black text-[#0f172a] mb-2 uppercase tracking-widest">ISBN Number</label>
                        <input type="text" value={editBook.isbn} onChange={e => setEditBook({...editBook, isbn: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-[14px] py-3.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[11px] font-black text-[#0f172a] mb-2 uppercase tracking-widest">Total Copies</label>
                           <input type="number" value={editBook.total_copies} onChange={e => setEditBook({...editBook, total_copies: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-[14px] py-3.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                        </div>
                        <div>
                           <label className="block text-[11px] font-black text-[#0f172a] mb-2 uppercase tracking-widest">Available</label>
                           <input type="number" value={editBook.available_copies} onChange={e => setEditBook({...editBook, available_copies: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-[14px] py-3.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                        </div>
                     </div>
                  </div>
                  <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100">
                     <button onClick={() => setEditBook(null)} className="flex-1 py-3.5 font-black text-slate-500 bg-slate-100 rounded-[14px] hover:bg-slate-200 transition-colors text-sm">Cancel</button>
                     <button onClick={handleEditBookSubmit} className="flex-1 py-3.5 font-black text-white bg-indigo-600 rounded-[14px] shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-colors text-sm active:scale-95">Save Changes</button>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
    
          {showQrBook && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
               <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                 <div className="p-8 text-center relative">
                   <button onClick={() => setShowQrBook(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors">
                     <XCircle className="w-5 h-5" />
                   </button>
                   <h3 className="text-xl font-black text-slate-800 mb-2">Book Asset QR</h3>
                   <p className="text-slate-500 font-medium text-sm mb-8">{showQrBook.title}</p>
                   <div className="bg-white p-4 rounded-2xl border-4 border-slate-100 shadow-sm inline-block mx-auto">
                     <QRCode value={showQrBook.asset_id} size={200} />
                   </div>
                   <p className="mt-6 font-mono text-lg font-black tracking-widest text-indigo-600">{showQrBook.asset_id}</p>
                   <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-2 font-bold">Scan at checkout desk</p>
                 </div>
               </div>
            </div>
          )}

          {scanSuccessModal && (
            <div className="fixed inset-0 bg-emerald-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
               <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-8 text-center">
                 <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                   <CheckCircle className="w-8 h-8" />
                 </div>
                 <h3 className="text-xl font-black text-slate-800 mb-2">Student Scanned!</h3>
                 <p className="text-slate-500 font-medium text-sm">Success! Student ID captured. Now scan the book.</p>
               </div>
            </div>
          )}

          {/* RESERVATIONS TAB */}
          {activeTab === 'reservations' && (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-100 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
                 <div className="relative z-10">
                   <h2 className="text-2xl font-black text-slate-800 mb-2">Book Reservations</h2>
                   <p className="text-slate-500 font-medium text-sm">Manage student book reservations and update status.</p>
                 </div>
               </div>

               <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100">
                             <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                             <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Book</th>
                             <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                             <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                             <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {adminReservations.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="p-8 text-center text-slate-400 font-medium">No reservations found.</td>
                            </tr>
                          ) : (
                            adminReservations.map(res => (
                              <tr key={res.reservation_id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                  <p className="text-sm font-bold text-slate-800">{res.student_name}</p>
                                  <p className="text-[10px] text-slate-500 font-medium">{res.student_barcode}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-sm font-bold text-slate-800">{res.book_title}</p>
                                  <p className="text-[10px] text-slate-500 font-medium">{res.author}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                                    res.status === 'Ready' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                    res.status === 'Cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                    res.status === 'Completed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                    'bg-amber-50 text-amber-600 border-amber-100'
                                  }`}>{res.status}</span>
                                </td>
                                <td className="px-6 py-4 text-xs font-medium text-slate-500">
                                  {new Date(res.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {res.status === 'Pending' && (
                                    <div className="flex justify-end gap-2">
                                      <button onClick={() => updateReservationStatus(res.reservation_id, 'Ready')} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"><Check className="w-4 h-4" /></button>
                                      <button onClick={() => updateReservationStatus(res.reservation_id, 'Cancelled')} className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                                    </div>
                                  )}
                                  {res.status === 'Ready' && (
                                    <button onClick={() => updateReservationStatus(res.reservation_id, 'Completed')} className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold rounded-lg transition-colors">Mark Completed</button>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                       </tbody>
                    </table>
                  </div>
               </div>
            </div>
          )}

          {/* APPEALS TAB */}
          {activeTab === 'appeals' && (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="bg-white p-8 rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
                 <div className="relative z-10">
                   <h2 className="text-2xl font-black text-slate-800 mb-2">Student Appeals</h2>
                   <p className="text-slate-500 font-medium text-sm">Review feature requests, new book requests, and fine appeals.</p>
                 </div>
               </div>

               <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100">
                             <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                             <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                             <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                             <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                             <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {adminAppeals.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="p-8 text-center text-slate-400 font-medium">No appeals found.</td>
                            </tr>
                          ) : (
                            adminAppeals.map(app => (
                              <tr key={app.appeal_id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                  <p className="text-sm font-bold text-slate-800">{app.student_name}</p>
                                  <p className="text-[10px] text-slate-500 font-medium">{app.student_barcode}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg uppercase tracking-wider border border-indigo-100">{app.appeal_type}</span>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-700 max-w-xs truncate" title={app.description}>
                                  {app.description}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                                    app.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                    app.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                                    'bg-amber-50 text-amber-600 border-amber-100'
                                  }`}>{app.status}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {app.status === 'Pending' && (
                                    <div className="flex justify-end gap-2">
                                      <button onClick={() => updateAppealStatus(app.appeal_id, 'Approved')} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"><Check className="w-4 h-4" /></button>
                                      <button onClick={() => updateAppealStatus(app.appeal_id, 'Rejected')} className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                       </tbody>
                    </table>
                  </div>
               </div>
            </div>
          )}
{locatingBook && (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
    <div className="bg-white w-full max-w-3xl rounded-[32px] shadow-2xl p-8 relative animate-in zoom-in-95 duration-300 my-8">
      <button onClick={() => setLocatingBook(null)} className="absolute top-6 right-6 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors z-20">
        <XCircle className="w-5 h-5"/>
      </button>
      
      <div className="flex flex-col md:flex-row gap-8">
         <div className="w-full md:w-1/3 shrink-0">
             <div className="w-full aspect-[3/4] bg-gradient-to-br from-indigo-50 to-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center shadow-inner relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-3 h-full bg-indigo-500/20"></div>
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
               <span className="text-xl font-black text-indigo-400/50 uppercase tracking-widest px-6 text-center leading-tight transform -rotate-12 group-hover:scale-110 transition-transform duration-700">{locatingBook.title}</span>
             </div>
             <div className="mt-6 text-center">
                <h3 className="text-xl font-black text-slate-800 leading-tight mb-2">{locatingBook.title}</h3>
                <p className="text-sm font-medium text-slate-500">{locatingBook.author || 'Unknown Author'}</p>
             </div>
         </div>
         <div className="flex-1">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
               <Navigation className="w-4 h-4 text-indigo-500" /> Navigation Guidance
             </p>
             <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-500/20 before:via-indigo-500/20 before:to-transparent">
                {[
                  { step: 1, title: 'Go to Floor 02', desc: 'Take the elevator or stairs to the designated floor level.' },
                  { step: 2, title: `Enter ${locatingBook.room || 'Room 02'}`, desc: `Locate the door signpost marking ${locatingBook.room || 'Room 02'}.` },
                  { step: 3, title: `Find "${locatingBook.section || 'Software Engineering'}"`, desc: 'Locate the hanging signs denoting the category section.' },
                  { step: 4, title: `Go to Rack ${locatingBook.rack || '05'}`, desc: `Walk down the aisle to find the index labeled ${locatingBook.rack || '05'}.`, active: true },
                  { step: 5, title: `Locate Shelf ${locatingBook.shelf || '03'}`, desc: `Scan vertically to find the level.` },
                  { step: 6, title: 'Retrieve Book', desc: 'Count horizontally to find the specific slot.' },
                ].map(nav => (
                  <div key={nav.step} className="relative flex items-center group is-active pl-12">
                    <div className="absolute left-0 flex items-center justify-center w-8 h-8 rounded-full border-[3px] border-white bg-slate-100 text-slate-500 font-black text-xs shadow-md shrink-0 z-10 data-[active=true]:bg-indigo-600 data-[active=true]:text-white data-[active=true]:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-colors" data-active={nav.active}>
                      {nav.step}
                    </div>
                    <div className="w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] data-[active=true]:border-indigo-200 data-[active=true]:ring-4 data-[active=true]:ring-indigo-50 transition-all hover:shadow-md" data-active={nav.active}>
                      <h4 className="font-black text-slate-800 text-sm mb-1">{nav.title}</h4>
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
          
    </>
  );
}




