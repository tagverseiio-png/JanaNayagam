import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Lock, Unlock, MapPin, AlertTriangle, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const districtsList = [
  { name: "Chennai", tamil: "சென்னை" },
  { name: "Coimbatore", tamil: "கோயம்புத்தூர்" },
  { name: "Madurai", tamil: "மதுரை" },
  { name: "Salem", tamil: "சேலம்" },
  { name: "Trichy", tamil: "திருச்சி" },
  { name: "Vellore", tamil: "வேலூர்" },
  { name: "Tirunelveli", tamil: "திருநெல்வேலி" },
  { name: "Erode", tamil: "ஈரோடு" },
  { name: "Thanjavur", tamil: "தஞ்சாவூர்" },
  { name: "Dindigul", tamil: "திண்டுக்கல்" },
  { name: "Kancheepuram", tamil: "காஞ்சிபுரம்" },
  { name: "Tiruppur", tamil: "திருப்பூர்" },
  { name: "Thoothukudi", tamil: "தூத்துக்குடி" },
  { name: "Nagercoil", tamil: "நாகர்கோவில்" },
  { name: "Cuddalore", tamil: "கடலூர்" },
  { name: "Villupuram", tamil: "விழுப்புரம்" },
  { name: "Nagapattinam", tamil: "நாகப்பட்டினம்" },
  { name: "Dharmapuri", tamil: "தர்மபுரி" },
  { name: "Krishnagiri", tamil: "கிருஷ்ணகிரி" },
  { name: "Namakkal", tamil: "நாமக்கல்" },
  { name: "Karur", tamil: "கரூர்" },
  { name: "Pudukkottai", tamil: "புதுக்கோட்டை" },
  { name: "Sivaganga", tamil: "சிவகங்கை" },
  { name: "Virudhunagar", tamil: "விருதுநகர்" },
  { name: "Ramanathapuram", tamil: "ராமநாதபுரம்" },
  { name: "Theni", tamil: "தேனி" },
  { name: "Nilgiris", tamil: "நீலகிரி" },
  { name: "Perambalur", tamil: "பெரம்பலூர்" },
  { name: "Ariyalur", tamil: "அரியலூர்" },
  { name: "Tiruvarur", tamil: "திருவாரூர்" },
  { name: "Tiruvannamalai", tamil: "திருவண்ணாமலை" },
  { name: "Kallakurichi", tamil: "கள்ளக்குறிச்சி" },
  { name: "Ranipet", tamil: "ராணிப்பேட்டை" },
  { name: "Tenkasi", tamil: "தென்காசி" },
  { name: "Chengalpattu", tamil: "செங்கல்பட்டு" },
  { name: "Mayiladuthurai", tamil: "மயிலாடுதுறை" },
  { name: "Tirupattur", tamil: "திருப்பூர்" },
  { name: "Harur", tamil: "ஹாரூர்" }
];

