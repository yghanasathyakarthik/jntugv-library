import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, RefreshCw } from 'lucide-react';

export default function BarcodeScanner({ onScan, onClose }) {
  const scannerRef = useRef(null);
  const isRunningRef = useRef(false);
  const [currentFacingMode, setCurrentFacingMode] = useState('environment');

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const initialFacing = isMobile ? 'environment' : 'user';
    setCurrentFacingMode(initialFacing);

    const html5QrCode = new Html5Qrcode('barcode-reader-modal');
    scannerRef.current = html5QrCode;

    html5QrCode.start(
      { facingMode: initialFacing },
      { fps: 15, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
      (decodedText) => {
        if (scannerRef.current && isRunningRef.current) {
          scannerRef.current.stop().then(() => {
            scannerRef.current.clear();
          }).catch(console.error);
          isRunningRef.current = false;
        }
        onScan(decodedText);
      },
      () => {}
    ).then(() => {
      isRunningRef.current = true;
    }).catch(err => {
      console.warn("Falling back camera in modal", err);
      html5QrCode.start(
        { facingMode: initialFacing === 'environment' ? 'user' : 'environment' },
        { fps: 15, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        (decodedText) => {
          if (scannerRef.current && isRunningRef.current) {
            scannerRef.current.stop().then(() => {
              scannerRef.current.clear();
            }).catch(console.error);
            isRunningRef.current = false;
          }
          onScan(decodedText);
        },
        () => {}
      ).then(() => {
        isRunningRef.current = true;
      }).catch(console.error);
    });

    return () => {
      if (scannerRef.current && isRunningRef.current) {
        scannerRef.current.stop().then(() => {
          scannerRef.current.clear();
        }).catch(console.error);
        isRunningRef.current = false;
      }
    };
  }, [onScan]);

  const toggleCamera = async () => {
    if (!scannerRef.current || !isRunningRef.current) return;
    try {
      await scannerRef.current.stop();
      isRunningRef.current = false;
      const nextFacing = currentFacingMode === 'environment' ? 'user' : 'environment';
      setCurrentFacingMode(nextFacing);
      await scannerRef.current.start(
        { facingMode: nextFacing },
        { fps: 15, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        (decodedText) => {
          if (scannerRef.current && isRunningRef.current) {
            scannerRef.current.stop().then(() => {
              scannerRef.current.clear();
            }).catch(console.error);
            isRunningRef.current = false;
          }
          onScan(decodedText);
        },
        () => {}
      );
      isRunningRef.current = true;
    } catch (e) {
      console.error('Error toggling camera in modal', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        <div className="bg-indigo-600 p-4 flex items-center justify-between">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Camera className="w-5 h-5" /> Scan Barcode / QR
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 bg-slate-50 text-slate-900 flex flex-col items-center gap-3">
          <p className="text-xs text-center text-slate-500">Position the barcode or QR code inside the frame.</p>
          <div className="w-full rounded-2xl overflow-hidden bg-black border-2 border-slate-200">
            <div id="barcode-reader-modal" className="w-full"></div>
          </div>
          <button
            type="button"
            onClick={toggleCamera}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-white text-indigo-600 border border-indigo-200 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Switch Camera ({currentFacingMode === 'environment' ? 'Back' : 'Front'})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
