import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, AlertTriangle, Shield, CheckCircle, Clock, 
  ChevronRight, Camera, Video, Navigation, Flame, 
  Users, Activity, User, Home, FileText, BarChart2,
  ThumbsUp, MessageSquare, RefreshCw, Zap, Bell,
  Search, EyeOff, ShieldAlert, Landmark, Sun, Moon
} from 'lucide-react';

const translations = {
  en: {
    welcome: "Welcome to JANANAYAGAM",
    subtitle: "Tamil Nadu Civic Command Center",
    login: "Login with Mobile",
    aadhaar: "Aadhaar Verification",
    submit: "Submit",
    home: "Live Map",
    file: "File Issue",
    track: "Track",
    feed: "Live Feed",
    profile: "Dashboard",
    support: "Support Problem",
    evidence: "Claim Evidence",
    similar: "Raise Similar",
    categories: ["Roads", "Water", "Electricity", "Sanitation", "Health", "Education", "Traffic"]
  },
  ta: {
    welcome: "ஜனநாயகம்-க்கு வருக",
    subtitle: "தமிழ்நாடு மக்கள் குறைதீர் மையம்",
    login: "மொபைல் எண் மூலம் நுழைக",
    aadhaar: "ஆதார் சரிபார்ப்பு",
    submit: "சமர்ப்பி",
    home: "வரைபடம்",
    file: "புகார் அளி",
    track: "நிலை",
    feed: "நேரலை",
    profile: "சுயவிவரம்",
    support: "ஆதரவு அளி",
    evidence: "ஆதாரம் சேர்",
    similar: "இதே புகார்",
    categories: ["சாலைகள்", "தண்ணீர்", "மின்சாரம்", "சுகாதாரம்", "மருத்துவம்", "கல்வி", "போக்குவரத்து"]
  }
};

const mockFeed = [
  {
    id: 1,
    user: "Arun Kumar",
    location: "Velachery, Chennai",
    category: "Roads",
    desc: "Huge pothole causing accidents near the main junction. Multiple two-wheelers have skidded here since morning.",
    time: "10 mins ago",
    status: "ESCALATED",
    supports: 342,
    image: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 2,
    user: "Priya D.",
    location: "RS Puram, Coimbatore",
    category: "Water",
    desc: "No drinking water supply for the last 3 days in Ward 12. Local borewells are also dried up.",
    time: "1 hour ago",
    status: "ASSIGNED",
    supports: 89,
    image: "https://images.unsplash.com/photo-1542358965-0b3294dc15f0?auto=format&fit=crop&q=80&w=400"
  }
];

const routingSteps = [
  { role: "Citizen (You)", time: "10:00 AM", status: "done", desc: "Issue Reported" },
  { role: "Ward Officer (VAO)", time: "10:15 AM", status: "done", desc: "Site inspected & verified" },
  { role: "Block Dev Officer (BDO)", time: "Pending", status: "current", desc: "Awaiting budget approval" },
  { role: "District Collector", time: "-", status: "wait", desc: "Escalation point" },
  { role: "CM Dashboard", time: "-", status: "wait", desc: "State-level monitoring" }
];

const injectStyles = () => {
  const style = document.createElement('style');
  style.innerHTML = `
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `;
  document.head.appendChild(style);
};

// Page Transition Animation Variants
const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  in: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
  out: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.3, ease: "easeIn" } }
};

// Motion-enabled components
const GlassCard = ({ children, className = "", onClick }) => (
  <motion.div 
    onClick={onClick}
    whileHover={onClick ? { scale: 1.02, y: -4, boxShadow: "0 15px 40px rgba(154,0,2,0.12)" } : {}}
    whileTap={onClick ? { scale: 0.98 } : {}}
    className={`bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgba(154,0,2,0.06)] rounded-3xl p-5 transition-colors duration-300 ${onClick ? 'cursor-pointer hover:bg-white/90' : ''} ${className}`}
  >
    {children}
  </motion.div>
);

