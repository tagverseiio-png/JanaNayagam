import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Globe, Shield, Activity, User, LogOut, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [elderlyMode, setElderlyMode] = useState(
    localStorage.getItem('jn_elderly_mode') === 'true'
  );

  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  const role = localStorage.getItem('jn_role') || 'citizen';
  const name = localStorage.getItem('jn_name') || 'Guest User';
  const ward = localStorage.getItem('jn_ward') || localStorage.getItem('jn_living_ward') || 'Ward 142';
  const district = localStorage.getItem('jn_district') || 'Chennai';
  const constituency = localStorage.getItem('jn_constituency') || 'Velachery';
  const department = localStorage.getItem('jn_department') || 'Municipal Administration';

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Role details mapping
  const roleDisplayNames = {
    citizen: tLabel('Citizen', 'பொதுமக்கள்'),
    vao: tLabel('Village Administrative Officer (VAO)', 'கிராம நிர்வாக அலுவலர்'),
    ward_officer: tLabel('Ward Officer', 'வார்டு அதிகாரி'),
    bdo: tLabel('Block Development Officer (BDO)', 'வட்டார வளர்ச்சி அலுவலர்'),
    dro: tLabel('District Revenue Officer (DRO)', 'மாவட்ட வருவாய் அலுவலர்'),
    mla: tLabel('Member of Legislative Assembly (MLA)', 'சட்டமன்ற உறுப்பினர் (MLA)'),
    collector: tLabel('District Collector', 'மாவட்ட ஆட்சியர்'),
    dept_secretary: tLabel('Department Secretary', 'துறைச் செயலாளர்'),
    minister: tLabel('Cabinet Minister', 'அமைச்சர்'),
    cm: tLabel('Chief Minister (CM)', 'முதலமைச்சர்')
  };

  const getJurisdictionLabel = () => {
    switch (role) {
      case 'citizen':
        return `${tLabel('Ward', 'வார்டு')} ${ward}, ${district}`;
      case 'vao':
        return `${tLabel('Village', 'கிராமம்')} ${ward || 'Velachery'}, ${district}`;
      case 'ward_officer':
        return `${tLabel('Ward', 'வார்டு')} ${ward}, ${district}`;
      case 'bdo':
        return `${tLabel('Taluk', 'வட்டம்')} Velachery, ${district}`;
      case 'dro':
        return `${tLabel('Revenue Division', 'வருவாய் பிரிவு')}, ${district}`;
      case 'mla':
        return `${tLabel('Constituency', 'தொகுதி')} ${constituency}, ${district}`;
      case 'collector':
        return `${district} ${tLabel('District', 'மாவட்டம்')}`;
      case 'dept_secretary':
        return `${department} ${tLabel('Department', 'துறை')}`;
      case 'minister':
        return `${department} ${tLabel('Portfolio', 'பொறுப்பு')}`;
      case 'cm':
        return tLabel('Tamil Nadu State', 'தமிழ்நாடு மாநிலம்');
      default:
        return district;
    }
  };

  const toggleLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('jn_lng', lng);
    toast.success(lng === 'en' ? 'Switched to English' : 'தமிழுக்கு மாற்றப்பட்டது');
  };

  const handleElderlyToggle = () => {
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

  return (
    <div className="w-full pb-24 select-none">
      {/* ══ PAGE HEADER ══ */}
      <div className="bg-white sticky top-0 z-50 border-b border-[#DDE1E7] shrink-0">
        <div className="h-14 px-4 flex justify-between items-center w-full">
          <button
            onClick={() => navigate(`/${role.replace('_', '-')}`)}
            className="w-11 h-11 flex items-center justify-start text-[#8B1A1A] cursor-pointer"
            style={{ minWidth: '44px', minHeight: '44px' }}
            title={tLabel("Back to Dashboard", "கட்டுப்பாட்டு அறைக்குத் திரும்பு")}
          >
            <ArrowLeft className="w-6 h-6 text-[#8B1A1A]" />
          </button>

          <h2 className="text-base font-black text-slate-800 tracking-wide">
            {tLabel("Profile & Settings", "சுயவிவரம் & அமைப்புகள்")}
          </h2>

          <div className="w-11 h-11"></div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
      {/* Top Centered Section */}
      <div className="flex flex-col items-center text-center space-y-3">
        {/* Avatar */}
        <div className="w-[72px] h-[72px] rounded-full bg-[#8B1A1A] text-white flex items-center justify-center font-extrabold text-[28px] shadow-md border-2 border-white/20 select-none">
          {initials}
        </div>
        {/* Name */}
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
          {name}
        </h2>
        {/* Role badge */}
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase bg-red-50 dark:bg-rose-950/20 text-[#8B1A1A] dark:text-rose-400 border border-[#8B1A1A]/10 select-none">
          {roleDisplayNames[role] || role}
        </span>
        {/* Jurisdiction */}
        <span className="text-[13px] text-slate-500 dark:text-slate-400 font-bold">
          {getJurisdictionLabel()}
        </span>
      </div>

      {/* Settings List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm overflow-hidden select-none">
        
        {/* Row: Language Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
              {tLabel('App Language', 'பயன்பாட்டு மொழி')}
            </span>
            <span className="text-[11px] text-slate-400 font-bold">
              {tLabel('Select translation', 'மொழியை தேர்வு செய்')}
            </span>
          </div>
          <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
            <button
              onClick={() => toggleLanguage('en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                !isTa
                  ? 'bg-[#8B1A1A] text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => toggleLanguage('ta')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                isTa
                  ? 'bg-[#8B1A1A] text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              தமிழ்
            </button>
          </div>
        </div>

        {/* Row: Elderly Mode */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
              {tLabel('Elderly Mode (A+)', 'முதியோர் பயன்முறை (A+)')}
            </span>
            <span className="text-[11px] text-slate-400 font-bold">
              {tLabel('Larger text & high contrast', 'பெரிய உரை & அதிக மாறுபாடு')}
            </span>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={elderlyMode}
              onChange={handleElderlyToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B1A1A]"></div>
          </label>
        </div>

        {/* Row: Location Settings */}
        <button
          onClick={() => navigate(`/${role.replace('_', '-')}/profile/location`)}
          className="w-full flex items-center justify-between p-4 text-left border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
        >
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
              {tLabel('Location Settings', 'இருப்பிட அமைப்புகள்')}
            </span>
            <span className="text-[11px] text-slate-400 font-bold">
              {tLabel('Update current living address', 'வசிப்பிட முகவரியை மாற்று')}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Info Rows */}
        <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 space-y-2 border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold">{tLabel('App Version', 'பயன்பாட்டு பதிப்பு')}</span>
            <span className="text-slate-600 dark:text-slate-300 font-extrabold">JanaNayagam v1.0</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold">{tLabel('Built by', 'தயாரிப்பு')}</span>
            <span className="text-slate-600 dark:text-slate-300 font-extrabold">{tLabel('Tamil Nadu Government', 'தமிழ்நாடு அரசு')}</span>
          </div>
        </div>

        {/* Logout Row */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 text-center text-sm font-black text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{tLabel('Logout Session', 'அமர்விலிருந்து வெளியேறு')}</span>
        </button>

      </div>
      </div>
    </div>
  );
}
