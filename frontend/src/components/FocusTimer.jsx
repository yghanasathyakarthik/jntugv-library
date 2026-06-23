import React, { useState, useEffect } from 'react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function FocusTimer() {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleSessionComplete = async () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    try {
      await axios.post('/api/gamification/focus-session', { userId: user.id, minutes: 25 });
      alert("Session Complete! You earned 50 points!");
    } catch (err) {
      console.error(err);
    }
    setTimeLeft(25 * 60);
  };

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[24px] p-6 text-white shadow-lg relative overflow-hidden">
      <div className="absolute right-0 top-0 w-32 h-32 bg-white rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none opacity-20"></div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-lg font-black flex items-center gap-2"><Timer className="w-5 h-5" /> Focus Timer</h3>
        <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg">25 Min</span>
      </div>

      <div className="flex flex-col items-center justify-center py-6 relative z-10">
        <div className="text-6xl font-black tracking-tighter mb-6">{formatTime(timeLeft)}</div>
        
        <div className="flex gap-4">
          <button 
            onClick={toggleTimer}
            className="w-14 h-14 bg-white text-indigo-600 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform"
          >
            {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </button>
          <button 
            onClick={resetTimer}
            className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