const GlowButton = ({ children, onClick, variant = "primary", className = "", disabled = false }) => {
  const base = "w-full py-4 px-6 rounded-2xl font-bold text-base tracking-wide flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-[#9a0002] text-[#efe6de] shadow-[0_8px_20px_rgba(154,0,2,0.2)] hover:shadow-[0_12px_25px_rgba(154,0,2,0.3)] border border-[#9a0002]",
    danger: "bg-rose-600 text-white shadow-[0_8px_20px_rgba(225,29,72,0.25)] hover:shadow-[0_12px_25px_rgba(225,29,72,0.4)] border border-rose-500",
    outline: "bg-transparent border-2 border-[#9a0002] text-[#9a0002] hover:bg-[#9a0002]/5",
    glass: "bg-white/50 backdrop-blur-md border border-white text-slate-800 hover:bg-white/80"
  };
  
  return (
    <motion.button 
      disabled={disabled} 
      onClick={onClick} 
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.96 } : {}}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
};

// Layout Wrapper for Routes
const PageWrapper = ({ children, className = "" }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    className={className}
  >
    {children}
  </motion.div>
);

const AuthScreens = ({ setAppRoute, t }) => {
  const [step, setStep] = useState('phone'); 
  const otpRefs = useRef([]);

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (value && index < 3) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };
  
  return (
    <PageWrapper className="min-h-[calc(100vh-80px)] relative overflow-hidden flex flex-col items-center justify-center py-6">
      <div className="relative z-10 w-full max-w-md flex flex-col gap-8">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-3"
        >
          <motion.div 
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="mx-auto w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(154,0,2,0.1)] border-2 border-[#9a0002]/10 mb-6 relative"
          >
            <Shield className="w-12 h-12 text-[#9a0002]" />
          </motion.div>
          <h1 className="text-4xl font-extrabold text-[#9a0002] tracking-tight drop-shadow-sm">
            JANANAYAGAM
          </h1>
          <p className="text-slate-600 font-bold tracking-widest uppercase text-sm opacity-90">
            {t.subtitle}
          </p>
        </motion.div>

        <GlassCard className="mt-2">
          <AnimatePresence mode="wait">
            {step === 'phone' && (
              <motion.div 
                key="phone"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold text-slate-800 text-center">{t.login}</h2>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Mobile Number</label>
                  <motion.div 
                    whileFocus={{ scale: 1.02 }}
                    className="flex bg-white border border-slate-200 rounded-2xl overflow-hidden focus-within:border-[#9a0002] focus-within:ring-1 focus-within:ring-[#9a0002] transition-shadow shadow-sm"
                  >
                    <span className="px-5 py-4 bg-slate-50 text-slate-700 font-bold border-r border-slate-200">+91</span>
                    <input type="tel" className="w-full bg-transparent px-4 py-4 text-slate-800 text-lg outline-none placeholder-slate-400" placeholder="10-digit number" />
                  </motion.div>
                </div>
                <GlowButton onClick={() => { toast.success('OTP sent securely via SMS'); setStep('otp'); }}>Generate Secure OTP</GlowButton>
              </motion.div>
            )}

            {step === 'otp' && (
              <motion.div 
                key="otp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-xl font-bold text-slate-800">Enter OTP</h2>
                  <p className="text-sm text-slate-500 mt-1">Sent to +91 98765 43210</p>
                </div>
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map(index => (
                    <motion.input 
                      key={index} 
                      whileFocus={{ scale: 1.1, y: -4 }}
                      ref={el => otpRefs.current[index] = el}
                      type="text" 
                      inputMode="numeric"
                      maxLength={1} 
                      onChange={(e) => handleOtpChange(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="w-14 h-16 text-center text-3xl font-bold bg-white border border-slate-200 rounded-2xl text-slate-800 focus:border-[#9a0002] focus:ring-2 focus:ring-[#9a0002] outline-none transition-shadow shadow-sm" 
                    />
                  ))}
                </div>
                <GlowButton onClick={() => { toast.success('Identity Verified Successfully'); setStep('aadhaar'); }}>Verify Identity</GlowButton>
              </motion.div>
            )}

            {step === 'aadhaar' && (
              <motion.div 
                key="aadhaar"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5"
              >
                <div className="flex items-center justify-center gap-3 mb-6 bg-[#9a0002]/5 py-3 rounded-xl border border-[#9a0002]/20">
                  <ShieldAlert className="w-6 h-6 text-[#9a0002]" />
                  <h2 className="text-sm font-bold text-[#9a0002] uppercase tracking-wide">Govt KYC Linking</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1 block">Aadhaar Verified Name</label>
                    <div className="relative">
                      <input type="text" value="KARTHIK RAJ S." disabled className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-700 font-bold tracking-wide cursor-not-allowed opacity-80" />
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.3 }}
                        className="absolute right-4 top-4"
                      >
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </motion.div>
                    </div>
                    <p className="text-[11px] text-amber-600 mt-2 flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3 h-3" /> Name is locked to Official Govt Database.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-600 font-bold mb-1 block">District</label>
                      <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 outline-none focus:border-[#9a0002] appearance-none text-base shadow-sm hover:border-[#9a0002]/50 transition-colors">
                        <option>Chennai</option>
                        <option>Madurai</option>
                        <option>Coimbatore</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 font-bold mb-1 block">Ward No</label>
                      <input type="number" placeholder="e.g. 142" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 outline-none focus:border-[#9a0002] text-base shadow-sm transition-all focus:scale-[1.02]" />
                    </div>
                  </div>
                </div>
                <GlowButton onClick={() => { toast.success('Welcome to the Command Center'); setAppRoute('home'); }} className="mt-6">Enter Command Center</GlowButton>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </PageWrapper>
  );
};

const MapScreen = ({ setAppRoute, t }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <PageWrapper className="space-y-6 pb-28">
      {/* CM / TN Govt Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl overflow-hidden shadow-[0_10px_20px_rgba(154,0,2,0.15)] group border-4 border-white bg-slate-900"
      >
        <motion.img 
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          src="https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&q=80&w=800" 
          alt="TN Background" 
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-80" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#9a0002] via-[#9a0002]/70 to-transparent z-10"></div>
        <div className="relative z-20 p-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#efe6de] uppercase bg-[#9a0002]/50 px-2.5 py-1 rounded border border-[#efe6de]/30 mb-2 inline-block backdrop-blur-md">Govt of Tamil Nadu</span>
            <h2 className="text-xl font-black text-white leading-tight drop-shadow-md">CM Public Grievance<br/>Redressal System</h2>
          </div>
          <motion.div
             animate={{ rotateY: 360 }}
             transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
             <Landmark className="w-12 h-12 text-white/50 drop-shadow-lg" />
          </motion.div>
        </div>
      </motion.div>

      {/* 4 Action Grid Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3"
      >
        <motion.button variants={itemVariants} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => setAppRoute('file')} className="bg-white border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.03)] rounded-2xl p-4 text-left hover:border-[#9a0002]/30 transition-colors group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-rose-100 rounded-full blur-2xl group-hover:bg-rose-200 transition-all"></div>
          <AlertTriangle className="w-7 h-7 text-[#9a0002] mb-2 relative z-10" />
          <h3 className="text-slate-800 font-black text-sm relative z-10">File Issue</h3>
          <p className="text-[10px] text-slate-500 mt-1 relative z-10 font-medium">Report new problem</p>
        </motion.button>
        
        <motion.button variants={itemVariants} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => setAppRoute('track')} className="bg-white border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.03)] rounded-2xl p-4 text-left hover:border-[#9a0002]/30 transition-colors group relative overflow-hidden">
           <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#9a0002]/5 rounded-full blur-2xl group-hover:bg-[#9a0002]/10 transition-all"></div>
          <Activity className="w-7 h-7 text-[#9a0002] mb-2 relative z-10" />
          <h3 className="text-slate-800 font-black text-sm relative z-10">Track Status</h3>
          <p className="text-[10px] text-slate-500 mt-1 relative z-10 font-medium">View active complaints</p>
        </motion.button>

        <motion.button variants={itemVariants} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => setAppRoute('feed')} className="bg-white border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.03)] rounded-2xl p-4 text-left hover:border-emerald-500/30 transition-colors group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-50 rounded-full blur-2xl group-hover:bg-emerald-100 transition-all"></div>
          <Users className="w-7 h-7 text-emerald-600 mb-2 relative z-10" />
          <h3 className="text-slate-800 font-black text-sm relative z-10">Civic Feed</h3>
          <p className="text-[10px] text-slate-500 mt-1 relative z-10 font-medium">See local problems</p>
        </motion.button>

        <motion.button variants={itemVariants} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} className="bg-white border border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.03)] rounded-2xl p-4 text-left hover:border-indigo-500/30 transition-colors group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-indigo-50 rounded-full blur-2xl group-hover:bg-indigo-100 transition-all"></div>
          <Landmark className="w-7 h-7 text-indigo-600 mb-2 relative z-10" />
          <h3 className="text-slate-800 font-black text-sm relative z-10">Hierarchy</h3>
          <p className="text-[10px] text-slate-500 mt-1 relative z-10 font-medium">Govt escalation flow</p>
        </motion.button>
      </motion.div>

      {/* Simulated Heatmap Command Center - Light Red Radar Look */}
      <GlassCard className="relative overflow-hidden p-0">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white/50">
          <h3 className="text-slate-800 font-black text-sm flex items-center gap-2">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
               <Zap className="w-4 h-4 text-[#9a0002]" />
            </motion.div>
            Live District Radar
          </h3>
          <motion.span 
            animate={{ opacity: [1, 0.5, 1] }} 
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> SECURE
          </motion.span>
        </div>
        
        {/* Real Interactive Leaflet Map */}
        <div className="h-64 relative overflow-hidden border-b border-slate-100 z-0">
          <MapContainer center={[13.0827, 80.2707]} zoom={7} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 0 }}>
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">Carto</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {/* Chennai Hotspot */}
            <CircleMarker center={[13.0827, 80.2707]} radius={15} pathOptions={{ color: '#9a0002', fillColor: '#9a0002', fillOpacity: 0.5 }}>
              <Popup>
                <div className="text-center">
                  <strong className="text-[#9a0002] font-black">CHENNAI</strong><br/>
                  <span className="text-xs text-slate-500">89 Active Issues</span>
                </div>
              </Popup>
            </CircleMarker>
            {/* Coimbatore Hotspot */}
            <CircleMarker center={[11.0168, 76.9558]} radius={10} pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.5 }}>
              <Popup>
                <div className="text-center">
                  <strong className="text-amber-600 font-black">COIMBATORE</strong><br/>
                  <span className="text-xs text-slate-500">42 Active Issues</span>
                </div>
              </Popup>
            </CircleMarker>
            {/* Madurai Hotspot */}
            <CircleMarker center={[9.9252, 78.1198]} radius={8} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.5 }}>
              <Popup>
                <div className="text-center">
                  <strong className="text-emerald-600 font-black">MADURAI</strong><br/>
                  <span className="text-xs text-slate-500">12 Active Issues</span>
                </div>
              </Popup>
            </CircleMarker>
          </MapContainer>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 bg-white/50">
          <div className="p-3 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="text-xl font-black text-slate-800">1,204</motion.div>
            <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-1">Active</div>
          </div>
          <div className="p-3 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }} className="text-xl font-black text-emerald-600">8,432</motion.div>
            <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-1">Resolved</div>
          </div>
          <div className="p-3 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: "spring" }} className="text-xl font-black text-[#9a0002]">89</motion.div>
            <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-1">Escalated</div>
          </div>
        </div>
      </GlassCard>
    </PageWrapper>
  );
};

