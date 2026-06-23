import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const Scanner = ({ onScanSuccess, onScanFailure }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    // Only initialize if not already initialized
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        'reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        /* verbose= */ false
      );
      
      scannerRef.current.render(
        (decodedText, decodedResult) => {
           if (onScanSuccess) onScanSuccess(decodedText, decodedResult);
        },
        (error) => {
           if (onScanFailure) onScanFailure(error);
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error('Failed to clear scanner.', error);
        });
        scannerRef.current = null;
      }
    };
  }, [onScanSuccess, onScanFailure]);

  return (
    <div id="reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-xl border-4 border-slate-200 shadow-sm bg-white"></div>
  );
};

export default Scanner;
