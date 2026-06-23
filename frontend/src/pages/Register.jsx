import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Library, UserPlus, AlertTriangle, User, Mail, Lock, Eye, ArrowLeft, ShieldCheck, CheckCircle } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await axios.post('/api/auth/register', { name, email, password, role: 'student' });
      login(res.data.user, res.data.token);
      navigate('/student');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Email might already exist.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #f4f6fc 0%, #edf1fc 100%)'}}>
      
      <div className="flex bg-white rounded-[32px] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.05)] overflow-hidden max-w-[1100px] w-full relative z-10 min-h-[600px] flex-row-reverse">
        
        {/* Left Side (Actually Right Side Layout): Register Form */}
        <div className="w-full lg:w-[55%] flex flex-col p-8 md:p-12 relative bg-white">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-600 font-bold text-sm transition-colors">
               <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </div>
          
          <div className="w-full max-w-[360px] mx-auto flex-1 flex flex-col justify-center pb-6">
            
            <div className="mb-8">
              <h1 className="text-[28px] font-black text-slate-800 tracking-tight leading-tight mb-2">Create Account</h1>
              <p className="text-slate-500 font-medium text-sm">Enter your details to register as a student.</p>
            </div>

            {error && (
              <div className="p-3 mb-6 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl flex items-start gap-3 shadow-sm text-xs font-bold animate-in slide-in-from-top-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-slate-800">Full Name</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <User className="h-4 w-4 text-indigo-400" />
                   </div>
                   <input 
                     type="text" 
                     className="w-full bg-white border border-[#e2e8f0] rounded-[14px] py-3.5 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#9073fd]/20 focus:border-[#9073fd] transition-all outline-none text-slate-700 placeholder-slate-400" 
                     placeholder="Student Name"
                     value={name} 
                     onChange={(e) => setName(e.target.value)} 
                     required 
                   />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-slate-800">University Email</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <Mail className="h-4 w-4 text-indigo-400" />
                   </div>
                   <input 
                     type="email" 
                     className="w-full bg-white border border-[#e2e8f0] rounded-[14px] py-3.5 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#9073fd]/20 focus:border-[#9073fd] transition-all outline-none text-slate-700 placeholder-slate-400" 
                     placeholder="id@jntugv.edu.in"
                     value={email} 
                     onChange={(e) => setEmail(e.target.value)} 
                     required 
                   />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-[13px] font-bold text-slate-800">Password</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <Lock className="h-4 w-4 text-indigo-400" />
                   </div>
                   <input 
                     type={showPassword ? 'text' : 'password'}
                     className="w-full bg-white border border-[#e2e8f0] rounded-[14px] py-3.5 pl-11 pr-11 text-lg font-mono focus:ring-2 focus:ring-[#9073fd]/20 focus:border-[#9073fd] transition-all outline-none text-slate-700 placeholder-slate-400 tracking-widest" 
                     placeholder="••••••"
                     value={password} 
                     onChange={(e) => setPassword(e.target.value)} 
                     required 
                   />
                   <div className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-slate-400 hover:text-indigo-500 transition-colors" onClick={() => setShowPassword(!showPassword)}>
                     <Eye className="h-4 w-4" />
                   </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 pb-2">
                 <input type="checkbox" className="w-4 h-4 rounded-[4px] border-[#e2e8f0] text-[#9073fd] focus:ring-[#9073fd] cursor-pointer" id="terms" required />
                 <label htmlFor="terms" className="text-xs font-bold text-slate-500 cursor-pointer">I agree to the Terms & Conditions</label>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#9073fd] to-[#b360fb] text-white py-4 rounded-[14px] text-[13px] font-bold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? 'Creating...' : (
                   <>
                      Register Account <UserPlus className="w-4 h-4" />
                   </>
                )}
              </button>
            </form>

            <div className="text-center pt-8">
               <p className="text-xs font-medium text-slate-500">
                 Already registered? <Link to="/login" className="text-[#9073fd] font-bold hover:underline">Sign in instead</Link>
               </p>
            </div>
            
          </div>
        </div>

        {/* Right Side (Actually Left Side): Visual Graphic */}
        <div className="hidden lg:flex w-[45%] relative bg-slate-100 overflow-hidden items-center justify-center p-12">
           {/* Background Image with pastel overlay */}
           <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000" alt="JNTUGV Campus" className="absolute inset-0 w-full h-full object-cover" />
           <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-[#f9f5ff]/90 to-[#edf1fc]/95 mix-blend-normal"></div>
           
           <div className="relative z-10 w-full max-w-[360px] flex flex-col items-start mt-8">
              
              <div className="w-20 h-20 bg-white rounded-[20px] shadow-[0_8px_30px_rgba(144,115,253,0.15)] flex items-center justify-center mb-10 border border-white/50 p-2 overflow-hidden">
                 <img 
                    src="/jntugv-logo.png" 
                    alt="JNTUGV" 
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.style.display='none'; }}
                 />
              </div>

              <div className="w-8 h-[3px] bg-[#9073fd] mb-6 rounded-full"></div>
              <h2 className="text-[36px] font-black text-[#2e374a] mb-4 leading-[1.15] tracking-tight">Join the future of <span className="text-[#9073fd]">smart reading.</span></h2>
              <p className="text-[#64748b] leading-relaxed font-medium text-[13px] mb-12 max-w-sm">
                Get instant access to thousands of books, advanced spatial tracking, and seamless checkouts. Your academic journey starts here.
              </p>
              
              <div className="flex flex-col gap-4 w-full">
                 <div className="bg-white/60 backdrop-blur-md border border-white/50 p-4 rounded-2xl flex items-center gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                    <div className="w-10 h-10 bg-[#eef2ff] rounded-full flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-[#5983ff]" />
                    </div>
                    <div>
                       <p className="text-[#2e374a] text-xs font-black">Automatic Barcodes</p>
                       <p className="text-[#64748b] text-[10px] font-medium mt-0.5">Your unique library ID</p>
                    </div>
                 </div>
                 <div className="bg-white/60 backdrop-blur-md border border-white/50 p-4 rounded-2xl flex items-center gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                    <div className="w-10 h-10 bg-[#e0f5ee] rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle className="w-5 h-5 text-[#20c997]" />
                    </div>
                    <div>
                       <p className="text-[#2e374a] text-xs font-black">Instant Activation</p>
                       <p className="text-[#64748b] text-[10px] font-medium mt-0.5">Start borrowing immediately</p>
                    </div>
                 </div>
              </div>
           </div>
           
           {/* Abstract Leaves Decorator (Top Left) */}
           <div className="absolute -top-20 -left-20 opacity-60  pointer-events-none rotate-180">
             <svg width="350" height="350" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
               <path fill="#e0e7ff" d="M42.7,-73.4C55.9,-65.4,67.6,-53.4,75.9,-40C84.3,-26.6,89.3,-11.7,87.6,2.5C86,16.8,77.7,30.3,67.6,41.9C57.6,53.4,45.8,63.1,32.3,70.5C18.9,77.9,3.7,83.1,-11.2,81.4C-26.1,79.7,-40.7,71.2,-53.2,60.6C-65.7,50,-76.1,37.3,-82.1,22.4C-88.1,7.5,-89.7,-9.6,-84.4,-24.5C-79.1,-39.4,-66.9,-52.1,-52.9,-59.8C-38.8,-67.5,-22.9,-70.2,-7.2,-69.3C8.5,-68.4,29.4,-81.4,42.7,-73.4Z" transform="translate(100 100)" />
               <path fill="#f3e8ff" d="M35.4,-64.1C45.3,-53.8,52.3,-41.8,61.4,-28.5C70.5,-15.2,81.8,-0.6,80.6,13.2C79.4,27.1,65.8,40.1,51.8,49.2C37.8,58.3,23.3,63.4,8.2,67.8C-6.9,72.2,-22.6,75.8,-35.1,69.5C-47.6,63.2,-57,47.1,-64.1,31.7C-71.1,16.3,-75.8,1.6,-71.4,-10.8C-67.1,-23.3,-53.6,-33.5,-41,-43.3C-28.5,-53.2,-16.9,-62.7,-2.4,-59.8C12.1,-56.9,25.4,-74.5,35.4,-64.1Z" transform="translate(110 120)" />
             </svg>
           </div>
           
        </div>
      </div>
    </div>
  );
}