const FileComplaint = ({ t, setAppRoute }) => {
  const [severity, setSeverity] = useState('Medium');
  const [isAnon, setIsAnon] = useState(false);

  return (
    <PageWrapper className="space-y-6 pb-28">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-black text-slate-800">Report Issue</h2>
        <motion.span 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xs font-bold bg-[#9a0002]/10 text-[#9a0002] px-3 py-1 rounded-full border border-[#9a0002]/20"
        >
          Ward 142
        </motion.span>
      </div>

      <GlassCard className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <label className="text-sm font-bold text-slate-700 mb-2 block">Issue Title</label>
          <motion.input 
            whileFocus={{ scale: 1.01 }}
            type="text" 
            placeholder="Brief summary of the problem..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 focus:border-[#9a0002] focus:ring-1 focus:ring-[#9a0002] outline-none text-base transition-colors placeholder-slate-400" 
          />
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <label className="text-sm font-bold text-slate-700 mb-2 block">Category</label>
          <div className="flex flex-wrap gap-2">
            {t.categories.map((cat, i) => (
              <motion.button 
                key={cat} 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + (i * 0.05) }}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-[#9a0002]/5 hover:border-[#9a0002]/30 hover:text-[#9a0002] transition-colors shadow-sm"
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <label className="text-sm font-bold text-slate-700 mb-2 block">Detailed Description</label>
          <motion.textarea 
            whileFocus={{ scale: 1.01 }}
            rows={4} 
            placeholder="Provide specific details to help officials locate and understand the problem..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 focus:border-[#9a0002] focus:ring-1 focus:ring-[#9a0002] outline-none text-base resize-none transition-colors placeholder-slate-400"
          ></motion.textarea>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-3">
          <label className="text-sm font-bold text-slate-700 block">Severity Level</label>
          <div className="flex gap-2">
            {['Low', 'Medium', 'High', 'Emergency'].map(level => (
              <motion.button 
                key={level} 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSeverity(level)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors relative overflow-hidden ${
                  severity === level 
                    ? level === 'Emergency' ? 'bg-rose-100 border-rose-500 text-rose-700 shadow-sm' 
                    : level === 'High' ? 'bg-amber-100 border-amber-500 text-amber-700 shadow-sm'
                    : 'bg-[#9a0002]/10 border-[#9a0002] text-[#9a0002] shadow-sm'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {severity === level && (
                  <motion.div 
                    layoutId="severity-active"
                    className="absolute inset-0 bg-black/5"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{level}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid grid-cols-2 gap-3">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center justify-center gap-2 bg-white border border-slate-200 shadow-sm rounded-xl py-4 text-slate-700 hover:bg-slate-50 transition-colors">
            <Camera className="w-5 h-5 text-[#9a0002]" /> 
            <span className="text-sm font-bold">Add Photo</span>
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center justify-center gap-2 bg-white border border-slate-200 shadow-sm rounded-xl py-4 text-slate-700 hover:bg-slate-50 transition-colors">
            <Video className="w-5 h-5 text-indigo-600" /> 
            <span className="text-sm font-bold">Add Video</span>
          </motion.button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.6 }}
          className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-inner"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg border border-blue-200">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-800 font-bold">GPS Auto-Location</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Lat: 13.0827° N, Long: 80.2707° E</p>
            </div>
          </div>
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.7 }}
          className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-bold text-slate-700">File Anonymously</span>
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsAnon(!isAnon)}
            className={`w-12 h-6 rounded-full transition-colors relative border ${isAnon ? 'bg-[#9a0002] border-[#9a0002]' : 'bg-slate-200 border-slate-300'}`}
          >
            <motion.div 
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`absolute top-[1px] w-5 h-5 rounded-full bg-white shadow-sm ${isAnon ? 'left-[22px]' : 'left-[1px]'}`}
            />
          </motion.button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <GlowButton 
            onClick={() => { toast.success('Complaint filed successfully!'); setAppRoute('track'); }} 
            variant={severity === 'Emergency' ? 'danger' : 'primary'} 
            className="mt-6"
          >
            Submit to Govt Command
          </GlowButton>
        </motion.div>
      </GlassCard>
    </PageWrapper>
  );
};

const TrackIssues = () => {
  return (
    <PageWrapper className="space-y-6 pb-28">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-black text-slate-800">Track Complaints</h2>
      </div>

      {/* Active Complaint Card */}
      <GlassCard className="p-0 overflow-hidden border-[#9a0002]/20">
        <div className="p-4 bg-[#9a0002]/5 border-b border-[#9a0002]/10 flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold tracking-wider text-[#9a0002] uppercase">Issue ID: TN-2026-8942A</span>
            <h3 className="text-slate-800 font-black mt-1 text-lg">Water Logging on Main Street</h3>
          </div>
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-amber-200 text-amber-600 text-xs px-2.5 py-1.5 rounded-md font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Clock className="w-3.5 h-3.5" /> SLA: 12 hrs left
          </motion.span>
        </div>

        <div className="p-5">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}>
               <Navigation className="w-4 h-4 text-[#9a0002]" /> 
            </motion.div>
            Live Routing Path
          </h4>
          
          <div className="space-y-0 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-[2px] before:bg-gradient-to-b before:from-[#9a0002] before:via-slate-200 before:to-transparent">
            {routingSteps.map((step, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="relative flex items-start gap-4 pb-6 last:pb-0"
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 shrink-0 z-10 bg-white
                  ${step.status === 'done' ? 'border-[#9a0002] text-[#9a0002]' : 
                    step.status === 'current' ? 'border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 
                    'border-slate-200 text-slate-300'}`}>
                  {step.status === 'done' && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}><CheckCircle className="w-5 h-5" /></motion.div>}
                  {step.status === 'current' && <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}><Clock className="w-5 h-5" /></motion.div>}
                </div>
                <motion.div 
                  whileHover={step.status === 'current' ? { scale: 1.02 } : {}}
                  className={`flex-1 p-3.5 rounded-xl border ${step.status === 'current' ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100 shadow-sm'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-bold ${step.status === 'current' ? 'text-amber-700' : 'text-slate-700'}`}>{step.role}</h4>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">{step.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{step.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Past/Resolved Summary */}
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider pl-2 mt-8">Recently Resolved</h3>
      <motion.div 
        whileHover={{ scale: 1.02, x: 5 }}
        whileTap={{ scale: 0.98 }}
        className="p-4 flex items-center gap-4 bg-white hover:bg-slate-50 rounded-3xl transition-colors cursor-pointer border border-slate-200 shadow-sm"
      >
         <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center shrink-0 border border-emerald-100">
           <CheckCircle className="w-6 h-6 text-emerald-500" />
         </div>
         <div className="flex-1">
           <h4 className="text-slate-800 text-sm font-black">Streetlight Replacement</h4>
           <p className="text-xs text-slate-500 mt-0.5 font-medium">Resolved on May 18, 2026</p>
         </div>
         <ChevronRight className="w-5 h-5 text-slate-400" />
      </motion.div>
    </PageWrapper>
  );
};

const LiveFeed = ({ t }) => {
  return (
    <PageWrapper className="space-y-6 pb-28">
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="flex justify-between items-center bg-gradient-to-r from-[#9a0002] to-rose-800 p-5 rounded-2xl shadow-[0_8px_20px_rgba(154,0,2,0.2)]"
      >
        <div>
          <h2 className="text-xl font-black text-white drop-shadow-sm">Live Civic Feed</h2>
          <p className="text-xs text-rose-200 mt-0.5 font-medium">Trending in your District</p>
        </div>
        <motion.button 
          whileHover={{ rotate: 180, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="text-white p-2.5 bg-white/10 rounded-full border border-white/20"
        >
          <RefreshCw className="w-5 h-5" />
        </motion.button>
      </motion.div>

      <div className="space-y-6">
        {mockFeed.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
          >
            <GlassCard className="p-0 overflow-hidden border-slate-200 shadow-sm">
              <div className="p-4 flex justify-between items-center border-b border-slate-100 bg-white">
                <div className="flex items-center gap-3">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-10 h-10 bg-gradient-to-br from-[#9a0002] to-rose-600 rounded-full flex items-center justify-center font-bold text-white shadow-md border-2 border-white"
                  >
                    {post.user.charAt(0)}
                  </motion.div>
                  <div>
                    <h4 className="text-slate-800 font-black text-sm flex items-center gap-1.5">
                      {post.user} <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                    </h4>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono font-medium">
                      <MapPin className="w-3 h-3 text-[#9a0002]" /> {post.location} • {post.time}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border tracking-wide uppercase
                  ${post.status === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                    post.status === 'ESCALATED' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                    'bg-blue-50 text-blue-700 border-blue-200'}`}>
                  {post.status}
                </span>
              </div>
              
              <div className="p-4 pb-3 bg-white">
                <span className="inline-block px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-black text-slate-600 uppercase mb-3 shadow-sm">{post.category}</span>
                <p className="text-slate-700 text-sm leading-relaxed font-medium">{post.desc}</p>
              </div>

              <div className="relative border-y border-slate-100 overflow-hidden">
                 <motion.img 
                   whileHover={{ scale: 1.05 }}
                   transition={{ duration: 0.4 }}
                   src={post.image} alt="Issue evidence" className="w-full h-56 object-cover" 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3 pointer-events-none">
                   <span className="text-xs text-white flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-md backdrop-blur-md border border-white/20 font-bold">
                     <Shield className="w-3.5 h-3.5 text-emerald-400" /> Geotag Verified
                   </span>
                 </div>
              </div>

              <div className="p-1 flex gap-1 bg-slate-50">
                <motion.button whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }} whileTap={{ scale: 0.95 }} className="flex-1 py-3 rounded-lg text-xs font-black text-slate-600 flex flex-col items-center justify-center gap-1.5 transition-colors group">
                  <motion.div whileHover={{ y: -2, scale: 1.1 }}><ThumbsUp className="w-5 h-5 text-slate-400 group-hover:text-[#9a0002] transition-colors" /></motion.div>
                  <span>{t.support} ({post.supports})</span>
                </motion.button>
                <motion.button whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }} whileTap={{ scale: 0.95 }} className="flex-1 py-3 rounded-lg text-xs font-black text-slate-600 flex flex-col items-center justify-center gap-1.5 transition-colors group">
                  <motion.div whileHover={{ y: -2, scale: 1.1 }}><Camera className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" /></motion.div>
                  <span>{t.evidence}</span>
                </motion.button>
                <motion.button whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }} whileTap={{ scale: 0.95 }} className="flex-1 py-3 rounded-lg text-xs font-black text-slate-600 flex flex-col items-center justify-center gap-1.5 transition-colors group">
                  <motion.div whileHover={{ y: -2, scale: 1.1 }}><AlertTriangle className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-colors" /></motion.div>
                  <span>{t.similar}</span>
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </PageWrapper>
  );
};

const ProfileDashboard = ({ setAppRoute }) => {
  return (
    <PageWrapper className="space-y-6 pb-28 text-center">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="relative inline-block mt-4"
      >
        <motion.div 
          whileHover={{ scale: 1.05, rotate: -5 }}
          className="w-28 h-28 bg-gradient-to-tr from-[#9a0002] to-rose-600 rounded-full mx-auto flex items-center justify-center text-4xl font-black text-white border-4 border-[#efe6de] shadow-[0_8px_20px_rgba(154,0,2,0.2)] relative z-10"
        >
          KR
        </motion.div>
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="absolute -bottom-2 -right-2 bg-emerald-500 border-4 border-[#efe6de] w-8 h-8 rounded-full z-20 flex items-center justify-center shadow-sm"
        >
           <CheckCircle className="w-4 h-4 text-white" />
        </motion.div>
      </motion.div>
      
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-2xl font-black text-slate-800">Karthik Raj S.</h2>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Shield className="w-4 h-4 text-[#9a0002]" />
          <p className="text-[#9a0002] text-xs font-black font-mono tracking-widest bg-[#9a0002]/10 px-3 py-1 rounded-full border border-[#9a0002]/20">CITIZEN SCORE: 850</p>
        </div>
      </motion.div>

      <GlassCard className="grid grid-cols-2 gap-3 text-left">
         <motion.div whileHover={{ y: -2 }} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-sm">
           <div className="text-sm font-bold text-slate-500 mb-2 flex items-center justify-between">Issues Raised <FileText className="w-4 h-4 text-blue-500" /></div>
           <div className="text-4xl font-black text-slate-800">12</div>
         </motion.div>
         <motion.div whileHover={{ y: -2 }} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-sm">
           <div className="text-sm font-bold text-slate-500 mb-2 flex items-center justify-between">Resolved <CheckCircle className="w-4 h-4 text-emerald-500" /></div>
           <div className="text-4xl font-black text-emerald-600">10</div>
         </motion.div>
      </GlassCard>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-3">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-white border border-slate-200 shadow-sm p-4 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-slate-700 font-bold">Activity History</span>
          </div>
          <motion.div whileHover={{ x: 3 }}><ChevronRight className="w-5 h-5 text-slate-400" /></motion.div>
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-white border border-slate-200 shadow-sm p-4 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 rounded-lg border border-rose-100">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
            </div>
            <span className="text-slate-700 font-bold">Emergency Contacts</span>
          </div>
          <motion.div whileHover={{ x: 3 }}><ChevronRight className="w-5 h-5 text-slate-400" /></motion.div>
        </motion.button>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <GlowButton variant="outline" onClick={() => setAppRoute('auth')} className="mt-8 bg-white shadow-sm">
          Secure Logout
        </GlowButton>
      </motion.div>
    </PageWrapper>
  );
};

export default function App() {
  const [appRoute, setAppRoute] = useState('auth'); 
  const [lang, setLang] = useState('en');
  const [darkMode, setDarkMode] = useState(false);
  
  const t = translations[lang];

  useEffect(() => {
    document.body.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    injectStyles();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen relative font-sans selection:bg-[#9a0002]/30 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Toaster position="top-center" richColors theme={darkMode ? 'dark' : 'light'} />      
      {/* Background pattern */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4),_transparent)] pointer-events-none"></div>

      {/* Top Glass Header */}
      {appRoute !== 'auth' && (
        <header className="sticky top-0 z-50 bg-[#efe6de]/80 backdrop-blur-2xl border-b border-[#9a0002]/10 px-5 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2.5">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="w-8 h-8 bg-gradient-to-br from-[#9a0002] to-rose-700 rounded-lg flex items-center justify-center shadow-md border border-white/20"
            >
              <Shield className="w-4 h-4 text-white" />
            </motion.div>
            <h1 className="text-xl font-black tracking-wide text-[#9a0002]">
              JANANAYAGAM
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
              className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-[#9a0002] dark:text-rose-400 border border-[#9a0002]/20 hover:bg-[#9a0002]/5 transition-colors shadow-sm"
            >
              {lang === 'en' ? 'தமிழ்' : 'ENG'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative bg-white dark:bg-slate-800 p-2 rounded-full border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              <motion.div whileHover={{ rotate: 15 }}><Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" /></motion.div>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#9a0002] border-2 border-white dark:border-slate-800 rounded-full animate-pulse shadow-sm"></span>
            </motion.div>
          </div>
        </header>
      )}

      {/* Main Dynamic Content Area */}
      <main className="p-5 relative z-10 max-w-md mx-auto min-h-[calc(100vh-80px)]">
        <AnimatePresence mode="wait">
          <motion.div key={appRoute}>
            {appRoute === 'auth' && <AuthScreens setAppRoute={setAppRoute} t={t} />}
            {appRoute === 'home' && <MapScreen setAppRoute={setAppRoute} t={t} />}
            {appRoute === 'file' && <FileComplaint setAppRoute={setAppRoute} t={t} />}
            {appRoute === 'track' && <TrackIssues t={t} />}
            {appRoute === 'feed' && <LiveFeed t={t} />}
            {appRoute === 'profile' && <ProfileDashboard setAppRoute={setAppRoute} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Floating Navigation */}
      {appRoute !== 'auth' && (
        <nav className="fixed bottom-0 w-full z-50 bg-[#efe6de]/90 backdrop-blur-3xl border-t border-slate-200 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          <div className="flex justify-around items-end px-2 py-2 max-w-md mx-auto relative">
            
            <NavButton active={appRoute === 'home'} onClick={() => setAppRoute('home')} icon={<Home />} label={t.home} />
            <NavButton active={appRoute === 'file'} onClick={() => setAppRoute('file')} icon={<AlertTriangle />} label={t.file} />
            
            {/* Center Action Button (Track) */}
            <div className="relative -top-5">
              <motion.button 
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setAppRoute('track')}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(154,0,2,0.3)] transition-colors duration-300 border-2 ${appRoute === 'track' ? 'bg-[#9a0002] text-white border-white' : 'bg-white border-[#9a0002]/20 text-[#9a0002] hover:bg-slate-50'}`}
              >
                <motion.div animate={appRoute === 'track' ? { y: [0, -3, 0] } : {}} transition={{ repeat: Infinity, duration: 1.5 }}>
                  <Navigation className="w-6 h-6" />
                </motion.div>
              </motion.button>
              <span className="absolute -bottom-5 w-full text-center text-[10px] font-bold text-slate-600">Track</span>
            </div>

            <NavButton active={appRoute === 'feed'} onClick={() => setAppRoute('feed')} icon={<Users />} label={t.feed} />
            <NavButton active={appRoute === 'profile'} onClick={() => setAppRoute('profile')} icon={<User />} label={t.profile} />
          </div>
        </nav>
      )}
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label }) => (
  <motion.button 
    whileTap={{ scale: 0.85 }}
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-16 h-12 relative transition-colors duration-300
      ${active ? 'text-[#9a0002]' : 'text-slate-400 hover:text-slate-600'}`}
  >
    <motion.div 
      initial={false}
      animate={{ y: active ? -4 : 0, scale: active ? 1.1 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {React.cloneElement(icon, { className: 'w-6 h-6 mb-1' })}
    </motion.div>
    <motion.span 
      initial={false}
      animate={{ opacity: active ? 1 : 0.8, y: active ? 0 : 2 }}
      className="text-[10px] font-black tracking-wide"
    >
      {label}
    </motion.span>
  </motion.button>
);
