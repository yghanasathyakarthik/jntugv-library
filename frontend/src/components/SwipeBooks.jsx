import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, BookOpen, Flame } from 'lucide-react';

export default function SwipeBooks() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchDiscoverBooks();
  }, []);

  const fetchDiscoverBooks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/books/discover/${user.id}`);
      setBooks(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction, bookId) => {
    // direction: 'left' (pass) or 'right' (like)
    const action = direction === 'right' ? 'like' : 'pass';
    
    // Remove the swiped book from the UI immediately
    setBooks(prev => prev.filter(b => b.book_id !== bookId));

    try {
      await axios.post('/api/books/swipe', {
        userId: user.id,
        bookId: bookId,
        action: action
      });
      // If we liked it, maybe show a toast
    } catch (err) {
      console.error(err);
    }

    if (books.length <= 2) {
      // Fetch more books when running low
      fetchDiscoverBooks();
    }
  };

  if (loading && books.length === 0) return <div className="p-8 text-center text-slate-500 font-medium">Finding new books for you...</div>;

  if (errorMsg) return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="text-red-500 font-bold mb-2">Error Loading Books</div>
      <div className="text-slate-600 bg-red-50 p-4 rounded border border-red-200 font-mono text-xs max-w-full overflow-x-auto">{errorMsg}</div>
    </div>
  );

  if (books.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-500">
      <BookOpen className="w-16 h-16 mb-4 text-slate-300" />
      <p className="font-bold">You've seen all our books!</p>
      <p className="text-sm">Check back later for new arrivals.</p>
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white rounded-[24px] p-6 shadow-sm border border-slate-100 h-full flex flex-col items-center justify-center relative overflow-hidden">
      
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Flame className="w-6 h-6 text-rose-500" />
        <h2 className="text-xl font-black text-slate-800">Discover</h2>
      </div>

      <div className="relative w-[300px] h-[400px] mt-10">
        <AnimatePresence>
          {books.map((book, index) => {
            const isTop = index === 0;
            return (
              <motion.div
                key={book.book_id}
                className="absolute top-0 left-0 w-full h-full bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col overflow-hidden origin-bottom"
                style={{
                  zIndex: books.length - index,
                  scale: isTop ? 1 : 1 - index * 0.05,
                  y: isTop ? 0 : index * 10
                }}
                drag={isTop ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipeThreshold = 100;
                  if (offset.x > swipeThreshold) {
                    handleSwipe('right', book.book_id);
                  } else if (offset.x < -swipeThreshold) {
                    handleSwipe('left', book.book_id);
                  }
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: isTop ? 1 : 1 - index * 0.05, opacity: 1, y: isTop ? 0 : index * 10 }}
                exit={{ x: -500, opacity: 0 }} // default exit, overridden by swipe buttons
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {/* Book Cover Placeholder */}
                <div className="h-2/3 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-6 relative">
                  <div className="absolute top-4 right-4 bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-800">
                    {book.category}
                  </div>
                  <div className="w-32 h-48 bg-white shadow-md rounded-lg flex items-center justify-center text-center p-4">
                    <span className="font-black text-xl text-slate-800 leading-tight">{book.title}</span>
                  </div>
                </div>
                
                {/* Book Info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 line-clamp-2">{book.title}</h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">{book.author}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Swipe Actions */}
      <div className="flex gap-6 mt-8 z-10">
        <button 
          onClick={() => handleSwipe('left', books[0]?.book_id)}
          className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center text-rose-500 shadow-sm hover:scale-110 hover:bg-rose-50 transition-all"
        >
          <X className="w-8 h-8" />
        </button>
        <button 
          onClick={() => handleSwipe('right', books[0]?.book_id)}
          className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center text-emerald-500 shadow-sm hover:scale-110 hover:bg-emerald-50 transition-all"
        >
          <Heart className="w-8 h-8 fill-current" />
        </button>
      </div>
      <p className="text-xs text-slate-400 mt-4 font-medium">Swipe right to save to wishlist</p>
    </div>
  );
}
