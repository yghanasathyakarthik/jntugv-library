import { MapPin, Navigation, QrCode, Bookmark, BookOpen, Library, GraduationCap, Globe, BookMarked, ShieldCheck, Zap, Laptop, Smartphone, Users, User, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 w-full relative overflow-hidden font-sans flex flex-col">
      
      {/* Main Container replacing the old hero and features */}
      <div className="mx-4 md:mx-8 my-4 md:my-8 bg-white rounded-[40px] shadow-[0_8px_40px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col relative z-10">
        
        {/* Navbar */}
        <div className="flex justify-between items-center px-6 md:px-12 py-6">
           <Link to="/" className="flex items-center gap-4 group">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex items-center justify-center border border-[#e2e8f0] p-1.5 shrink-0 overflow-hidden">
                 <img src="/jntugv-logo.png" alt="JNTUGV" className="w-full h-full object-contain " />
              </div>
              <h1 className="text-[28px] font-black text-slate-800 tracking-tight">
                JNTUGV <span className="text-[#9073fd]">Central Library</span>
              </h1>
           </Link>
           <div className="flex gap-4">
              <Link to="/login" className="px-6 py-2.5 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors border border-slate-200 rounded-[14px] hover:bg-slate-50 flex items-center gap-2">
                <User className="w-4 h-4" /> Sign In
              </Link>
              <Link to="/register" className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-[#9073fd] to-[#b360fb] text-white rounded-[14px] shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Register
              </Link>
           </div>
        </div>

        {/* Hero Area */}
        <div className="px-4 md:px-8 pb-8">
          <div className="relative w-full rounded-[32px] overflow-visible bg-slate-50 flex flex-col items-center pt-20 pb-32">
             {/* Background Image with Pastel Overlay */}
             <div className="absolute inset-0 w-full h-full rounded-[32px] overflow-hidden">
               <img src="/jntugv_library.png" alt="Library Background" className="w-full h-full object-cover object-center" />
               <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/80 to-white/95 mix-blend-normal"></div>
               <div className="absolute inset-0 bg-gradient-to-r from-purple-100/60 via-transparent to-blue-100/60 "></div>
             </div>

             {/* Content */}
             <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto px-4 mt-8">
                
                {/* Pill */}
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#f9f5ff] backdrop-blur-md border border-[#e9d5ff] text-[#9073fd] font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] mb-8 shadow-sm">
                   <GraduationCap className="w-4 h-4" /> Empowering Minds, Enriching Futures
                </div>

                {/* Headline */}
                <h1 className="text-[52px] md:text-[80px] font-black text-[#1e293b] tracking-tight leading-[1.05] mb-6 drop-shadow-sm">
                  The Pinnacle of <br/>
                  <span className="bg-gradient-to-r from-[#9073fd] to-[#38bdf8] bg-clip-text text-transparent">Academic Excellence.</span>
                </h1>

                {/* Divider Icon */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="h-[2px] w-12 bg-indigo-100 rounded-full"></div>
                  <BookOpen className="w-6 h-6 text-[#9073fd]" />
                  <div className="h-[2px] w-12 bg-indigo-100 rounded-full"></div>
                </div>

                {/* Paragraph */}
                <div className="flex flex-col items-center gap-4 mb-20">
                   <p className="text-slate-600 font-bold text-[16px] md:text-[18px] max-w-[850px] leading-relaxed">
                     Welcome to the Dr. YSR Central Library of JNTUGV. A monumental repository of knowledge spanning engineering, sciences, and humanities. Our state-of-the-art infrastructure houses thousands of volumes, global journals, and cutting-edge digital archives to fuel your academic journey.
                   </p>
                   <p className="text-slate-500 font-medium text-[15px] max-w-[700px] leading-relaxed">
                     Experience a completely modernized approach to reading and research. With our smart digital integrations, spatial tracking, and seamlessly connected digital portals, you are perfectly equipped to push the boundaries of innovation.
                   </p>
                </div>

                {/* Cards Container */}
                <div className="absolute bottom-[-140px] left-1/2 -translate-x-1/2 w-[90%] max-w-5xl">
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
                     {/* Card 1 */}
                     <div className="bg-[#fcfaff] border border-[#f3e8ff] rounded-[24px] p-6 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgba(144,115,253,0.06)] backdrop-blur-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#e9d5ff] to-[#d8b4fe] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-14 h-14 rounded-full bg-white border border-[#f3e8ff] flex items-center justify-center mb-4 shadow-sm">
                           <BookOpen className="w-6 h-6 text-[#9073fd]" />
                        </div>
                        <h3 className="text-[26px] font-black text-[#1e293b]">50,000+</h3>
                        <p className="text-[#a78bfa] text-[10px] font-bold uppercase tracking-widest mt-1">Physical Volumes</p>
                        <div className="w-8 h-[3px] bg-[#9073fd]/20 rounded-full mt-5"></div>
                     </div>

                     {/* Card 2 */}
                     <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-[24px] p-6 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgba(34,197,94,0.06)] backdrop-blur-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#bbf7d0] to-[#86efac] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-14 h-14 rounded-full bg-white border border-[#dcfce7] flex items-center justify-center mb-4 shadow-sm">
                           <Globe className="w-6 h-6 text-[#22c55e]" />
                        </div>
                        <h3 className="text-[26px] font-black text-[#1e293b]">10,000+</h3>
                        <p className="text-[#4ade80] text-[10px] font-bold uppercase tracking-widest mt-1">E-Journals</p>
                        <div className="w-8 h-[3px] bg-[#22c55e]/20 rounded-full mt-5"></div>
                     </div>

                     {/* Card 3 */}
                     <div className="bg-[#fff7ed] border border-[#ffedd5] rounded-[24px] p-6 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgba(249,115,22,0.06)] backdrop-blur-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#fed7aa] to-[#fdba74] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-14 h-14 rounded-full bg-white border border-[#ffedd5] flex items-center justify-center mb-4 shadow-sm">
                           <Users className="w-6 h-6 text-[#f97316]" />
                        </div>
                        <h3 className="text-[26px] font-black text-[#1e293b]">5,000+</h3>
                        <p className="text-[#fb923c] text-[10px] font-bold uppercase tracking-widest mt-1">Active Members</p>
                        <div className="w-8 h-[3px] bg-[#f97316]/20 rounded-full mt-5"></div>
                     </div>

                     {/* Card 4 */}
                     <div className="bg-[#f0f9ff] border border-[#e0f2fe] rounded-[24px] p-6 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgba(56,189,248,0.06)] backdrop-blur-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#bae6fd] to-[#7dd3fc] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-14 h-14 rounded-full bg-white border border-[#e0f2fe] flex items-center justify-center mb-4 shadow-sm">
                           <BookMarked className="w-6 h-6 text-[#38bdf8]" />
                        </div>
                        <h3 className="text-[26px] font-black text-[#1e293b]">200+</h3>
                        <p className="text-[#7dd3fc] text-[10px] font-bold uppercase tracking-widest mt-1">Topics & Domains</p>
                        <div className="w-8 h-[3px] bg-[#38bdf8]/20 rounded-full mt-5"></div>
                     </div>
                   </div>
                </div>
             </div>
          </div>
          
          {/* Added extra padding to replace arrow space */}
          <div className="w-full h-24"></div>

        </div>

      {/* Importance Section (Features) */}
      <div className="max-w-7xl mx-auto px-6 pb-20 relative z-10 w-full flex-1">
        <div className="text-center mb-16 max-w-3xl mx-auto mt-10">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[#9073fd] font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] mb-6 shadow-sm">
             <BookMarked className="w-4 h-4" /> Discover Capabilities
           </div>
           <h2 className="text-[36px] md:text-[44px] font-black text-[#1e293b] tracking-tight mb-4">Why Our Library Matters</h2>
           <p className="text-[15px] text-[#64748b] font-medium leading-relaxed">Books are the quietest and most constant of friends; they are the most accessible and wisest of counselors. Our vast collection empowers students to research deeply, think critically, and innovate.</p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
           {/* Feature 1 */}
           <div className="bg-[#fcfaff] rounded-[32px] p-8 border border-[#f3e8ff] shadow-[0_8px_30px_rgba(144,115,253,0.04)] hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 border border-[#f3e8ff] shadow-sm group-hover:scale-110 transition-transform">
                 <Navigation className="w-6 h-6 text-[#9073fd]" />
              </div>
              <h3 className="text-[18px] font-black text-[#1e293b] mb-3">Spatial Book Tracking</h3>
              <p className="text-[#64748b] text-[14px] font-medium leading-relaxed">No more wandering aisles. Our system provides exact physical coordinates (Room, Rack, Shelf) for every single book in the library.</p>
           </div>
           
           {/* Feature 2 */}
           <div className="bg-[#f0fdf4] rounded-[32px] p-8 border border-[#dcfce7] shadow-[0_8px_30px_rgba(34,197,94,0.04)] hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 border border-[#dcfce7] shadow-sm group-hover:scale-110 transition-transform">
                 <QrCode className="w-6 h-6 text-[#22c55e]" />
              </div>
              <h3 className="text-[18px] font-black text-[#1e293b] mb-3">Smart QR Scanning</h3>
              <p className="text-[#64748b] text-[14px] font-medium leading-relaxed">Automated checkouts and returns using built-in QR and barcode scanners. Enjoy a completely frictionless borrowing experience.</p>
           </div>

           {/* Feature 3 */}
           <div className="bg-[#eff6ff] rounded-[32px] p-8 border border-[#e0f2fe] shadow-[0_8px_30px_rgba(59,130,246,0.04)] hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 border border-[#e0f2fe] shadow-sm group-hover:scale-110 transition-transform">
                 <ShieldCheck className="w-6 h-6 text-[#38bdf8]" />
              </div>
              <h3 className="text-[18px] font-black text-[#1e293b] mb-3">Secure Digital Portals</h3>
              <p className="text-[#64748b] text-[14px] font-medium leading-relaxed">Dedicated dashboards for Students, Librarians, and Admins. Track your history, manage reservations, and pay fines securely.</p>
           </div>

           {/* Feature 4 */}
           <div className="bg-[#fdf4ff] rounded-[32px] p-8 border border-[#fae8ff] shadow-[0_8px_30px_rgba(217,70,239,0.04)] hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 border border-[#fae8ff] shadow-sm group-hover:scale-110 transition-transform">
                 <Zap className="w-6 h-6 text-[#d946ef]" />
              </div>
              <h3 className="text-[18px] font-black text-[#1e293b] mb-3">Instant Notifications</h3>
              <p className="text-[#64748b] text-[14px] font-medium leading-relaxed">Receive real-time alerts for overdue books, reservation availabilities, and new arrivals directly in your dashboard.</p>
           </div>

           {/* Feature 5 */}
           <div className="bg-[#fff1f2] rounded-[32px] p-8 border border-[#ffe4e6] shadow-[0_8px_30px_rgba(244,63,94,0.04)] hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 border border-[#ffe4e6] shadow-sm group-hover:scale-110 transition-transform">
                 <Laptop className="w-6 h-6 text-[#f43f5e]" />
              </div>
              <h3 className="text-[18px] font-black text-[#1e293b] mb-3">Digital Archives</h3>
              <p className="text-[#64748b] text-[14px] font-medium leading-relaxed">Seamless access to digital dissertations, past examination papers, and premium e-journals from anywhere on campus.</p>
           </div>

           {/* Feature 6 */}
           <div className="bg-[#fff7ed] rounded-[32px] p-8 border border-[#ffedd5] shadow-[0_8px_30px_rgba(249,115,22,0.04)] hover:-translate-y-2 transition-all duration-300 group">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 border border-[#ffedd5] shadow-sm group-hover:scale-110 transition-transform">
                 <Smartphone className="w-6 h-6 text-[#f97316]" />
              </div>
              <h3 className="text-[18px] font-black text-[#1e293b] mb-3">Appeals & Requests</h3>
              <p className="text-[#64748b] text-[14px] font-medium leading-relaxed">Can't find a book? Submit purchase requests or fine appeals directly through the portal for quick administrative review.</p>
           </div>
        </div>
      </div>

      </div>

      {/* Footer */}
      <footer className="bg-[#0f172a] pt-16 pb-8 px-6 border-t-[8px] border-indigo-600">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-10 border-b border-slate-800 pb-10">
            {/* Logo & Address */}
            <div className="max-w-md text-center md:text-left">
               <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                     <Library className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">JNTUGV <span className="text-indigo-400">Library</span></h2>
               </div>
               <h4 className="text-indigo-400 font-bold uppercase tracking-widest text-sm mb-3">Contact Us:</h4>
               <p className="text-slate-400 font-medium leading-relaxed text-sm">
                 JAWAHARLAL NEHRU TECHNOLOGICAL UNIVERSITY-GURAJADA VIZIANAGARAM,<br/>
                 DWARAPUDI, VIZIANAGARAM,<br/>
                 ANDHRA PRADESH - 535 003, INDIA.
               </p>
            </div>

            {/* Links */}
            <div className="flex gap-10">
               <div className="text-center md:text-right">
                  <Link to="/login" className="block text-slate-400 hover:text-white font-medium mb-3 transition-colors">Student Login</Link>
                  <Link to="/login" className="block text-slate-400 hover:text-white font-medium mb-3 transition-colors">Admin Login</Link>
                  <Link to="#" className="block text-slate-400 hover:text-white font-medium transition-colors">Privacy & Policy</Link>
               </div>
            </div>
         </div>

         {/* Copyright */}
         <div className="max-w-7xl mx-auto pt-8 text-center flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 font-medium text-sm">
               Copyright © 2026 JNTU-GV Vizianagaram. All Rights Reserved.
            </p>
            <div className="flex items-center gap-2 text-slate-600 text-sm font-bold">
               Powered by SmartLibrary
            </div>
         </div>
      </footer>
    </div>
  );
}
