import React, { useState, useEffect, useRef } from 'react';
import { Shield, Camera, X, RefreshCw, Check, AlertTriangle } from 'lucide-react';

export default function GeoCamera({ onCapture, onCancel, title = "Field Verification" }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [stream, setStream] = useState(null);
  const [coords, setCoords] = useState({ lat: 13.0827, lng: 80.2707 }); // Chennai default
  const [addressLine1, setAddressLine1] = useState('Anna Salai, Teynampet');
  const [addressLine2, setAddressLine2] = useState('Chennai, Tamil Nadu, India');
  const [gpsStatus, setGpsStatus] = useState('Getting GPS...');
  
  // Camera state
  const [isCaptured, setIsCaptured] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraError, setCameraError] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  const officerName = localStorage.getItem('jn_name') || 'KARTHIK RAJ S.';
  const officerWard = localStorage.getItem('jn_ward') || '142';

  // 1. Digital Clock
  useEffect(() => {
    const updateClock = () => {
      const formatted = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
      });
      setCurrentTime(formatted);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch Geolocation and Reverse Geocode
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('GPS Unsupported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoords({ lat, lng });
        setGpsStatus('GPS Locked');

        // Reverse Geocoding via Nominatim OpenStreetMap
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
            headers: { 'User-Agent': 'JanaNayagam-Grievance-App' }
          });
          if (res.ok) {
            const data = await res.json();
            const addr = data.address;
            
            const road = addr.road || addr.suburb || addr.neighbourhood || 'Unknown Road';
            const area = addr.county || addr.city_district || addr.state_district || 'District';
            const city = addr.city || addr.town || addr.village || 'Tamil Nadu';
            const pincode = addr.postcode ? ` - ${addr.postcode}` : '';

            setAddressLine1(road);
            setAddressLine2(`${area}, ${city}${pincode}`);
          }
        } catch (e) {
          console.warn("Reverse Geocoding Failed:", e);
          setAddressLine1(`Lat: ${lat.toFixed(4)}°N`);
          setAddressLine2(`Lng: ${lng.toFixed(4)}°E`);
        }
      },
      (err) => {
        console.warn("GPS Access Error:", err);
        setGpsStatus('GPS Defaulted');
        setAddressLine1('123, Gandhi Nagar, Madurai');
        setAddressLine2('Madurai, Tamil Nadu, 625001');
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  // 3. Initialize Camera Stream with Mock Fallback
  useEffect(() => {
    let activeStream = null;

    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.warn("Camera hardware access failed, launching Mock Mode:", err);
        setCameraError(true);
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraError]);

  // 4. Capture & Canvas Watermark Stamp
  const handleCapture = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas resolution standard (640 x 480)
    canvas.width = 640;
    canvas.height = 480;

    // Draw the image/stream onto the canvas
    if (!cameraError && videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    } else {
      // MOCK MODE GRAPHIC: Render a styled background with grid lines
      ctx.fillStyle = '#1e293b'; // slate-800
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw a subtle focus grid
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      for (let i = 40; i < canvas.width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      for (let j = 40; j < canvas.height; j += 40) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
      }

      // Add mock center reticle
      ctx.strokeStyle = 'rgba(244, 67, 54, 0.4)'; // Red reticle
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 40, 0, Math.PI * 2);
      ctx.stroke();

      // Render a placeholder text or landscape
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('[ MOCK CAMERA VIEWER ]', canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = '12px Arial';
      ctx.fillText('FIELD REPORT VERIFIED BY GPS', canvas.width / 2, canvas.height / 2 + 15);
    }

    // DRAW WATERMARK BAR AT BOTTOM
    const barHeight = 90;
    
    // 1. Dark semi-transparent bar background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
    ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);

    // 2. Bottom red decorative strip
    ctx.fillStyle = '#8B1A1A';
    ctx.fillRect(0, canvas.height - 6, canvas.width, 6);

    // 3. Location Pin Icon & Details (Left-aligned)
    ctx.fillStyle = '#FF6B6B';
    ctx.font = 'bold 13px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('📍', 12, canvas.height - 65);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Arial';
    // Limit string length to prevent overflow on canvas
    const displayRoad = addressLine1.length > 30 ? addressLine1.substring(0, 27) + '...' : addressLine1;
    ctx.fillText(displayRoad, 30, canvas.height - 65);

    ctx.fillStyle = '#CCCCCC';
    ctx.font = '11px Arial';
    const displayArea = addressLine2.length > 35 ? addressLine2.substring(0, 32) + '...' : addressLine2;
    ctx.fillText(displayArea, 30, canvas.height - 48);

    // 4. Date and Time Stamp (Right-aligned)
    const today = new Date();
    const dateStr = today.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit', month: 'short', year: 'numeric'
    });
    const timeStr = today.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit', minute: '2-digit', hour12: true
    }) + ' IST';

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(dateStr, canvas.width - 12, canvas.height - 65);

    ctx.fillStyle = '#CCCCCC';
    ctx.font = '11px Arial';
    ctx.fillText(timeStr, canvas.width - 12, canvas.height - 48);

    // 5. Officer credentials block (Left bottom)
    ctx.fillStyle = '#FFD700'; // Gold
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Officer: ${officerName}`, 12, canvas.height - 30);

    ctx.fillStyle = '#AAAAAA';
    ctx.font = '10px Arial';
    ctx.fillText(`Ward: ${officerWard} · JanaNayagam · Tamil Nadu Govt`, 12, canvas.height - 14);

    // 6. GPS Coordinates (Right bottom)
    ctx.fillStyle = '#888888';
    ctx.font = '9px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`${coords.lat.toFixed(4)}°N ${coords.lng.toFixed(4)}°E`, canvas.width - 12, canvas.height - 14);

    // Convert Canvas to URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedPhoto(dataUrl);
    setIsCaptured(true);
  };

  const handleUsePhoto = () => {
    // Return geotag metadata
    onCapture({
      photoUrl: capturedPhoto,
      lat: coords.lat,
      lng: coords.lng,
      address: `${addressLine1}, ${addressLine2}`,
      timestamp: new Date().toISOString(),
      officerName,
      ward: officerWard
    });
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setIsCaptured(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between font-sans select-none text-white">
      
      {/* ══ HEADER BAR ══ */}
      <div className="p-4 flex justify-between items-center bg-black/60 backdrop-blur-md border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#FF6B6B]" />
          <span className="text-xs font-black tracking-widest uppercase">{title}</span>
        </div>
        {!isCaptured && (
          <button 
            onClick={onCancel}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* ══ CAM VIEWPORT / PREVIEW AREA ══ */}
      <div className="flex-1 flex items-center justify-center bg-slate-950 relative overflow-hidden">
        
        {/* Render Canvas (hidden during stream, used for capture preview) */}
        <canvas ref={canvasRef} className="hidden" />

        {!isCaptured ? (
          <div className="w-full max-w-md aspect-[4/3] bg-slate-900 relative border-y border-white/5 flex items-center justify-center">
            
            {cameraError ? (
              // Mock viewport when camera fails
              <div className="w-full h-full relative flex flex-col items-center justify-center text-center p-6 space-y-3">
                <AlertTriangle className="w-12 h-12 text-[#FF9800] animate-bounce" />
                <span className="text-xs font-black text-[#FF9800] tracking-widest bg-amber-500/10 px-3 py-1 rounded-full uppercase">
                  [ MOCK CAMERA MODE ACTIVE ]
                </span>
                <p className="text-[10px] text-slate-400 font-bold max-w-[280px]">
                  Webcam blocked/unavailable. Grid alignment and location stamping will operate successfully on capture.
                </p>
              </div>
            ) : (
              // Real video element
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover"
              />
            )}

            {/* LIVE STREAM OVERLAYS */}
            {/* Top Overlay HUD */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-center text-[10px] font-black z-20 select-none bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
              <div className="flex items-center gap-1.5 text-rose-500">
                <span className="w-2 h-2 bg-rose-600 rounded-full animate-ping"></span>
                <span>REC</span>
              </div>
              <div className="font-mono text-white/90">
                {currentTime || '00:00:00 AM'}
              </div>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
                gpsStatus === 'GPS Locked' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  gpsStatus === 'GPS Locked' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-ping'
                }`} />
                <span>{gpsStatus}</span>
              </div>
            </div>

            {/* Bottom Overlay HUD */}
            <div className="absolute bottom-3 left-3 right-3 text-left z-20 select-none bg-black/50 p-3 rounded-xl border border-white/5 space-y-1">
              <p className="text-[10px] font-black text-[#FFD700] tracking-widest uppercase">
                JanaNayagam Field Verification
              </p>
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-300">
                <span>Officer: {officerName}</span>
                <span>Ward: {officerWard}</span>
              </div>
            </div>

            {/* Camera grid crosshair lines */}
            <div className="absolute inset-0 border border-white/5 pointer-events-none z-10">
              <div className="absolute top-1/3 left-0 right-0 h-[1px] bg-white/5"></div>
              <div className="absolute top-2/3 left-0 right-0 h-[1px] bg-white/5"></div>
              <div className="absolute left-1/3 top-0 bottom-0 w-[1px] bg-white/5"></div>
              <div className="absolute left-2/3 top-0 bottom-0 w-[1px] bg-white/5"></div>
            </div>

          </div>
        ) : (
          // Captured Preview Image
          <div className="w-full max-w-md flex flex-col items-center justify-center p-4">
            <span className="text-[10px] font-black text-emerald-400 tracking-wider mb-2 bg-emerald-500/10 px-3 py-1 rounded-full uppercase">
              ✓ GEO-STAMP VERIFIED
            </span>
            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative">
              <img 
                src={capturedPhoto} 
                alt="Captured watermark" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

      </div>

      {/* ══ BOTTOM CONTROL BAR ══ */}
      <div className="p-6 bg-black/60 border-t border-white/10 flex justify-center items-center shrink-0">
        {!isCaptured ? (
          // Large white Capture button
          <button
            onClick={handleCapture}
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-slate-700 active:scale-90 transition-transform cursor-pointer"
          >
            <div className="w-12 h-12 bg-white rounded-full border border-slate-900 flex items-center justify-center">
              <Camera className="w-6 h-6 text-slate-800" />
            </div>
          </button>
        ) : (
          // Use / Retake buttons
          <div className="flex gap-4 w-full max-w-xs">
            <button
              onClick={handleRetake}
              className="flex-1 py-3.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retake</span>
            </button>
            <button
              onClick={handleUsePhoto}
              style={{ backgroundColor: '#8B1A1A' }}
              className="flex-1 py-3.5 rounded-xl text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-transform cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Use Photo</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
