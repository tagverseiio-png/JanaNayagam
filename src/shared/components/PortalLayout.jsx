import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { 
  Shield, LogOut, Menu, X, Landmark, User, Bell, Map, Home, AlertTriangle, FileText, 
  Inbox, CheckCircle, TrendingUp, ArrowUpRight, ShieldAlert, Settings, BarChart2, 
  Zap, Award, Globe, PlusCircle, ArrowLeft
} from 'lucide-react';
import LanguageToggle from './LanguageToggle';
import ProfilePage from './ProfilePage';
import LocationSettings from './LocationSettings';

export default function PortalLayout({ children, sidebarLinks, roleLabel }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [elderlyMode, setElderlyMode] = useState(
    localStorage.getItem('jn_elderly_mode') === 'true'
  );

  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  const userName = localStorage.getItem('jn_name') || 'Officer Name';
  const role = localStorage.getItem('jn_role') || 'citizen';
  const ward = localStorage.getItem('jn_ward') || '142';
  const district = localStorage.getItem('jn_district') || 'Chennai';

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (roleLabel) {
      document.title = `JanaNayagam | ${roleLabel}`;
    } else {
      document.title = 'JanaNayagam';
    }

    const isElderly = localStorage.getItem('jn_elderly_mode') === 'true';
    if (isElderly) {
      document.body.classList.add('elderly-mode');
    } else {
      document.body.classList.remove('elderly-mode');
    }
  }, [roleLabel]);

  const toggleElderlyMode = () => {
    const nextVal = !elderlyMode;
    setElderlyMode(nextVal);
    localStorage.setItem('jn_elderly_mode', String(nextVal));
    if (nextVal) {
      document.body.classList.add('elderly-mode');
      toast.success('Elderly Mode (A+) Activated');
    } else {
      document.body.classList.remove('elderly-mode');
      toast.success('Elderly Mode Deactivated');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success(tLabel('Logged out successfully', 'வெற்றிகரமாக வெளியேறப்பட்டது'));
    navigate('/', { replace: true });
  };

  // Get count of tickets from localStorage for badges
  const [ticketCount, setTicketCount] = useState(0);
  const [escalatedCount, setEscalatedCount] = useState(0);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('jn_tickets') || '[]');
    setTicketCount(list.filter(t => t.status === 'open' || t.status === 'in_progress').length);
    setEscalatedCount(list.filter(t => t.status === 'escalated').length);
  }, [location.pathname]);

  // Resolve bottom tabs dynamically based on the role
  const getBottomTabs = () => {
    const cleanRole = role.replace('-', '_');
    switch (cleanRole) {
      case 'vao':
        return [
          { label: tLabel('Home', 'முகப்பு'), path: '/vao', icon: <Home className="w-5.5 h-5.5" /> },
          { label: tLabel('Raise', 'புகார்'), path: '/vao/raise', icon: <AlertTriangle className="w-5.5 h-5.5" /> },
          { label: tLabel('Village', 'கிராமம்'), path: '/vao/tickets', icon: <FileText className="w-5.5 h-5.5" /> },
          { label: tLabel('Profile', 'சுயவிவரம்'), path: '/vao/profile', icon: <User className="w-5.5 h-5.5" /> }
        ];
      case 'ward_officer':
        return [
          { label: tLabel('Home', 'முகப்பு'), path: '/ward-officer', icon: <Home className="w-5.5 h-5.5" /> },
          { label: tLabel('Inbox', 'உள்பெட்டி'), path: '/ward-officer/inbox?filter=open', icon: <Inbox className="w-5.5 h-5.5" />, badge: ticketCount },
          { label: tLabel('Escalated', 'மேல்முறையீடு'), path: '/ward-officer/inbox?filter=escalated', icon: <AlertTriangle className="w-5.5 h-5.5" />, badge: escalatedCount },
          { label: tLabel('Resolved', 'தீர்வு'), path: '/ward-officer/inbox?filter=resolved', icon: <CheckCircle className="w-5.5 h-5.5" /> },
          { label: tLabel('Profile', 'சுயவிவரம்'), path: '/ward-officer/profile', icon: <User className="w-5.5 h-5.5" /> }
        ];
      case 'bdo':
        return [
          { label: tLabel('Home', 'முகப்பு'), path: '/bdo', icon: <Home className="w-5.5 h-5.5" /> },
          { label: tLabel('Tickets', 'புகார்கள்'), path: '/bdo/tickets', icon: <FileText className="w-5.5 h-5.5" /> },
          { label: tLabel('Analytics', 'விவரம்'), path: '/bdo/analytics', icon: <TrendingUp className="w-5.5 h-5.5" /> },
          { label: tLabel('Escalate', 'மேல்முறையீடு'), path: '/bdo/escalate', icon: <ArrowUpRight className="w-5.5 h-5.5" /> },
          { label: tLabel('Profile', 'சுயவிவரம்'), path: '/bdo/profile', icon: <User className="w-5.5 h-5.5" /> }
        ];
      case 'dro':
        return [
          { label: tLabel('Home', 'முகப்பு'), path: '/dro', icon: <Home className="w-5.5 h-5.5" /> },
          { label: tLabel('Revenue', 'வருவாய்'), path: '/dro/tickets', icon: <FileText className="w-5.5 h-5.5" /> },
          { label: tLabel('Flag', 'கொடி'), path: '/dro/flagged', icon: <ShieldAlert className="w-5.5 h-5.5" /> },
          { label: tLabel('Profile', 'சுயவிவரம்'), path: '/dro/profile', icon: <User className="w-5.5 h-5.5" /> }
        ];
      case 'mla':
        return [
          { label: tLabel('Home', 'முகப்பு'), path: '/mla', icon: <Home className="w-5.5 h-5.5" /> },
          { label: tLabel('Constituency', 'தொகுதி'), path: '/mla/tickets', icon: <FileText className="w-5.5 h-5.5" /> },
          { label: tLabel('Raise', 'புகார்'), path: '/mla/raise', icon: <AlertTriangle className="w-5.5 h-5.5" /> },
          { label: tLabel('Analytics', 'விவரம்'), path: '/mla/analytics', icon: <TrendingUp className="w-5.5 h-5.5" /> },
          { label: tLabel('Profile', 'சுயவிவரம்'), path: '/mla/profile', icon: <User className="w-5.5 h-5.5" /> }
        ];
      case 'collector':
        return [
          { label: tLabel('Home', 'முகப்பு'), path: '/collector', icon: <Home className="w-5.5 h-5.5" /> },
          { label: tLabel('Tickets', 'புகார்கள்'), path: '/collector/tickets', icon: <FileText className="w-5.5 h-5.5" /> },
          { label: tLabel('Wards', 'வார்டுகள்'), path: '/collector/wards', icon: <Settings className="w-5.5 h-5.5" /> },
          { label: tLabel('Reports', 'அறிக்கைகள்'), path: '/collector/performance', icon: <TrendingUp className="w-5.5 h-5.5" /> },
          { label: tLabel('Profile', 'சுயவிவரம்'), path: '/collector/profile', icon: <User className="w-5.5 h-5.5" /> }
        ];
      case 'dept_secretary':
        return [
          { label: tLabel('Home', 'முகப்பு'), path: '/dept-secretary', icon: <Home className="w-5.5 h-5.5" /> },
          { label: tLabel('Tickets', 'புகார்கள்'), path: '/dept-secretary/tickets', icon: <FileText className="w-5.5 h-5.5" /> },
          { label: tLabel('Reports', 'அறிக்கைகள்'), path: '/dept-secretary/reports', icon: <BarChart2 className="w-5.5 h-5.5" /> },
          { label: tLabel('Bulk', 'மொத்தம்'), path: '/dept-secretary/bulk', icon: <Zap className="w-5.5 h-5.5" /> },
          { label: tLabel('Profile', 'சுயவிவரம்'), path: '/dept-secretary/profile', icon: <User className="w-5.5 h-5.5" /> }
        ];
      case 'minister':
        return [
          { label: tLabel('Home', 'முகப்பு'), path: '/minister', icon: <Home className="w-5.5 h-5.5" /> },
          { label: tLabel('View', 'பார்வை'), path: '/minister/tickets', icon: <FileText className="w-5.5 h-5.5" /> },
          { label: tLabel('Crisis', 'நெருக்கடி'), path: '/minister/crisis', icon: <AlertTriangle className="w-5.5 h-5.5" /> },
          { label: tLabel('CM', 'முதல்வர்'), path: '/minister/directives', icon: <Shield className="w-5.5 h-5.5" /> },
          { label: tLabel('Profile', 'சுயவிவரம்'), path: '/minister/profile', icon: <User className="w-5.5 h-5.5" /> }
        ];
      case 'cm':
        return [
          { label: tLabel('Home', 'முகப்பு'), path: '/cm', icon: <Home className="w-5.5 h-5.5" /> },
          { label: tLabel('State', 'மாநிலம்'), path: '/cm/state', icon: <Globe className="w-5.5 h-5.5" /> },
          { label: tLabel('Emergency', 'அவசரம்'), path: '/cm/emergency', icon: <AlertTriangle className="w-5.5 h-5.5" /> },
          { label: tLabel('Escalations', 'மேல்முறை'), path: '/cm/escalations', icon: <ArrowUpRight className="w-5.5 h-5.5" /> },
          { label: tLabel('Profile', 'சுயவிவரம்'), path: '/cm/profile', icon: <User className="w-5.5 h-5.5" /> }
        ];
      default:
        return [
          { label: tLabel('Home', 'முகப்பு'), path: `/${role.replace('_', '-')}`, icon: <Home className="w-5.5 h-5.5" /> },
          { label: tLabel('Profile', 'சுயவிவரம்'), path: `/${role.replace('_', '-')}/profile`, icon: <User className="w-5.5 h-5.5" /> }
        ];
    }
  };

  const isProfileRoute = location.pathname.endsWith('/profile');
  const isLocationRoute = location.pathname.endsWith('/profile/location');
  const activeTabs = getBottomTabs();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* ══ MOBILE VIEW HEADER (fixed, height 56px) ══ */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-slate-900 border-b border-[#DDE1E7] px-4 flex justify-between items-center z-50">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-1.5">
          <Shield className="w-5 h-5 text-[#8B1A1A]" />
          <h1 className="text-sm font-black text-[#8B1A1A] tracking-wider uppercase">
            JanaNayagam
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-600 rounded-full border border-white" />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#8B1A1A] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {initials}
          </div>
        </div>
      </header>

      {/* ══ MOBILE VIEW DRAWER SIDEBAR ══ */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 transition-opacity"
          />

          {/* Drawer sheet */}
          <div className="relative w-[280px] max-w-[280px] bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl z-10 transition-transform duration-250 ease-out translate-x-0">
            {/* Drawer top close */}
            <div className="p-4 flex justify-end">
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Profile summary card inside drawer */}
            <div className="px-5 pb-4 flex flex-col items-center text-center space-y-2 select-none">
              <div className="w-14 h-14 rounded-full bg-[#8B1A1A] text-white flex items-center justify-center font-extrabold text-lg shadow-inner">
                {initials}
              </div>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wide truncate max-w-full">
                {userName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-50 dark:bg-rose-950/20 text-[#8B1A1A] border border-[#8B1A1A]/10">
                {role.replace('_', ' ')}
              </span>
              <span className="text-[11px] text-slate-400 font-bold">
                {tLabel('Ward', 'வார்டு')} {ward}, {district}
              </span>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Drawer Links */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {sidebarLinks?.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${
                      isActive
                        ? 'bg-red-50 dark:bg-rose-950/10 text-[#8B1A1A] border-l-4 border-[#8B1A1A]'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {link.icon && React.cloneElement(link.icon, { className: 'w-4 h-4 shrink-0' })}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Language + Elderly switch + Logout inside drawer */}
            <div className="p-4 space-y-3 select-none">
              {/* Language toggler */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold">{tLabel('Language', 'மொழி')}</span>
                <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/50">
                  <button
                    onClick={() => { i18n.changeLanguage('en'); toast.success('Switched to English'); }}
                    className={`px-2 py-1 rounded text-[10px] font-black ${!isTa ? 'bg-[#8B1A1A] text-white' : 'text-slate-500'}`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => { i18n.changeLanguage('ta'); toast.success('தமிழுக்கு மாற்றப்பட்டது'); }}
                    className={`px-2 py-1 rounded text-[10px] font-black ${isTa ? 'bg-[#8B1A1A] text-white' : 'text-slate-500'}`}
                  >
                    தமிழ்
                  </button>
                </div>
              </div>

              {/* Elderly Mode switch */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold">{tLabel('Elderly Mode (A+)', 'முதியோர் பயன்முறை')}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={elderlyMode}
                    onChange={toggleElderlyMode}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8B1A1A]"></div>
                </label>
              </div>

              <hr className="border-slate-100 dark:border-slate-800" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl hover:bg-red-50 text-xs font-black text-red-600 uppercase"
              >
                <LogOut className="w-4 h-4" />
                <span>{tLabel('Logout Session', 'வெளியேறு')}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ══ DESKTOP SIDEBAR (screen width >= 768px) ══ */}
      <div className="hidden md:flex flex-row flex-1 overflow-hidden">
        
        {/* Left Sidebar */}
        <aside className="w-[240px] bg-white dark:bg-slate-900 border-r border-[#DDE1E7] flex flex-col justify-between select-none shrink-0 z-30">
          <div className="flex flex-col">
            {/* Sidebar Logo */}
            <div className="p-5 border-b border-[#DDE1E7] flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#8B1A1A]" />
              <div>
                <h1 className="text-sm font-black text-[#8B1A1A] tracking-wider uppercase leading-none">
                  JanaNayagam
                </h1>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">
                  COMMAND CENTER
                </span>
              </div>
            </div>

            {/* Sidebar Links */}
            <nav className="p-4 space-y-1">
              {sidebarLinks?.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${
                      isActive
                        ? 'bg-red-50 dark:bg-rose-950/20 text-[#8B1A1A] border-l-4 border-[#8B1A1A]'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {link.icon && React.cloneElement(link.icon, { className: 'w-4 h-4 shrink-0' })}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom logout + Profile summary */}
          <div className="p-4 border-t border-[#DDE1E7] space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#8B1A1A] text-white flex items-center justify-center font-bold text-xs select-none">
                {initials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">{userName}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase truncate">{role.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <LanguageToggle />
              <button
                onClick={toggleElderlyMode}
                className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                  elderlyMode 
                    ? 'bg-black border-black text-white'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                A+
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 text-[10px] font-black text-rose-600 uppercase border border-rose-100 dark:border-rose-900/50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{tLabel('Logout Session', 'வெளியேறு')}</span>
            </button>
          </div>
        </aside>

        {/* ══ DESKTOP TOP BAR & CONTENT AREA ══ */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Desktop header topbar */}
          <header className="h-14 bg-white dark:bg-slate-900 border-b border-[#DDE1E7] px-6 flex justify-between items-center select-none shrink-0 z-20">
            <h2 className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {roleLabel}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-500">
                📍 {district} Division · {tLabel('Ward', 'வார்டு')} {ward}
              </span>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-8 portal-content">
            <div className="max-w-7xl mx-auto">
              {isProfileRoute ? (
                <ProfilePage />
              ) : isLocationRoute ? (
                <LocationSettings />
              ) : (
                children
              )}
            </div>
          </main>
        </div>

      </div>

      {/* ══ MOBILE SCROLLABLE CONTENT BODY ══ */}
      <main className="md:hidden flex-1 overflow-y-auto pt-14 pb-20 portal-content">
        <div className="w-full">
          {isProfileRoute ? (
            <ProfilePage />
          ) : isLocationRoute ? (
            <LocationSettings />
          ) : (
            children
          )}
        </div>
      </main>

      {/* ══ MOBILE VIEW BOTTOM TAB BAR (fixed, height 64px, safe area padding) ══ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-[#DDE1E7] flex justify-around items-center px-1 z-40 pb-[env(safe-area-inset-bottom)] fixed-bottom-nav select-none shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
        {activeTabs.map((tab) => {
          // Normalize paths for matching
          const currentPath = location.pathname + location.search;
          const isActive = tab.path.includes('?') 
            ? currentPath === tab.path 
            : location.pathname === tab.path || (tab.path !== `/${role.replace('_', '-')}` && location.pathname.startsWith(tab.path));

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative ${
                isActive ? 'text-[#8B1A1A]' : 'text-slate-400'
              }`}
            >
              {tab.icon}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute top-1 right-5 bg-red-600 text-white text-[9px] font-black rounded-full min-w-4 h-4 px-1 flex items-center justify-center border border-white">
                  {tab.badge}
                </span>
              )}
              <span className="text-[10px] font-black uppercase mt-1 tracking-wide">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
