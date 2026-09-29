import { MapPin, Navigation, QrCode, Bookmark, BookOpen, Library, GraduationCap, Globe, BookMarked, ShieldCheck, Zap, Laptop, Smartphone, Users, User, UserPlus, Sparkles, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 w-full relative overflow-hidden font-sans flex flex-col">
      
      {/* Main Container replacing the old hero and features */}
      <div className="mx-4 md:mx-8 my-4 md:my-8 bg-white rounded-[40px] shadow-[0_8px_40px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col relative z-10">
        
        {/* Navbar */}
        <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-12 py-6 gap-4">
           <Link to="/" className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex items-center justify-center border border-[#e2e8f0] p-1.5 shrink-0 overflow-hidden">
                 <img src="/jntugv-logo.png" alt="JNTUGV" className="w-full h-full object-contain " />
              </div>
              <h1 className="text-[22px] sm:text-[28px] font-black text-slate-800 tracking-tight text-center sm:text-left">
                JNTUGV <span className="text-[#9073fd] block sm:inline">Central Library</span>
              </h1>
           </Link>
           <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 w-full md:w-auto">
              <a 
                href="/JNTUGV_Library_App.apk" 
                download="JNTUGV_Library_App.apk"
                className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-[14px] transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                title="Download Android App APK"
              >
                <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" /> <span>Get App</span>
              </a>
              <Link to="/login" className="px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors border border-slate-200 rounded-[14px] hover:bg-slate-50 flex items-center gap-1.5 whitespace-nowrap">
                <User className="w-4 h-4 shrink-0" /> Sign In
              </Link>
              <Link to="/register" className="px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold bg-gradient-to-r from-[#9073fd] to-[#b360fb] text-white rounded-[14px] shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all flex items-center gap-1.5 whitespace-nowrap">
                <UserPlus className="w-4 h-4 shrink-0" /> Register
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
                <div className="w-full max-w-5xl mt-6 relative z-10 md:absolute md:bottom-[-140px] md:left-1/2 md:-translate-x-1/2 md:w-[90%]">
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full">
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
          
          {/* Spacing for desktop card offset */}
          <div className="hidden md:block w-full h-32"></div>

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

      {/* About College Section */}
      <div className="max-w-7xl mx-auto px-6 pb-20 relative z-10 w-full flex-1">
         <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.04)] flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
               <h2 className="text-[32px] md:text-[44px] font-black text-[#1e293b] tracking-tight leading-tight flex items-center gap-3 md:gap-4">
                 <GraduationCap className="w-8 h-8 md:w-10 md:h-10 text-[#9073fd]" />
                 About JNTU-GV
               </h2>
               <h3 className="text-[20px] md:text-[24px] font-bold text-[#9073fd] tracking-tight leading-tight -mt-4">Empowering Generations of Innovators</h3>
               <p className="text-[15px] text-[#64748b] font-medium leading-relaxed mt-2">
                 Established in January 2022 and named after the renowned Telugu poet and social reformer Gurajada Apparao, <strong className="text-slate-700">Jawaharlal Nehru Technological University Gurajada Vizianagaram (JNTU-GV)</strong> is a premier state technological university located in the North Coastal Andhra region. Our main campus at Dwarapudi is dedicated to promoting excellence in higher technical education, research, and innovation across critical disciplines including Computer Science, IT, ECE, EEE, Civil, Mechanical, and Metallurgical Engineering.
               </p>
               <p className="text-[15px] text-[#64748b] font-medium leading-relaxed">
                 We bridge the gap between academic education and industry requirements by fostering an environment of practical, hands-on learning. Through modern laboratories, extensive library resources, hackathons, and strong industry interactions, we aim to produce knowledgeable, skilled, and socially responsible professionals. At JNTU-GV, we actively promote extracurricular growth, leadership, and entrepreneurship to shape the leaders of tomorrow.
               </p>
            </div>
            <div className="w-full lg:w-[45%] shrink-0 relative group">
               <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-[32px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
               <img src="/jntugv-enhanced.png" onError={(e) => { e.target.src = '/library-building.jpg'; }} alt="JNTU-GV Campus" className="relative w-full h-[300px] md:h-[400px] object-cover rounded-[32px] shadow-2xl border-4 border-white group-hover:scale-[1.02] transition-transform duration-500" />
            </div>
         </div>
      </div>

      {/* Mentor & Project Guide Section */}
      <div className="max-w-7xl mx-auto px-6 pb-20 relative z-10 w-full flex-1">
         <div className="relative rounded-[40px] bg-gradient-to-br from-white via-slate-50/90 to-cyan-50/40 border border-slate-200/80 shadow-[0_12px_45px_rgba(15,23,42,0.05)] overflow-hidden p-8 md:p-14">
            
            {/* Background Grid Pattern (matching reference design) */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,#000_60%,transparent_100%)] opacity-70 pointer-events-none"></div>
            
            {/* Ambient Pastel Glows */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-300/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
               
               {/* Left Column: Circular Mentor Portrait with Orbit Ring */}
               <div className="relative shrink-0 flex items-center justify-center">
                  {/* Subtle Orbit Ring Accent */}
                  <div className="absolute w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] rounded-full border border-cyan-400/35 pointer-events-none animate-spin-slow"></div>
                  <div className="absolute -top-1.5 right-6 w-3.5 h-3.5 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/60"></div>
                  
                  {/* Circular Avatar Frame */}
                  <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full overflow-hidden border-[6px] border-white shadow-2xl relative z-10 bg-slate-100 ring-4 ring-cyan-200/50 group">
                     <img 
                       src="/mentor-jayasuma-square.jpg" 
                       onError={(e) => { e.target.src = '/mentor-jayasuma.jpg'; }}
                       alt="Dr. G. Jayasuma - Project Guide & Visionary" 
                       className="w-full h-full object-cover object-[center_20%] group-hover:scale-105 transition-transform duration-500" 
                     />
                  </div>
               </div>

               {/* Right Column: Name, Designation, Vision Quote & Actions */}
               <div className="flex-1 space-y-5 text-center lg:text-left">
                  <div>
                     <h3 className="text-[32px] sm:text-[42px] font-black text-[#1e293b] tracking-tight leading-tight">
                        Dr. G. Jayasuma
                     </h3>
                     <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 mt-1.5">
                        <span className="text-[12px] sm:text-[13px] font-black text-[#0284c7] uppercase tracking-[0.2em]">
                           Project Guide &amp; Visionary
                        </span>
                        <span className="hidden sm:inline text-slate-300">•</span>
                        <span className="text-[12px] sm:text-[13px] font-semibold text-slate-500">
                           Registrar &amp; Professor of CSE/IT, JNTU-GV
                        </span>
                     </div>
                  </div>

                  {/* Vision Quote with Cyan Mark and Border */}
                  <div className="relative flex items-start gap-3 sm:gap-4 text-left">
                     <svg className="w-9 h-9 sm:w-11 sm:h-11 text-cyan-400/80 shrink-0 mt-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                     </svg>
                     <div className="border-l-2 border-cyan-400/70 pl-4 sm:pl-5 py-0.5 space-y-2">
                        <p className="text-[15px] sm:text-[16px] text-slate-600 font-medium leading-relaxed italic">
                           &ldquo;The idea for the <strong className="text-slate-800 font-bold not-italic">Smart Digital Library and Barcode Management System</strong> was born out of a profound commitment to modernize academic resource access and eliminate administrative friction. We envisioned an intelligent, zero-friction learning ecosystem where students and faculty can instantly discover, locate with spatial precision, and borrow books without the overhead of manual tracking and misplaced volumes. By empowering our library with real-time barcode automation, spatial tracking, and seamless self-service, we enable our students to focus purely on innovation, deep research, and academic mastery.&rdquo;
                        </p>
                     </div>
                  </div>

                  {/* LinkedIn Connect Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                     <a 
                       href="https://www.linkedin.com/in/dr-g-jayasuma-b40b9533/" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-0.5 transition-all cursor-pointer"
                     >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                           <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                        </svg>
                        <span>Connect on LinkedIn</span>
                     </a>
                  </div>

               </div>

            </div>

            {/* Mascot in bottom-right corner (faithful to reference screenshot) */}
            <div className="hidden md:flex absolute bottom-5 right-7 items-center gap-2 pointer-events-none select-none">
               <div className="px-3 py-1 bg-cyan-500 text-white text-[11px] font-black rounded-full shadow-md shadow-cyan-500/30 flex items-center gap-1">
                  <span>Hello!</span> 👋
               </div>
               <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 p-1.5 shadow-lg shadow-cyan-500/30 flex items-center justify-center text-white text-lg">
                  🤖
               </div>
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

            {/* Links & Developers */}
            <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center md:items-start">
               <div className="text-center md:text-right">
                  <h4 className="text-indigo-400 font-bold uppercase tracking-widest text-sm mb-5">Developed By</h4>
                  <div className="flex flex-col gap-4">
                     <div className="flex items-center gap-3 justify-center md:justify-end">
                        <div className="text-right">
                           <p className="text-slate-200 font-bold text-[15px]">Y. Ghana Sathya Karthik</p>
                           <p className="text-slate-500 text-xs font-medium">Developer</p>
                        </div>
                        <div className="w-11 h-11 rounded-full bg-slate-800 border-2 border-indigo-400/30 overflow-hidden shrink-0">
                           <img src="/karthik.jpg" alt="Y. Ghana Sathya Karthik" onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=Karthik&background=random'; }} className="w-full h-full object-cover" />
                        </div>
                     </div>
                     <div className="flex items-center gap-3 justify-center md:justify-end">
                        <div className="text-right">
                           <p className="text-slate-200 font-bold text-[15px]">V. Charu Brunda Hasini</p>
                           <p className="text-slate-500 text-xs font-medium">Developer</p>
                        </div>
                        <div className="w-11 h-11 rounded-full bg-slate-800 border-2 border-pink-400/30 overflow-hidden shrink-0">
                           <img src="/hasini.jpg" alt="V. Charu Brunda Hasini" onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=Hasini&background=random'; }} className="w-full h-full object-cover" />
                        </div>
                     </div>
                  </div>
               </div>

                <div className="text-center md:text-right">
                   <h4 className="text-indigo-400 font-bold uppercase tracking-widest text-sm mb-4">Quick Links</h4>
                   <a href="/JNTUGV_Library_App.apk" download="JNTUGV_Library_App.apk" className="block text-emerald-400 hover:text-emerald-300 font-bold mb-3 transition-colors">📱 Download Android App (.apk)</a>
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
