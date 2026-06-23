import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, X } from 'lucide-react';

export default function BarcodeScanner({ onScan, onClose }) {
  const [error, setError] = useState('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScan(decodedText);
      },
      (err) => {
        // Ignore normal scan failures, only log actual errors if needed
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        <div className="bg-primary p-4 flex items-center justify-between">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Camera className="w-5 h-5" /> Scan Barcode
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 bg-slate-50 text-slate-900">
          <p className="text-sm text-center text-slate-500 mb-4">Position the barcode inside the camera frame.</p>
          <div id="reader" className="w-full rounded-md overflow-hidden bg-black"></div>
        </div>
      </div>
    </div>
  );
}
