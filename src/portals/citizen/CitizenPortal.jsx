import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, AlertTriangle, MapPin, Users, User, Shield, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import CitizenDashboard from './CitizenDashboard';
import SubmitTicket from './SubmitTicket';
import MyTickets from './MyTickets';
import CivicFeed from './CivicFeed';
import EscalationHierarchy from './EscalationHierarchy';
import LocationSettings from '../../shared/components/LocationSettings';
import ProfilePage from '../../shared/components/ProfilePage';

export default function CitizenPortal() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    const livingAddr = localStorage.getItem('jn_living_address');
    const hasPrompted = sessionStorage.getItem('jn_location_prompted');
    if (!livingAddr && !hasPrompted) {
      setShowWelcomeModal(true);
      sessionStorage.setItem('jn_location_prompted', 'true');
    }
  }, []);

  // Prepopulate 3 mock tickets in localStorage if not present
  useEffect(() => {
    const existing = localStorage.getItem('jn_tickets');
    if (!existing) {
      const mockTickets = [
        {
          id: '1042',
          category: 'roads',
          description: 'Huge pothole near the Velachery main junction causing extreme traffic delays and minor accidents.',
          status: 'open',
          priority: 'critical',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          sla_deadline: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
          ward: '142',
          district: 'Chennai',
          citizen_name: 'Karthik Raj S.'
        },
        {
          id: '1043',
          category: 'water',
          description: 'No drinking water supply in RS Puram street for the past 4 days. Local residents are suffering.',
          status: 'in_progress',
          priority: 'high',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          sla_deadline: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
          ward: '142',
          district: 'Chennai',
          citizen_name: 'Karthik Raj S.'
        },
        {
          id: '1044',
          category: 'electricity',
          description: 'Severe voltage fluctuations in Ward 142 causing damages to household appliances.',
          status: 'resolved',
          priority: 'medium',
          created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
          sla_deadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          ward: '142',
          district: 'Chennai',
          citizen_name: 'Karthik Raj S.',
          resolution_proof: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=400',
          resolution_text: 'Transformer and fuse box replaced by local electricity division staff.'
        }
      ];
      localStorage.setItem('jn_tickets', JSON.stringify(mockTickets));
    }
  }, []);

  const citizenName = localStorage.getItem('jn_name') || 'KARTHIK RAJ S.';

  // Language Switch
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ta' : 'en';
    i18n.changeLanguage(newLang);
    toast.success(newLang === 'en' ? 'Switched to English' : 'தமிழுக்கு மாற்றப்பட்டது');
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.info(tLabel('Logged out successfully', 'வெற்றிகரமாக வெளியேறப்பட்டது'));
    navigate('/');
  };

  // Active Tab Helpers
  const path = location.pathname;
  const isMapActive = path === '/citizen' || path === '/citizen/';
  const isSubmitActive = path === '/citizen/submit';
  const isTrackActive = path === '/citizen/tickets';
  const isFeedActive = path === '/citizen/feed';
  const isProfileActive = path === '/citizen/profile' || path.startsWith('/citizen/profile/');

  return (
    <div style={{ backgroundColor: '#F0EBE3' }} className="min-h-screen font-sans">
      
      {/* 📱 Mock smartphone container - Centered on desktop, full-width on mobile */}
      <div className="max-w-md mx-auto min-h-screen bg-[#F0EBE3] flex flex-col border-x border-slate-200/50 shadow-2xl relative pb-[66px]">
        
        {/* ══ 1. HEADER ══ */}
        <header className="bg-white px-4 py-3 flex justify-between items-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border-b border-slate-100 z-50">
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => navigate('/citizen')}>
            <Shield className="w-5 h-5 text-[#8B1A1A]" />
            <h1 className="text-sm font-black text-[#8B1A1A] tracking-wider uppercase">
              JanaNayagam
            </h1>
          </div>

          <div className="flex items-center gap-2.5 select-none">
            {/* Language switches */}
            <button
              onClick={toggleLanguage}
              className="text-[10px] font-black px-2 py-1 rounded bg-slate-50 border border-slate-200 text-[#8B1A1A] cursor-pointer"
            >
              {i18n.language === 'en' ? 'தமிழ்' : 'EN'}
            </button>
            
            {/* Profile Settings Avatar */}
            <button
              onClick={() => navigate('/citizen/profile')}
              className="relative w-7 h-7 bg-[#8B1A1A]/10 text-[#8B1A1A] border border-[#8B1A1A]/20 rounded-full flex items-center justify-center font-extrabold text-[10px] hover:bg-[#8B1A1A]/20 transition-all cursor-pointer shadow-sm"
              title={tLabel("Location Settings", "இருப்பிட அமைப்புகள்")}
            >
              {citizenName.slice(0, 2).toUpperCase()}
              {!localStorage.getItem('jn_living_address') && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white animate-pulse" />
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-1 bg-slate-100 border border-slate-200 rounded text-slate-500 hover:text-[#8B1A1A] hover:bg-[#8B1A1A]/5 transition-colors cursor-pointer"
              title={tLabel("Logout", "வெளியேறு")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            </button>
          </div>
        </header>

        {/* ══ 2. MAIN SCROLLABLE CONTENT AREA ══ */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <Routes>
            <Route path="/" element={<CitizenDashboard />} />
            <Route path="/submit" element={<SubmitTicket />} />
            <Route path="/tickets" element={<MyTickets />} />
            <Route path="/feed" element={<CivicFeed />} />
            <Route path="/hierarchy" element={<EscalationHierarchy />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/location" element={<LocationSettings />} />
          </Routes>
        </main>

        {/* Floating Action Button (FAB) */}
        {path !== '/citizen/submit' && (
          <button
            onClick={() => navigate('/citizen/submit')}
            style={{ backgroundColor: '#8B1A1A' }}
            className="fixed bottom-[80px] right-4 sm:right-[calc(50vw-200px)] w-14 h-14 rounded-full text-white flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.2)] active:scale-95 transition-transform z-40 select-none cursor-pointer"
          >
            <span className="text-3xl font-light leading-none">+</span>
          </button>
        )}

        {/* ══ 3. FIXED BOTTOM TAB BAR ══ */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 bg-white border-t border-slate-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] h-[66px] flex justify-around items-center px-2 select-none shrink-0 fixed-bottom-nav">
          
          {/* Tab 1: Live Map */}
          <button
            onClick={() => navigate('/citizen')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
              isMapActive ? 'text-[#8B1A1A]' : 'text-slate-400'
            }`}
          >
            <Home className="w-5.5 h-5.5" />
            <span className="text-[10px] font-black uppercase mt-1 tracking-wide">
              {tLabel('Home', 'முகப்பு')}
            </span>
          </button>

          {/* Tab 2: File Issue */}
          <button
            onClick={() => navigate('/citizen/submit')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
              isSubmitActive ? 'text-[#8B1A1A]' : 'text-slate-400'
            }`}
          >
            <AlertTriangle className="w-5.5 h-5.5" />
            <span className="text-[10px] font-black uppercase mt-1 tracking-wide">
              {tLabel('File Issue', 'புகார்')}
            </span>
          </button>

          {/* Tab 3: Track (Centre circular raised button) */}
          <div className="flex flex-col items-center justify-center flex-1 relative -mt-3.5">
            <button
              onClick={() => navigate('/citizen/tickets')}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(139,26,26,0.4)] transition-all transform active:scale-95 cursor-pointer ${
                isTrackActive 
                  ? 'bg-[#8B1A1A] border-4 border-[#F0EBE3] text-white' 
                  : 'bg-[#8B1A1A] border-4 border-[#F0EBE3] text-white/80'
              }`}
            >
              <MapPin className="w-5.5 h-5.5 animate-pulse" />
            </button>
            <span className={`text-[10px] font-black uppercase mt-1 tracking-wider ${
              isTrackActive ? 'text-[#8B1A1A]' : 'text-slate-400'
            }`}>
              {tLabel('Track', 'கண்காணி')}
            </span>
          </div>

          {/* Tab 4: Live Feed */}
          <button
            onClick={() => navigate('/citizen/feed')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
              isFeedActive ? 'text-[#8B1A1A]' : 'text-slate-400'
            }`}
          >
            <Users className="w-5.5 h-5.5" />
            <span className="text-[10px] font-black uppercase mt-1 tracking-wide">
              {tLabel('Feed', 'ஊட்டம்')}
            </span>
          </button>

          {/* Tab 5: Profile */}
          <button
            onClick={() => navigate('/citizen/profile')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
              isProfileActive ? 'text-[#8B1A1A]' : 'text-slate-400'
            }`}
          >
            <User className="w-5.5 h-5.5" />
            <span className="text-[10px] font-black uppercase mt-1 tracking-wide">
              {tLabel('Profile', 'சுயவிவரம்')}
            </span>
          </button>

        </nav>

        {/* ══ 4. WELCOME DIALOG MODAL (One-Time Prompt) ══ */}
        {showWelcomeModal && (
          <div className="absolute inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 max-w-sm w-full space-y-4">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100 shadow-sm">
                  <Shield className="w-6 h-6 text-[#8B1A1A]" />
                </div>
                <h3 className="text-base font-black text-slate-800">
                  {tLabel("Update Living Address", "வசிப்பிட முகவரியை அமைக்கவும்")}
                </h3>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                  {tLabel(
                    "JanaNayagam routes your local complaints to the correct Ward Officer based on your Current Living Address. Your Aadhaar address is locked to Madurai, but you can set your active ward in Chennai.",
                    "ஜனநாயகம் உங்கள் வசிப்பிட வார்டின் அடிப்படையில் புகார்களை வழிநடத்துக்கிறது. உங்கள் ஆதார் முகவரி மதுரையுடன் பூட்டப்பட்டுள்ளது, ஆனால் நீங்கள் சென்னையில் வார்டை அமைக்கலாம்."
                  )}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    setShowWelcomeModal(false);
                    navigate('/citizen/profile/location');
                  }}
                  style={{ backgroundColor: '#8B1A1A' }}
                  className="w-full text-white font-extrabold text-xs py-3 rounded-xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-white/90" />
                  <span>{tLabel("Configure Address Now", "முகவரியை இப்போது அமை")}</span>
                </button>
                <button
                  onClick={() => setShowWelcomeModal(false)}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 font-extrabold text-xs py-3 rounded-xl transition-all flex items-center justify-center cursor-pointer"
                >
                  <span>{tLabel("Skip for Now", "பிறகு செய்கிறேன்")}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
