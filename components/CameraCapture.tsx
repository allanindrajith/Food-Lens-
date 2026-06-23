import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, Upload, Zap, ZapOff } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError('Camera access denied or unavailable. Please upload a photo.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const captureImage = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      // Get base64 without prefix for Gemini
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const base64 = dataUrl.split(',')[1];
      stopCamera();
      onCapture(base64);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        onCapture(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center max-w-md mx-auto">
      {/* Header Controls */}
      <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10 text-white">
        <button onClick={onClose} className="p-2 rounded-full bg-black/40 backdrop-blur">
          <X className="w-6 h-6" />
        </button>
        <button 
            onClick={() => setFlash(!flash)} 
            className="p-2 rounded-full bg-black/40 backdrop-blur"
        >
          {flash ? <Zap className="w-6 h-6 text-yellow-400" /> : <ZapOff className="w-6 h-6" />}
        </button>
      </div>

      {/* Camera View / Error Fallback */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-white text-center p-6">
            <p className="mb-4">{error}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-emerald-500 text-white px-6 py-3 rounded-full font-medium"
            >
              Upload Photo
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Scanning Overlay */}
        {!error && (
            <div className="absolute inset-0 pointer-events-none border-2 border-white/20">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-emerald-400/80 rounded-2xl animate-pulse">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-500 -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-500 -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-500 -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-500 -mb-1 -mr-1"></div>
                </div>
                <div className="absolute bottom-32 w-full text-center text-white/90 font-medium text-sm">
                    Hold steady to scan food
                </div>
            </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 w-full p-8 pb-12 flex justify-center items-center gap-12 bg-gradient-to-t from-black/80 to-transparent">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-3 rounded-full bg-white/20 backdrop-blur text-white hover:bg-white/30 transition"
        >
          <Upload className="w-6 h-6" />
        </button>
        
        <button
          onClick={captureImage}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-transparent relative hover:scale-105 transition-transform"
        >
            <div className="w-16 h-16 rounded-full bg-white"></div>
        </button>

        <div className="w-12"></div> {/* Spacer for balance */}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
};

export default CameraCapture;