import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { RefreshCw, Camera } from 'lucide-react';

const Scanner = ({ onScanSuccess, onScanFailure }) => {
  const scannerRef = useRef(null);
  const isRunningRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentFacingMode, setCurrentFacingMode] = useState('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  useEffect(() => {
    // Detect mobile device vs laptop/desktop
    const mobileDetected = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent || navigator.vendor || window.opera
    );
    setIsMobile(mobileDetected);

    // Default: 'environment' (back camera) on mobile, 'user' (front camera / webcam) on laptop
    const initialFacingMode = mobileDetected ? 'environment' : 'user';
    setCurrentFacingMode(initialFacingMode);

    const html5QrCode = new Html5Qrcode('qr-reader-container');
    scannerRef.current = html5QrCode;

    const startCamera = async (facing) => {
      try {
        const devices = await Html5Qrcode.getCameras().catch(() => []);
        if (devices && devices.length > 1) {
          setHasMultipleCameras(true);
        }

        await html5QrCode.start(
          { facingMode: facing },
          {
            fps: 15,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText, decodedResult) => {
            if (onScanSuccess) onScanSuccess(decodedText, decodedResult);
          },
          (error) => {
            if (onScanFailure) onScanFailure(error);
          }
        );
        isRunningRef.current = true;
      } catch (err) {
        console.warn(`Could not start camera with facingMode=${facing}, falling back...`, err);
        try {
          // Fallback to opposite facingMode or any default camera
          const fallbackFacing = facing === 'environment' ? 'user' : 'environment';
          await html5QrCode.start(
            { facingMode: fallbackFacing },
            {
              fps: 15,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
            },
            (decodedText, decodedResult) => {
              if (onScanSuccess) onScanSuccess(decodedText, decodedResult);
            },
            (error) => {
              if (onScanFailure) onScanFailure(error);
            }
          );
          setCurrentFacingMode(fallbackFacing);
          isRunningRef.current = true;
        } catch (finalErr) {
          console.error("Camera failed to start entirely:", finalErr);
        }
      }
    };

    startCamera(initialFacingMode);

    return () => {
      if (scannerRef.current && isRunningRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current.clear();
          })
          .catch((err) => {
            console.error('Failed to stop camera scanner.', err);
          });
        isRunningRef.current = false;
      }
    };
  }, [onScanSuccess, onScanFailure]);

  const toggleCamera = async () => {
    if (!scannerRef.current || !isRunningRef.current) return;
    try {
      await scannerRef.current.stop();
      isRunningRef.current = false;

      const nextMode = currentFacingMode === 'environment' ? 'user' : 'environment';
      setCurrentFacingMode(nextMode);

      await scannerRef.current.start(
        { facingMode: nextMode },
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText, decodedResult) => {
          if (onScanSuccess) onScanSuccess(decodedText, decodedResult);
        },
        (error) => {
          if (onScanFailure) onScanFailure(error);
        }
      );
      isRunningRef.current = true;
    } catch (err) {
      console.error('Error toggling camera:', err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border-4 border-indigo-100 shadow-md bg-slate-900">
        <div id="qr-reader-container" className="w-full"></div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleCamera}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-200 rounded-xl transition-all shadow-sm active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Switch Camera ({currentFacingMode === 'environment' ? 'Back' : 'Front'})</span>
        </button>
      </div>
    </div>
  );
};

export default Scanner;
