import { Link, useLocation } from 'react-router-dom';
import { Library, LayoutDashboard, Search, LogOut, User as UserIcon, CheckCircle } from 'lucide-react';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [imgError, setImgError] = useState(false);

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <nav className="w-full md:w-72 bg-white shadow-xl border-r border-slate-200 flex flex-col h-auto md:h-screen sticky top-0 z-50">
      
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col items-center text-center space-y-4">
        {!imgError ? (
          <img 
            src="/jntugv-logo.png" 
            alt="JNTUGV Logo" 
            className="h-24 w-auto object-contain transition-transform hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="bg-primary/10 p-4 rounded-full">
             <Library className="w-14 h-14 text-primary" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-extrabold text-primary tracking-tight leading-tight">
            JNTU-GV <br/> Library
          </h1>
          <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-2">
            Smart Portal
          </p>
        </div>
      </div>
      
      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-hidden">
        {user.role === 'student' && (
          <Link to="/student" className={`flex items-center gap-3 px-4 py-4 text-lg rounded-xl font-bold transition-all whitespace-nowrap ${isActive('/student') ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-primary border border-transparent hover:border-slate-200'}`}>
            <Search className="w-6 h-6 shrink-0" /> <span className="hidden md:inline">Student Portal</span>
          </Link>
        )}

        {user.role === 'librarian' && (
          <Link to="/librarian" className={`flex items-center gap-3 px-4 py-4 text-lg rounded-xl font-bold transition-all whitespace-nowrap ${isActive('/librarian') ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-primary border border-transparent hover:border-slate-200'}`}>
            <CheckCircle className="w-6 h-6 shrink-0" /> <span className="hidden md:inline">Librarian Desk</span>
          </Link>
        )}

        {user.role === 'admin' && (
          <Link to="/admin" className={`flex items-center gap-3 px-4 py-4 text-lg rounded-xl font-bold transition-all whitespace-nowrap ${isActive('/admin') ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-primary border border-transparent hover:border-slate-200'}`}>
            <LayoutDashboard className="w-6 h-6 shrink-0" /> <span className="hidden md:inline">Admin Dashboard</span>
          </Link>
        )}
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center justify-between gap-2 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-primary/10 p-2 rounded-lg shrink-0">
               <UserIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="truncate">
               <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
               <p className="text-xs text-slate-500 font-medium capitalize">{user.role}</p>
            </div>
          </div>
          <button onClick={logout} className="text-red-500 hover:text-white transition-all p-2.5 rounded-lg hover:bg-red-500 bg-red-50 border border-red-100 shrink-0" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
      
    </nav>
  );
}
