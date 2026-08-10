import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Map, Clock, CheckCircle2, User, BookOpen } from 'lucide-react';

export default function StudySpaces() {
  const { user } = useAuth();
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    fetchSeats();
    const interval = setInterval(fetchSeats, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchSeats = async () => {
    try {
      const res = await axios.get('/api/study-seats');
      setSeats(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load study spaces.");
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (seat) => {
    if (seat.reservation_id) {
      alert("This seat is currently reserved.");
      return;
    }

    try {
      await axios.post('/api/study-seats/reserve', { seat_id: seat.seat_id, user_id: user.id });
      setToastMsg(`Successfully reserved ${seat.seat_label}! Valid for 1 hour.`);
      setTimeout(() => setToastMsg(""), 4000);
      fetchSeats();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reserve seat');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Digital Library...</div>;

  const leftSeats = seats.filter(s => s.side === 'Left');
  const rightSeats = seats.filter(s => s.side === 'Right');

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 h-full overflow-y-auto relative">
      {/* Toast */}
      {toastMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg font-bold z-50 animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {toastMsg}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">Digital Library</h2>
            <p className="text-sm font-medium text-slate-500">1 Hour Max • Reserve up to 10 mins before arrival</p>
          </div>
        </div>
        <div className="flex gap-4 text-xs font-bold text-slate-500">
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-100 rounded-sm"></div> Available</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-rose-100 rounded-sm"></div> Occupied</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-indigo-500 rounded-sm"></div> Your Seat</div>
        </div>
      </div>

      <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-200 min-h-[400px] flex items-center justify-center">
        <div className="flex gap-20">
          
          {/* Left Side */}
          <div className="grid grid-cols-2 gap-4">
            {leftSeats.map(seat => (
              <SeatNode key={seat.seat_id} seat={seat} user={user} onReserve={handleReserve} />
            ))}
          </div>

          {/* Aisle */}
          <div className="w-16 flex flex-col items-center justify-center">
             <div className="h-full border-l-2 border-dashed border-slate-300 w-px"></div>
             <div className="bg-white px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest my-4 rounded-full border border-slate-200">Aisle</div>
             <div className="h-full border-l-2 border-dashed border-slate-300 w-px"></div>
          </div>

          {/* Right Side */}
          <div className="grid grid-cols-2 gap-4">
            {rightSeats.map(seat => (
              <SeatNode key={seat.seat_id} seat={seat} user={user} onReserve={handleReserve} />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

function SeatNode({ seat, user, onReserve }) {
  const isReserved = !!seat.reservation_id;
  const isMine = seat.user_id === user.id;

  let bgClass = "bg-emerald-100 border-emerald-200 text-emerald-700 hover:bg-emerald-200 cursor-pointer";
  if (isMine) bgClass = "bg-indigo-500 border-indigo-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)]";
  else if (isReserved) bgClass = "bg-rose-100 border-rose-200 text-rose-400 cursor-not-allowed opacity-75";

  return (
    <div 
      onClick={() => onReserve(seat)}
      className={`relative w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all group ${bgClass}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isMine ? 'bg-indigo-400/30' : (isReserved ? 'bg-rose-200/50' : 'bg-emerald-200/50')}`}>
        {isMine ? <User className="w-4 h-4 text-white" /> : <Clock className="w-4 h-4" />}
      </div>
      <span className="text-xs font-black">{seat.seat_label}</span>
      
      {!isReserved && (
        <div className="absolute inset-0 bg-emerald-500 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white font-bold text-xs">Reserve</span>
        </div>
      )}
    </div>
  );
}