export default function LocationSettings() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  // Aadhaar registered values
  const [aadhaarAddress, setAadhaarAddress] = useState('');
  const [aadhaarDistrict, setAadhaarDistrict] = useState('');
  const [aadhaarWard, setAadhaarWard] = useState('');

  // Current living address values
  const [livingAddress, setLivingAddress] = useState('');
  const [livingDistrict, setLivingDistrict] = useState('Chennai');
  const [livingWard, setLivingWard] = useState('');
  const [livingLat, setLivingLat] = useState('13.0827');
  const [livingLng, setLivingLng] = useState('80.2707');
  const [lastUpdated, setLastUpdated] = useState('');
  const [nextUpdate, setNextUpdate] = useState('');
  const [pincode, setPincode] = useState('');

  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [cooldownDaysLeft, setCooldownDaysLeft] = useState(0);
  const [inCooldown, setInCooldown] = useState(false);

  // Load from localStorage
  const loadData = () => {
    // Aadhaar Address
    const aAddr = localStorage.getItem('jn_aadhaar_address') || "123, Gandhi Nagar, Madurai - 625001";
    const aDist = localStorage.getItem('jn_aadhaar_district') || "Madurai";
    const aWard = localStorage.getItem('jn_aadhaar_ward') || "Ward 45";
    setAadhaarAddress(aAddr);
    setAadhaarDistrict(aDist);
    setAadhaarWard(aWard);

    // Living Address
    const lAddr = localStorage.getItem('jn_living_address') || "";
    const lDist = localStorage.getItem('jn_living_district') || "Chennai";
    const lWardRaw = localStorage.getItem('jn_living_ward') || "";
    const lWard = lWardRaw.replace(/Ward\s+/i, ''); // Strip "Ward " text to get number
    const lLat = localStorage.getItem('jn_living_lat') || "13.0827";
    const lLng = localStorage.getItem('jn_living_lng') || "80.2707";
    const lLast = localStorage.getItem('jn_location_last_updated') || "";
    const lNext = localStorage.getItem('jn_location_next_update') || "";

    setLivingAddress(lAddr);
    setLivingDistrict(lDist);
    setLivingWard(lWard);
    setLivingLat(lLat);
    setLivingLng(lLng);
    setLastUpdated(lLast);
    setNextUpdate(lNext);

    // Extract pincode if exists
    if (lAddr) {
      const pinMatch = lAddr.match(/\b\d{6}\b/);
      if (pinMatch) setPincode(pinMatch[0]);
    } else {
      setPincode('');
    }

    // Cooldown verification
    if (lNext) {
      const nextDate = new Date(lNext);
      const today = new Date();
      const diffTime = nextDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        setCooldownDaysLeft(diffDays);
        setInCooldown(true);
      } else {
        setInCooldown(false);
      }
    } else {
      setInCooldown(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      toast.error(tLabel("Geolocation is not supported by your browser.", "உங்கள் உலாவியால் புவிஇருப்பிடத்தைக் கண்டறிய முடியவில்லை."));
      return;
    }

    setGpsDetecting(true);
    toast.info(tLabel("Acquiring GPS coordinates...", "ஜிபிஎஸ் ஒருங்கிணைப்புகளைப் பெறுகிறது..."));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLivingLat(lat.toString());
        setLivingLng(lng.toString());

        try {
          // OpenStreetMap Reverse Geocoding
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
            headers: {
              'User-Agent': 'JanaNayagam-Grievance-App'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const displayName = data.display_name || "";
            const postcode = data.address?.postcode || "";
            
            // Clean up name by cutting off excess info
            let formattedAddr = displayName;
            if (displayName.split(',').length > 5) {
              formattedAddr = displayName.split(',').slice(0, 4).join(',').trim();
            }

            setLivingAddress(formattedAddr);
            if (postcode) setPincode(postcode);

            // Attempt to resolve district from response
            const city = data.address?.city || data.address?.town || data.address?.county || "";
            const foundDistrict = districtsList.find(d => 
              city.toLowerCase().includes(d.name.toLowerCase()) || 
              displayName.toLowerCase().includes(d.name.toLowerCase())
            );
            if (foundDistrict) {
              setLivingDistrict(foundDistrict.name);
            }

            toast.success(tLabel("GPS coordinates and address loaded successfully!", "ஜிபிஎஸ் ஒருங்கிணைப்புகள் மற்றும் முகவரி வெற்றிகரமாகப் பெறப்பட்டது!"));
          } else {
            // Fallback if API fails
            setLivingAddress(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
            toast.warning(tLabel("Coordinates acquired. Failed to geocode address, please enter manually.", "ஒருங்கிணைப்புகள் பெறப்பட்டன. முகவரியைக் கண்டறிய முடியவில்லை, தயவுசெய்து கைமுறையாக உள்ளிடவும்."));
          }
        } catch (error) {
          // Fallback on network/fetch error
          setLivingAddress(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
          toast.warning(tLabel("Coordinates acquired. Offline fallback applied.", "ஒருங்கிணைப்புகள் பெறப்பட்டன. ஆஃப்லைன் முகவரி பயன்படுத்தப்பட்டது."));
        } finally {
          setGpsDetecting(false);
        }
      },
      (error) => {
        console.error("GPS Error: ", error);
        toast.error(tLabel("Failed to retrieve GPS location. Please check device permissions.", "ஜிபிஎஸ் இருப்பிடத்தைப் பெற முடியவில்லை. அனுமதிகளைச் சரிபார்க்கவும்."));
        setGpsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSaveLivingLocation = (e) => {
    e.preventDefault();

    if (!livingAddress.trim()) {
      toast.error(tLabel("Please enter your current living address line.", "தயவுசெய்து உங்கள் தற்போதைய வசிப்பிட முகவரி வரியை உள்ளிடவும்."));
      return;
    }
    if (!livingWard.trim()) {
      toast.error(tLabel("Please enter your Ward Number.", "தயவுசெய்து உங்கள் வார்டு எண்ணை உள்ளிடவும்."));
      return;
    }
    if (!pincode.trim() || pincode.length !== 6) {
      toast.error(tLabel("Please enter a valid 6-digit Pincode.", "தயவுசெய்து செல்லுபடியாகும் 6-இலக்க அஞ்சல் குறியீட்டை (Pincode) உள்ளிடவும்."));
      return;
    }

    const completeAddress = `${livingAddress.trim()}, ${livingDistrict}, Tamil Nadu - ${pincode.trim()}`;
    const today = new Date();
    const nextDate = new Date();
    nextDate.setDate(today.getDate() + 90);

    localStorage.setItem('jn_living_address', completeAddress);
    localStorage.setItem('jn_living_district', livingDistrict);
    localStorage.setItem('jn_living_ward', `Ward ${livingWard.trim()}`);
    localStorage.setItem('jn_living_lat', livingLat);
    localStorage.setItem('jn_living_lng', livingLng);
    localStorage.setItem('jn_location_last_updated', today.toISOString());
    localStorage.setItem('jn_location_next_update', nextDate.toISOString());

    // Update active session variables too!
    localStorage.setItem('jn_ward', livingWard.trim());
    localStorage.setItem('jn_district', livingDistrict);

    toast.success(tLabel("Living Address saved! 90-day cooldown initiated.", "வசிப்பிட முகவரி சேமிக்கப்பட்டது! 90 நாட்கள் குளிரூட்டும் காலம் தொடங்கியது."));
    loadData();
  };

  // Mock cooldown expiry
  const handleMockExpire = () => {
    localStorage.removeItem('jn_location_last_updated');
    localStorage.removeItem('jn_location_next_update');
    toast.success(tLabel("Cooldown expired! Cooldown locks reset for demo review.", "குளிரூட்டும் காலம் காலாவதியானது! டெமோ மதிப்பாய்விற்காக பூட்டுகள் மீட்டமைக்கப்பட்டன."));
    loadData();
  };

  const role = localStorage.getItem('jn_role') || 'citizen';

  return (
    <div className="pb-24 select-none">
      {/* Page Title Header */}
      <div className="bg-white dark:bg-slate-900 sticky top-0 z-50 border-b border-[#DDE1E7] dark:border-slate-800 shrink-0">
        <div className="h-14 px-4 flex justify-between items-center w-full">
          <button
            onClick={() => navigate(`/${role.replace('_', '-')}/profile`)}
            className="w-11 h-11 flex items-center justify-start text-[#8B1A1A] cursor-pointer"
            style={{ minWidth: '44px', minHeight: '44px' }}
            title={tLabel("Back to Profile", "சுயவிவரத்திற்குத் திரும்பு")}
          >
            <ArrowLeft className="w-6 h-6 text-[#8B1A1A]" />
          </button>

          <h2 className="text-base font-black text-slate-800 dark:text-slate-100 tracking-wide">
            {tLabel("My Location Settings", "என் இருப்பிட அமைப்புகள்")}
          </h2>

          <div className="w-11 h-11"></div>
        </div>
      </div>

      <div className="px-4 pt-4">

      <div className="p-4 space-y-4">
        
        {/* ── Aadhaar Registered Section (Locked) ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#8B1A1A] dark:text-rose-400 fill-[#8B1A1A]/10" />
            </div>
            <div>
              <span className="font-extrabold text-xs text-slate-400 tracking-wider uppercase block">
                {tLabel("Step 1 — Aadhaar Address", "படி 1 — ஆதார் முகவரி")}
              </span>
              <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm">
                {tLabel("Official Government Records", "அரசு பதிவு செய்யப்பட்ட விவரம்")}
              </h3>
            </div>
            <div className="ml-auto bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-300 rounded-full py-1 px-2.5 flex items-center gap-1 select-none text-[10px] font-black border border-slate-200 dark:border-slate-750">
              <Lock className="w-3 h-3 text-slate-500" />
              <span>{tLabel("LOCKED", "பூட்டப்பட்டது")}</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl p-3 space-y-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">{tLabel("REGISTERED ADDRESS", "பதிவு செய்யப்பட்ட முகவரி")}</span>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">{aadhaarAddress}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-200/50 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">{tLabel("DISTRICT", "மாவட்டம்")}</span>
                <p className="text-xs font-black text-slate-800 dark:text-slate-100">{aadhaarDistrict}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">{tLabel("WARD", "வார்டு")}</span>
                <p className="text-xs font-black text-slate-800 dark:text-slate-100">{aadhaarWard}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold mt-3 select-none">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{tLabel("Name and address are locked to Official Govt Database.", "பெயர் மற்றும் ஆதார் முகவரி திருத்த முடியாதவாறு பாதுகாக்கப்பட்டுள்ளது.")}</span>
          </div>
        </div>

        {/* ── Current Living Section ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-rose-950/20 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-[#8B1A1A] dark:text-rose-400" />
            </div>
            <div>
              <span className="font-extrabold text-xs text-slate-400 tracking-wider uppercase block">
                {tLabel("Step 2 — Living Location", "படி 2 — வசிப்பிட முகவரி")}
              </span>
              <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm">
                {tLabel("Grievance Routing Address", "புகார் அனுப்பப்படும் முகவரி")}
              </h3>
            </div>
            
            {inCooldown ? (
              <div className="ml-auto bg-[#FFF0F0] dark:bg-rose-950/30 text-[#8B1A1A] dark:text-rose-400 rounded-full py-1 px-2.5 flex items-center gap-1 select-none text-[10px] font-black border border-[#FFD8D8] dark:border-rose-900/30">
                <Lock className="w-3 h-3 text-[#8B1A1A]" />
                <span>{tLabel("COOLDOWN", "குளிரூட்டல்")}</span>
              </div>
            ) : (
              <div className="ml-auto bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-full py-1 px-2.5 flex items-center gap-1 select-none text-[10px] font-black border border-emerald-100 dark:border-emerald-900/30">
                <Unlock className="w-3 h-3 text-emerald-600" />
                <span>{tLabel("EDITABLE", "மாற்றக்கூடியது")}</span>
              </div>
            )}
          </div>

          {/* Prominent prompt if address empty */}
          {!livingAddress && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl p-3.5 text-blue-800 dark:text-blue-300 space-y-1.5 select-none">
              <div className="flex items-center gap-1.5 font-extrabold text-xs">
                <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{tLabel("Living Address Required", "வசிப்பிட முகவரி தேவை")}</span>
              </div>
              <p className="text-[11px] font-bold leading-normal text-blue-700 dark:text-blue-400">
                {tLabel(
                  "You have not configured your living address. JanaNayagam routes grievances and ward allocations based on this location.",
                  "உங்கள் வசிப்பிட முகவரியை நீங்கள் இன்னும் அமைக்கவில்லை. ஜனநாயகம் இதன் அடிப்படையிலேயே புகார்களையும் வார்டு ஒதுக்கீட்டையும் செய்கிறது."
                )}
              </p>
            </div>
          )}

          {/* COOLDOWN ACTIVE VIEW */}
          {inCooldown ? (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl p-3 space-y-2.5">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">{tLabel("ACTIVE CURRENT ADDRESS", "செயலில் உள்ள தற்போதைய முகவரி")}</span>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">{livingAddress}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">{tLabel("DISTRICT", "மாவட்டம்")}</span>
                    <p className="text-xs font-black text-slate-800 dark:text-slate-100">{livingDistrict}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">{tLabel("WARD", "வார்டு")}</span>
                    <p className="text-xs font-black text-slate-800 dark:text-slate-100">{livingWard}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">{tLabel("COORDS", "ஜிபிஎஸ்")}</span>
                    <p className="text-[10px] font-bold text-emerald-600 truncate">{Number(livingLat).toFixed(4)}, {Number(livingLng).toFixed(4)}</p>
                  </div>
                </div>
              </div>

              {/* Cooldown banner */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-3 space-y-2 text-amber-800 dark:text-amber-300 select-none">
                <div className="flex items-center gap-1.5 font-extrabold text-xs text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{tLabel("90-Day Cooldown Protection Active", "90 நாட்கள் குளிரூட்டும் பாதுகாப்பு செயல்படுகிறது")}</span>
                </div>
                <p className="text-[11px] font-bold leading-normal text-amber-700 dark:text-amber-400">
                  {tLabel(
                    "To prevent spam and routing manipulations, residential location shifts are locked for 90 days once saved.",
                    "வார்டு மாற்ற முறைகேடுகளைத் தடுக்க, முகவரி மாற்றங்கள் 90 நாட்களுக்கு ஒருமுறை மட்டுமே அனுமதிக்கப்படும்."
                  )}
                </p>
                <div className="bg-amber-100/50 dark:bg-amber-900/20 rounded-lg p-2 flex items-center justify-between text-xs font-black text-amber-900 dark:text-amber-200 border border-amber-200/30">
                  <span>{tLabel("Days Remaining:", "மீதமுள்ள நாட்கள்:")}</span>
                  <span className="text-sm bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-md shadow-sm">{cooldownDaysLeft} {tLabel("Days", "நாட்கள்")}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-2">
                {/* Disabled update button */}
                <button
                  type="button"
                  disabled
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2 select-none"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{tLabel("Address locked under cooldown", "குளிரூட்டப்பட்டதால் முகவரி பூட்டப்பட்டுள்ளது")}</span>
                </button>

                {/* Tester mock expire bypass */}
                <button
                  type="button"
                  onClick={handleMockExpire}
                  className="w-full bg-[#8B1A1A]/5 hover:bg-[#8B1A1A]/10 text-[#8B1A1A] border border-[#8B1A1A]/20 font-extrabold text-[11px] py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{tLabel("🧪 Mock Expire Cooldown (For Demo/Testing)", "🧪 குளிரூட்டலை காலாவதியாக்கு (மதிப்பாய்விற்காக)")}</span>
                </button>
              </div>
            </div>
          ) : (
            /* COOLDOWN INACTIVE - EDITABLE FORM */
            <form onSubmit={handleSaveLivingLocation} className="space-y-4">
              
              {/* GPS detect button */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={gpsDetecting}
                  className="w-full bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-[#8B1A1A] dark:text-rose-400 border border-[#8B1A1A]/30 font-extrabold text-xs py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 select-none cursor-pointer"
                >
                  {gpsDetecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 text-[#8B1A1A] animate-spin" />
                      <span>{tLabel("Detecting GPS Location...", "ஜிபிஎஸ் கண்டறியப்படுகிறது...")}</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 text-[#8B1A1A] fill-[#8B1A1A]/10" />
                      <span>{tLabel("📍 Detect Location via GPS", "📍 ஜிபிஎஸ் மூலம் இருப்பிடத்தைக் கண்டுபிடி")}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Address Line field */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                  {tLabel("CURRENT LIVING ADDRESS LINE", "தற்போதைய வசிப்பிட முகவரி வரி")}
                </label>
                <textarea
                  rows={2}
                  required
                  value={livingAddress}
                  onChange={(e) => setLivingAddress(e.target.value)}
                  placeholder={tLabel("e.g. Flat 3B, Temple View Apartments, Velachery", "எ.கா. கதவு எண் 12, பிள்ளையார் கோவில் தெரு, வேளச்சேரி")}
                  className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 focus:border-[#8B1A1A] outline-none px-4 py-2 rounded-xl text-slate-700 dark:text-slate-350 font-bold text-xs shadow-sm transition-all resize-none leading-relaxed"
                />
              </div>

              {/* District & Ward Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                    {tLabel("DISTRICT", "மாவட்டம்")}
                  </label>
                  <select
                    value={livingDistrict}
                    onChange={(e) => setLivingDistrict(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 outline-none px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 font-extrabold text-xs shadow-sm cursor-pointer focus:border-[#8B1A1A] transition-all"
                  >
                    {districtsList.map(d => (
                      <option key={d.name} value={d.name}>
                        {isTa ? d.tamil : d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                    {tLabel("WARD NUMBER", "வார்டு எண்")}
                  </label>
                  <input
                    type="text"
                    required
                    value={livingWard}
                    onChange={(e) => setLivingWard(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 142"
                    className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 focus:border-[#8B1A1A] outline-none px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 font-extrabold text-xs shadow-sm transition-all"
                  />
                </div>
              </div>

              {/* Pincode & Coordinates Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                    {tLabel("PINCODE", "அஞ்சல் குறியீடு")}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 600042"
                    className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 focus:border-[#8B1A1A] outline-none px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-350 font-extrabold text-xs shadow-sm transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                    {tLabel("GPS COORDINATES", "ஜிபிஎஸ் ஒருங்கிணைப்பு")}
                  </label>
                  <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-[10px] text-slate-600 dark:text-slate-400 font-bold flex items-center justify-center h-[38px] truncate">
                    {Number(livingLat).toFixed(4)}, {Number(livingLng).toFixed(4)}
                  </div>
                </div>
              </div>

              <div className="bg-[#FFF0F0] dark:bg-rose-950/20 text-[#8B1A1A] dark:text-rose-450 border border-[#FFD8D8] dark:border-rose-900/30 rounded-xl p-3 flex gap-2 select-none">
                <AlertTriangle className="w-4 h-4 text-[#8B1A1A] dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="text-[10px] font-bold leading-normal">
                  <span className="font-extrabold block mb-0.5">{tLabel("IMPORTANT LOCK NOTICE", "முக்கியமான பூட்டு அறிவிப்பு")}</span>
                  {tLabel(
                    "Once saved, you cannot shift your Living Address for 90 days. Please verify all details and GPS precision.",
                    "சேமித்த பிறகு, தற்போதைய முகவரியை 90 நாட்களுக்கு மாற்ற முடியாது. அனைத்து விவரங்கள் மற்றும் ஜிபிஎஸ் துல்லியத்தை சரிபார்க்கவும்."
                  )}
                </div>
              </div>

              {/* Save button */}
              <button
                type="submit"
                style={{ backgroundColor: '#8B1A1A' }}
                className="w-full text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 select-none cursor-pointer"
              >
                <CheckCircle className="w-4 h-4 text-white" />
                <span>{tLabel("Save Living Location Settings", "இருப்பிட அமைப்புகளைச் சேமி")}</span>
              </button>

            </form>
          )}

        </div>

      </div>
      </div>
    </div>
  );
}
