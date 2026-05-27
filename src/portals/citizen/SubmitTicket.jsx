import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Camera, MapPin, Send, AlertTriangle, ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import CategoryIcon from '../../shared/components/CategoryIcon';
import GeoCamera from '../../shared/components/GeoCamera';

export default function SubmitTicket() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  // Step state: 0 = Location Choice, 1 = Category & Form
  const [step, setStep] = useState(0);
  const [locationMode, setLocationMode] = useState('home'); // 'home' or 'gps'

  // Form states
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState('');
  const [isGeotagged, setIsGeotagged] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationCapturing, setLocationCapturing] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(false);

  // GeoCamera modal state
  const [showCamera, setShowCamera] = useState(false);

  // Address values from localStorage
  const [livingAddress, setLivingAddress] = useState('');
  const [livingDistrict, setLivingDistrict] = useState('');
  const [livingWard, setLivingWard] = useState('');

  useEffect(() => {
    const lAddr = localStorage.getItem('jn_living_address') || "";
    const lDist = localStorage.getItem('jn_living_district') || "Chennai";
    const lWard = (localStorage.getItem('jn_living_ward') || "Ward 142").replace(/Ward\s+/i, '');
    
    setLivingAddress(lAddr);
    setLivingDistrict(lDist);
    setLivingWard(lWard);
  }, []);

  const categoryKeys = ['roads', 'water', 'electricity', 'health', 'education', 'agriculture', 'revenue', 'welfare'];

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result); // Base64 encoding
        setIsGeotagged(false); // Gallery upload is not verified
        toast.success(tLabel('Photo attached successfully!', 'புகைப்படம் வெற்றிகரமாக இணைக்கப்பட்டது!'));
      };
      reader.readAsDataURL(file);
    }
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLocationCapturing(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude.toFixed(5), lng: longitude.toFixed(5) });
        setLocationCaptured(true);
        setLocationCapturing(false);
        toast.success(tLabel('GPS coordinates locked!', 'ஜிபிஎஸ் இருப்பிடம் சரிபார்க்கப்பட்டது!'));
      },
      (error) => {
        setLocationCapturing(false);
        toast.error('Failed to capture coordinates: ' + error.message);
      }
    );
  };

  const handleSelectHomeMode = () => {
    if (!livingAddress) {
      toast.error(tLabel("Please configure your living address first.", "தயவுசெய்து உங்கள் வசிப்பிட முகவரியை முதலில் அமைக்கவும்."));
      return;
    }
    setLocationMode('home');
    setLocation({ lat: localStorage.getItem('jn_living_lat') || '13.0827', lng: localStorage.getItem('jn_living_lng') || '80.2707' });
    setLocationCaptured(true);
    setStep(1);
  };

  const handleSelectGpsMode = () => {
    setLocationMode('gps');
    setStep(1);
    captureLocation();
  };

  // GeoCamera callback
  const handleCameraCapture = (photoData) => {
    setPhoto(photoData.imageUrl);
    setIsGeotagged(true);
    setLocation({ lat: photoData.lat, lng: photoData.lng });
    setLocationCaptured(true);
    setShowCamera(false);
    toast.success(tLabel("Geo-tagged photo stamped successfully!", "புவி-குறிக்கப்பட்ட புகைப்படம் வெற்றிகரமாக இணைக்கப்பட்டது!"));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!category) {
      toast.error(tLabel('Please select a category', 'தயவுசெய்து ஒரு வகையைத் தேர்ந்தெடுக்கவும்'));
      return;
    }

    if (!description.trim() || description.length < 10) {
      toast.error(tLabel('Please provide a detailed description (min 10 chars)', 'தயவுசெய்து விரிவான விளக்கத்தை வழங்கவும் (குறைந்தது 10 எழுத்துக்கள்)'));
      return;
    }

    // Determine target ward and district for routing
    const targetWard = locationMode === 'home' ? livingWard : (localStorage.getItem('jn_ward') || '142');
    const targetDistrict = locationMode === 'home' ? livingDistrict : (localStorage.getItem('jn_district') || 'Chennai');

    const ticketId = Math.floor(1000 + Math.random() * 9000).toString();
    const newTicket = {
      id: ticketId,
      category,
      description,
      status: 'open',
      priority: 'medium',
      created_at: new Date().toISOString(),
      sla_deadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4-hour SLA
      ward: targetWard,
      district: targetDistrict,
      citizen_name: localStorage.getItem('jn_name') || 'KARTHIK RAJ S.',
      photo,
      location,
      is_geotagged: isGeotagged,
      location_mode: locationMode
    };

    // Save to localStorage
    const list = JSON.parse(localStorage.getItem('jn_tickets') || '[]');
    list.push(newTicket);
    localStorage.setItem('jn_tickets', JSON.stringify(list));

    toast.success(tLabel(
      `Complaint sent to Ward Officer! Ticket ID: #JN-${ticketId}`,
      `புகார் வார்டு அதிகாரிக்கு அனுப்பப்பட்டது! புகார் எண்: #JN-${ticketId}`
    ));
    
    navigate('/citizen/tickets');
  };

  return (
    <div className="pb-24">
      {/* ── GeoCamera Overlay modal ── */}
      {showCamera && (
        <div className="fixed inset-0 z-[200] max-w-md mx-auto bg-black">
          <GeoCamera 
            onCapture={handleCameraCapture} 
            onClose={() => setShowCamera(false)} 
            userName={localStorage.getItem('jn_name') || 'KARTHIK RAJ S.'}
            userWard={locationMode === 'home' ? `Ward ${livingWard}` : `Ward ${localStorage.getItem('jn_ward') || '142'}`}
          />
        </div>
      )}

      {/* Title Header */}
      <div className="bg-white px-4 py-2.5 border-b border-slate-200/60 shadow-sm shrink-0 flex items-center gap-2.5 select-none h-14">
        <button 
          type="button"
          onClick={() => {
            if (step === 1) {
              setStep(0);
            } else {
              navigate('/citizen');
            }
          }}
          className="w-11 h-11 flex items-center justify-start text-[#8B1A1A] cursor-pointer"
          style={{ minWidth: '44px', minHeight: '44px' }}
          title={tLabel("Back", "பின்னால்")}
        >
          <ArrowLeft className="w-6 h-6 text-[#8B1A1A]" />
        </button>

        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#8B1A1A]/5 rounded-lg text-[#8B1A1A]">
            <AlertTriangle className="w-4.5 h-4.5" />
          </div>
          <h2 className="text-base font-extrabold text-[#8B1A1A]">
            {tLabel("File New Grievance", "புதிய புகார் பதிவிடு")}
          </h2>
        </div>
      </div>

      <div className="p-4 select-none">
        <AnimatePresence mode="wait">
          
          {/* STEP 0: Location Choice Screen */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-2xl p-4 border border-slate-200/50 shadow-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
                  {tLabel("Step 0 — Select Grievance Location Mode", "படி 0 — புகார் இருப்பிட முறை")}
                </h3>
                <p className="text-xs text-slate-500 font-bold leading-normal mb-4">
                  {tLabel(
                    "Select where the grievance is located to route it to the correct local municipal officer.",
                    "புகாரை தகுந்த வார்டு அதிகாரிக்கு அனுப்ப அதன் இருப்பிட முறையைத் தேர்வு செய்யவும்."
                  )}
                </p>

                <div className="space-y-3">
                  {/* Card 1: Home Ward */}
                  <div
                    onClick={livingAddress ? handleSelectHomeMode : undefined}
                    className={`rounded-2xl p-4 border text-left transition-all ${
                      livingAddress
                        ? 'bg-white border-slate-200 hover:border-[#8B1A1A] cursor-pointer shadow-sm active:scale-[0.99]'
                        : 'bg-slate-50/70 border-slate-200 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl ${livingAddress ? 'bg-red-50 text-[#8B1A1A]' : 'bg-slate-100 text-slate-400'}`}>
                        <Shield className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-sm text-slate-800">
                          {tLabel("My Home Ward Residence", "என் வசிப்பிட வார்டு")}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-bold leading-normal">
                          {tLabel(
                            "Report issues occurring at your home address ward. Highly recommended for domestic water, garbage, and local street grievances.",
                            "உங்கள் வசிப்பிட வார்டில் உள்ள பிரச்சனைகளைத் தெரிவிக்கவும். குடிநீர் மற்றும் தெரு குப்பை பிரச்சனைகளுக்கு இதுவே சிறந்த வழி."
                          )}
                        </p>
                        
                        {livingAddress ? (
                          <div className="bg-[#FFF0F0] text-[#8B1A1A] rounded-lg p-2 mt-2 border border-[#FFD8D8] text-[10px] font-black w-fit">
                            🏠 {livingDistrict} District · Ward {livingWard}
                          </div>
                        ) : (
                          <div className="text-[10px] text-amber-600 font-extrabold flex items-center gap-1 mt-2.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{tLabel("Living Address not set! ", "வசிப்பிட முகவரி அமைக்கப்படவில்லை! ")}</span>
                            <Link to="/citizen/profile/location" className="text-[#8B1A1A] underline font-black">{tLabel("Set Now →", "அமைக்குக →")}</Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Current GPS Location */}
                  <div
                    onClick={handleSelectGpsMode}
                    className="bg-white border border-slate-200 hover:border-[#8B1A1A] cursor-pointer shadow-sm active:scale-[0.99] rounded-2xl p-4 text-left transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-teal-50 text-[#14B8A6]">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-sm text-slate-800">
                          {tLabel("Current GPS Coordinates (Transit Mode)", "தற்போதைய ஜிபிஎஸ் இருப்பிடம்")}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-bold leading-normal">
                          {tLabel(
                            "Uses live GPS to stamp the grievance. Ideal for transit potholes, street light failures, or issues encountered while traveling.",
                            "நேரடி ஜிபிஎஸ் கொண்டு புகாரை பதிவு செய்ய பயன்படுகிறது. சாலை பழுதுகள் மற்றும் தெருவிளக்கு பழுதுகளுக்குப் பொருந்தும்."
                          )}
                        </p>
                        <div className="bg-teal-50 text-teal-800 rounded-lg p-2 mt-2 border border-teal-100 text-[10px] font-black w-fit flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#14B8A6]" />
                          <span>{tLabel("Live location verified via satellite", "செயற்கைக்கோள் மூலம் நேரடி இருப்பிடம்")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 1: Main Grievance Form */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="space-y-4"
            >
              {/* Form Overlay Routing Tag */}
              <div 
                className="w-full rounded-xl py-2.5 px-4 text-xs font-black flex items-center justify-between border select-none"
                style={{
                  backgroundColor: locationMode === 'home' ? '#FFF0F0' : '#E6F4F1',
                  borderColor: locationMode === 'home' ? '#FFD8D8' : '#B2DFDB',
                  color: locationMode === 'home' ? '#8B1A1A' : '#00695C'
                }}
              >
                <div className="flex items-center gap-1.5">
                  {locationMode === 'home' ? (
                    <>
                      <span>🏠</span>
                      <span>{tLabel(`Home Ward: Ward ${livingWard}, ${livingDistrict}`, `வசிப்பிடம்: வார்டு ${livingWard}, ${livingDistrict}`)}</span>
                    </>
                  ) : (
                    <>
                      <span>📍</span>
                      <span>{tLabel(`Live GPS: Ward ${localStorage.getItem('jn_ward') || '142'}, ${localStorage.getItem('jn_district') || 'Chennai'}`, `ஜிபிஎஸ்: வார்டு ${localStorage.getItem('jn_ward') || '142'}, ${localStorage.getItem('jn_district') || 'Chennai'}`)}</span>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="underline font-black cursor-pointer text-[10px] tracking-wider uppercase opacity-80 hover:opacity-100"
                >
                  {tLabel("Change", "மாற்று")}
                </button>
              </div>

              {/* Main Form */}
              <form onSubmit={handleSubmit} className="bg-white rounded-[16px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-slate-200/50 space-y-6">
                
                {/* 1. Category */}
                <div className="space-y-2">
                  <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                    1. {tLabel("Select Category", "வகைத் தேர்வு")}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {categoryKeys.map((key) => {
                      const isSelected = category === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setCategory(key)}
                          className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#8B1A1A]/5 border-2 border-[#8B1A1A] text-[#8B1A1A] font-extrabold shadow-sm'
                              : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <CategoryIcon category={key} />
                          <span className="text-[10px] font-extrabold tracking-wide uppercase">
                            {tLabel(key, key)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Description */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                      2. {tLabel("Grievance Description", "புகார் விளக்கம்")}
                    </label>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      {description.length}/500
                    </span>
                  </div>
                  <textarea
                    maxLength={500}
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={tLabel("Describe the issue clearly (potholes depth, water days missed, electric sparks, etc.)", "பிரச்சனையின் தன்மை, அளவு போன்றவற்றை தெளிவாக எழுதவும்...")}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#8B1A1A] outline-none px-4 py-3 rounded-xl text-slate-700 text-xs shadow-sm transition-colors resize-none placeholder-slate-400 font-bold leading-relaxed"
                  />
                </div>

                {/* 3. Geotag verification (Show GPS status) */}
                <div className="space-y-2">
                  <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                    3. {tLabel("Geotag Verification", "இருப்பிட சரிபார்ப்பு")}
                  </label>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 text-emerald-800 rounded-xl px-3 py-2 border border-emerald-100 text-[11px] font-black flex items-center gap-1.5 select-none">
                      <CheckCircle className="w-3.5 h-3.5 text-[#4CAF50] fill-[#4CAF50]/10" />
                      <span>{tLabel("GPS Geotag Verified ✓", "ஜிபிஎஸ் சரிபார்க்கப்பட்டது ✓")}</span>
                    </div>
                    {location && (
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {location.lat}°N, {location.lng}°E
                      </span>
                    )}
                  </div>
                </div>

                {/* 4. Photo Proof Camera Stamping Options */}
                <div className="space-y-2">
                  <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                    4. {tLabel("Attach Photo Evidence", "சான்று புகைப்படம்")}
                  </label>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Option 1: GeoCamera Stamped Capture */}
                    <button
                      type="button"
                      onClick={() => setShowCamera(true)}
                      className="bg-white border border-[#8B1A1A]/30 hover:bg-[#8B1A1A]/5 rounded-xl py-3 px-3 flex items-center justify-center gap-1.5 text-[#8B1A1A] font-extrabold text-xs cursor-pointer transition-all shadow-sm"
                    >
                      <Camera className="w-4 h-4 text-[#8B1A1A]" />
                      <span>{tLabel("📷 Capture Geo Photo", "📷 படம் எடுக்க")}</span>
                    </button>

                    {/* Option 2: Gallery upload */}
                    <label className="flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-sm rounded-xl py-3 px-3 text-slate-600 font-extrabold text-xs cursor-pointer transition-colors">
                      <Camera className="w-4 h-4 text-slate-500" />
                      <span>{tLabel("📁 Upload Gallery", "📁 கோப்பை இணைக்க")}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  {photo && (
                    <div className="relative w-full aspect-video rounded-xl border border-slate-200 overflow-hidden shadow-md mt-2 group select-none">
                      <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                      
                      {/* verified badge overlay if geotagged */}
                      {isGeotagged && (
                        <div className="absolute top-3 left-3 bg-[#4CAF50] text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                          <MapPin className="w-2.5 h-2.5 text-white" />
                          <span>{tLabel("📍 LOCATION VERIFIED", "📍 இருப்பிடம் சரிபார்க்கப்பட்டது")}</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setPhoto('');
                          setIsGeotagged(false);
                        }}
                        className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white text-xs font-black uppercase transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        Delete Preview
                      </button>
                    </div>
                  )}
                </div>

                {/* 5. Prepopulated Ward Jurisdiction */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                    5. {tLabel("Assigned Ward Jurisdiction", "ஒதுக்கப்பட்ட வார்டு அதிகாரம்")}
                  </label>
                  <input
                    type="text"
                    value={
                      locationMode === 'home' 
                        ? tLabel(`Ward ${livingWard}, ${livingDistrict} (Home Residence)`, `வார்டு ${livingWard}, ${livingDistrict} (வசிப்பிடம்)`)
                        : tLabel(`Ward ${localStorage.getItem('jn_ward') || '142'}, ${localStorage.getItem('jn_district') || 'Chennai'} (GPS Transit)`, `வார்டு ${localStorage.getItem('jn_ward') || '142'}, ${localStorage.getItem('jn_district') || 'Chennai'} (ஜிபிஎஸ் வழி)`)
                    }
                    disabled
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 font-extrabold text-xs cursor-not-allowed select-none opacity-80"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  style={{ height: '52px', backgroundColor: '#8B1A1A' }}
                  className="w-full text-white font-extrabold text-sm rounded-xl shadow-[0_4px_12px_rgba(139,26,26,0.15)] hover:opacity-95 transition-all duration-300 flex items-center justify-center gap-2 select-none cursor-pointer"
                >
                  <span>{tLabel("Submit Verified Grievance", "குறையைச் சமர்ப்பிக்கவும்")}</span>
                  <Send className="w-4 h-4 text-white/90" />
                </button>

              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
