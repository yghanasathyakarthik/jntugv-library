import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Armchair, CheckCircle2, Map } from 'lucide-react';

export default function StudySpaces() {
  const { user } = useAuth();
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchSeats();
  }, []);

  const fetchSeats = async () => {
    try {
      const res = await axios.get('/api/spaces');
      setSeats(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = async (seat) => {
    if (seat.status === 'occupied' && seat.occupied_by_name !== user.name) {
      alert(`This seat is already occupied by ${seat.occupied_by_name || 'someone'}.`);
      return;
    }
    
    try {
      if (seat.status === 'occupied' && seat.occupied_by_name === user.name) {
        // Leave seat
        await axios.post('/api/spaces/leave', { seat_id: seat.seat_id, barcode_id: user.barcode_id });
      } else {
        // Occupy seat
        await axios.post('/api/spaces/occupy', { seat_id: seat.seat_id, barcode_id: user.barcode_id });
      }
      fetchSeats();
    } catch (err) {
      alert(err.response?.data?.error || 'Error interacting with seat');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Spaces...</div>;

  if (errorMsg) return (
    <div className="p-8 text-center">
      <div className="text-red-500 font-bold mb-2">Error Loading Spaces</div>
      <div className="text-slate-600 bg-red-50 p-4 rounded border border-red-200 font-mono text-xs">{errorMsg}</div>
    </div>
  );

  // Group by zone
  const zones = seats.reduce((acc, seat) => {
    acc[seat.zone] = acc[seat.zone] || [];
    acc[seat.zone].push(seat);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 h-full overflow-y-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
          <Map className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800">Live Study Spaces</h2>
          <p className="text-sm font-medium text-slate-500">Tap a green seat to claim it</p>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(zones).map(([zoneName, zoneSeats]) => (
          <div key={zoneName} className="bg-slate-50 p-4 rounded-2xl">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">{zoneName}</h3>
            <div className="flex flex-wrap gap-4">
              {zoneSeats.map(seat => {
                const isMine = seat.occupied_by_name === user.name;
                const isAvailable = seat.status === 'available';
                
                return (
                  <button 
                    key={seat.seat_id}
                    onClick={() => handleSeatClick(seat)}
                    className={`relative w-20 h-24 rounded-xl flex flex-col items-center justify-center gap-2 transition-all shadow-sm
                      ${isAvailable ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : ''}
                      ${isMine ? 'bg-indigo-600 text-white shadow-indigo-200' : ''}
                      ${!isAvailable && !isMine ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60' : ''}
                    `}
                  >
                    <Armchair className={`w-8 h-8 ${isMine ? 'text-white' : ''}`} />
                    <span className="text-xs font-black">{seat.seat_id.split('-')[1]}</span>
                    {isMine && <CheckCircle2 className="w-4 h-4 absolute top-2 right-2 text-white" />}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
