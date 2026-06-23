import { useState } from 'react';
import axios from 'axios';
import { BookPlus, CheckCircle, QrCode as QrCodeIcon, Barcode } from 'lucide-react';

export default function AddBook() {
  const [formData, setFormData] = useState({
    id: '', title: '', isbn: '', year: '', author_id: 1, category_id: 1,
    room: '', section: '', rack: '', shelf: '', position: ''
  });
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessData(null);

    try {
      // In a real app, author_id and category_id would be selected from a dropdown. 
      // Using hardcoded 1 for simplicity based on DB seed data.
      const res = await axios.post('/api/books', {
        ...formData,
        author_id: 1, 
        category_id: 1
      });
      setSuccessData(res.data);
      setFormData({
        id: '', title: '', isbn: '', year: '', author_id: 1, category_id: 1,
        room: '', section: '', rack: '', shelf: '', position: ''
      });
    } catch (err) {
      console.error(err);
      setError('Failed to add book. Please ensure the Book ID is unique and check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BookPlus className="w-8 h-8 text-primary" />
          Add New Book
        </h1>
        <p className="text-textMuted mt-2">Enter book details and its exact physical location to generate assets.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="glass-panel p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Book Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm text-textMuted mb-1">Book ID (e.g. BK1005)</label>
                  <input required name="id" value={formData.id} onChange={handleChange} className="input-premium" placeholder="BK1005" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-textMuted mb-1">Title</label>
                  <input required name="title" value={formData.title} onChange={handleChange} className="input-premium" placeholder="Book Title" />
                </div>
                <div>
                  <label className="block text-sm text-textMuted mb-1">ISBN</label>
                  <input required name="isbn" value={formData.isbn} onChange={handleChange} className="input-premium" placeholder="ISBN-13" />
                </div>
                <div>
                  <label className="block text-sm text-textMuted mb-1">Year</label>
                  <input required name="year" type="number" value={formData.year} onChange={handleChange} className="input-premium" placeholder="2023" />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Physical Location</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm text-textMuted mb-1">Room</label>
                  <input required name="room" value={formData.room} onChange={handleChange} className="input-premium" placeholder="Computer Science Room 02" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-textMuted mb-1">Section</label>
                  <input required name="section" value={formData.section} onChange={handleChange} className="input-premium" placeholder="Software Engineering" />
                </div>
                <div>
                  <label className="block text-sm text-textMuted mb-1">Rack</label>
                  <input required name="rack" value={formData.rack} onChange={handleChange} className="input-premium" placeholder="05" />
                </div>
                <div>
                  <label className="block text-sm text-textMuted mb-1">Shelf</label>
                  <input required name="shelf" value={formData.shelf} onChange={handleChange} className="input-premium" placeholder="03" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-textMuted mb-1">Position / Spot</label>
                  <input required name="position" value={formData.position} onChange={handleChange} className="input-premium" placeholder="12" />
                </div>
              </div>
            </div>

            {error && <div className="p-4 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/20">{error}</div>}

            <button type="submit" disabled={loading} className="w-full btn-primary flex justify-center items-center gap-2">
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : 'Save Book & Generate Assets'}
            </button>
          </form>
        </div>

        {/* Success / Asset Display Section */}
        <div className="space-y-6">
          {successData ? (
            <div className="glass-panel p-8 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="p-4 bg-emerald-500/20 rounded-full">
                <CheckCircle className="w-12 h-12 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Book Added!</h3>
                <p className="text-textMuted mt-1">Assets have been generated automatically.</p>
              </div>

              <div className="w-full space-y-6 mt-8">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center justify-center gap-2 text-primary font-semibold mb-4">
                    <Barcode className="w-5 h-5" />
                    Generated Barcode
                  </div>
                  <img src={successData.barcode} alt="Barcode" className="mx-auto rounded bg-white p-2" />
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center justify-center gap-2 text-primary font-semibold mb-4">
                    <QrCodeIcon className="w-5 h-5" />
                    Generated QR Code
                  </div>
                  <img src={successData.qr} alt="QR Code" className="mx-auto rounded bg-white p-2 w-48 h-48" />
                </div>
              </div>
              
              <button onClick={() => setSuccessData(null)} className="text-primary hover:text-white transition-colors">
                Add another book
              </button>
            </div>
          ) : (
             <div className="glass-panel p-8 h-full flex flex-col items-center justify-center text-center border-dashed border-2 border-white/10 bg-transparent">
               <QrCodeIcon className="w-16 h-16 text-textMuted mb-4 opacity-50" />
               <h3 className="text-xl font-semibold text-white/50">Asset Generation</h3>
               <p className="text-textMuted mt-2 text-sm max-w-[250px]">
                 Submit the form to automatically generate the tracking Barcode and Location QR Code.
               </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
