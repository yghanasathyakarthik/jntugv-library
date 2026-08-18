import React, { useState } from 'react';
import { X, ClipboardCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import Scanner from './Scanner';
import axios from 'axios';

const AuditModal = ({ isOpen, onClose, user }) => {
  const [assetId, setAssetId] = useState('');
  const [condition, setCondition] = useState('Good');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleScanSuccess = (decodedText) => {
    setAssetId(decodedText);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assetId.trim()) {
      setError('Please enter or scan an Asset Barcode.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await axios.post('http://localhost:5000/api/books/audit', {
        asset_id: assetId.trim(),
        condition_status: condition,
        librarian_id: user?.id
      });
      setMessage(response.data.message || 'Audit recorded successfully.');
      setAssetId('');
      setCondition('Good');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to record audit.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-600" />
            Physical Audit
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 rounded-[16px] overflow-hidden border border-slate-200">
            <Scanner onScanSuccess={handleScanSuccess} onScanFailure={() => {}} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Asset Barcode / Accession No</label>
              <input
                type="text"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                placeholder="Scan or enter barcode"
                className="w-full bg-slate-50 border border-slate-200 rounded-[14px] px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-[14px] px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
              >
                <option value="Good">Good</option>
                <option value="Damaged">Damaged</option>
                <option value="Lost">Lost</option>
                <option value="Needs Repair">Needs Repair</option>
              </select>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-[12px] text-sm font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            
            {message && (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-[12px] text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold text-sm px-6 py-3.5 rounded-[14px] hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? 'Recording...' : 'Record Audit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuditModal;
