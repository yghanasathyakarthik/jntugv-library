import React from 'react';
import { MapPin, X, Navigation } from 'lucide-react';

export default function SpatialMap({ locationData, onClose }) {
  // Extract coordinates from "Position 12" etc.
  // For visual demo, we'll map locations roughly to CSS grid areas.
  
  const getPositionCoords = (posStr) => {
    // "Position XX" -> number
    const pos = parseInt(posStr?.replace(/\D/g, '') || '1');
    // Map to a grid of 10x10 loosely
    const row = Math.floor(pos / 5) + 1;
    const col = (pos % 5) + 1;
    return { row, col };
  };

  const coords = getPositionCoords(locationData?.position_grid_index);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-indigo-900/20">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <Navigation className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">Spatial Navigator</h3>
              <p className="text-sm font-medium text-slate-500">Locating your book inside {locationData?.room_number}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 bg-slate-50 p-8 relative overflow-hidden flex items-center justify-center min-h-[400px]">
          
          {/* Legend */}
          <div className="absolute top-4 left-4 bg-white/80 backdrop-blur p-4 rounded-2xl shadow-lg border border-slate-100 flex flex-col gap-2 z-10">
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-indigo-600 rounded-full animate-pulse shadow-lg shadow-indigo-500/50"></div><span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Target Book</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-slate-300 rounded border border-slate-400"></div><span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Bookshelves</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-emerald-100 rounded-full"></div><span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Reading Area</span></div>
          </div>

          {/* Isometric-style Floor Plan Wrapper */}
          <div className="w-full max-w-[800px] aspect-[4/3] bg-white border-4 border-slate-200 rounded-3xl shadow-inner relative transform perspective-[1000px] rotate-x-[20deg] rotate-y-[-10deg] scale-95 transition-transform duration-1000 ease-out hover:rotate-x-[15deg] hover:rotate-y-[-5deg] hover:scale-100">
            
            {/* Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:40px_40px] opacity-50"></div>

            {/* Entrance */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-emerald-400 rounded-t-lg border-2 border-emerald-500 flex items-center justify-center">
               <span className="text-[10px] font-black text-white uppercase tracking-widest">Entrance</span>
            </div>

            {/* Render Bookshelves Grid (Mocking a library layout) */}
            <div className="absolute inset-x-8 top-8 bottom-16 grid grid-cols-5 grid-rows-5 gap-8">
              {Array.from({ length: 25 }).map((_, i) => {
                const r = Math.floor(i / 5) + 1;
                const c = (i % 5) + 1;
                const isTarget = r === coords.row && c === coords.col;
                const isDesk = (r === 3 && c === 3) || (r===3 && c===4); // Mock some desks

                if (isDesk) {
                  return (
                    <div key={i} className="bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center shadow-sm">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full border border-emerald-200"></div>
                    </div>
                  );
                }

                return (
                  <div key={i} className={`relative rounded-lg flex items-center justify-center transition-all duration-500 shadow-md ${
                    isTarget 
                      ? 'bg-indigo-600 border-2 border-indigo-400 shadow-xl shadow-indigo-600/40 z-20 scale-110' 
                      : 'bg-slate-200 border-2 border-slate-300 border-b-8 hover:bg-slate-300'
                  }`}>
                    {isTarget && (
                       <>
                         {/* Pulsing beacon */}
                         <div className="absolute -top-12 animate-bounce">
                           <div className="relative">
                              <MapPin className="w-10 h-10 text-rose-500 drop-shadow-xl fill-rose-500" />
                              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full"></div>
                           </div>
                         </div>
                         <div className="absolute w-24 h-24 bg-indigo-500/20 rounded-full animate-ping pointer-events-none"></div>
                       </>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Footer Details */}
        <div className="bg-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex flex-wrap gap-4">
             <div className="bg-slate-700/50 px-4 py-2 rounded-xl border border-slate-600">
               <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Room</span>
               <span className="text-white font-mono font-bold text-lg">{locationData?.room_number || 'Main Hall'}</span>
             </div>
             <div className="bg-slate-700/50 px-4 py-2 rounded-xl border border-slate-600">
               <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Section</span>
               <span className="text-white font-mono font-bold text-lg">{locationData?.section_name || 'General'}</span>
             </div>
             <div className="bg-slate-700/50 px-4 py-2 rounded-xl border border-slate-600">
               <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Rack / Shelf</span>
               <span className="text-white font-mono font-bold text-lg text-emerald-400">{locationData?.rack_number} - {locationData?.shelf_number}</span>
             </div>
           </div>
           
           <button onClick={onClose} className="w-full md:w-auto bg-indigo-500 hover:bg-indigo-600 text-white font-black px-8 py-4 rounded-xl transition-colors">
             Got it!
           </button>
        </div>

      </div>
    </div>
  );
}
