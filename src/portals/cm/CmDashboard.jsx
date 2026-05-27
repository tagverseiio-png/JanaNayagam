import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Landmark, AlertTriangle, Users, Star, Flame, CheckCircle, Clock, MapPin, X, ArrowRight, ShieldCheck, Map
} from 'lucide-react';
import StatCard from '../../shared/components/StatCard';
import TicketCard from '../../shared/components/TicketCard';
import TnMap from '../../shared/components/TnMap';
import ErrorBoundary from '../../shared/components/ErrorBoundary';

export default function CmDashboard({ overviewMode = false }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null); // Sidebar slide-over panel
  const [cmEscalations, setCmEscalations] = useState([]);
  const [ministerEscalations, setMinisterEscalations] = useState([]);
  const [activeTab, setActiveTab] = useState('grid'); // 'grid' or 'map'

  const districtsList = [
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 
    'Kallakurichi', 'Kancheepuram', 'Kanniyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai', 
    'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 
    'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 
    'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'
  ];

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('jn_tickets') || '[]');
    setTickets(list);

    const cmEsc = JSON.parse(localStorage.getItem('jn_cm_escalations') || '[]');
    setCmEscalations(cmEsc);

    const minEsc = JSON.parse(localStorage.getItem('jn_minister_escalations') || '[]');
    setMinisterEscalations(minEsc);
  }, []);

  const now = new Date();
  const activeTickets = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed');
  
  // 6 State KPIs
  const totalOpenStatewide = activeTickets.length + 342; // Mock state baseline
  const criticalTickets = activeTickets.filter(t => t.priority === 'critical').length + 24;
  
  // Districts with SLA breach
  const breachedDistrictsCount = 14; // Mock baseline breach locations
  const resolvedThisMonth = tickets.filter(t => t.status === 'resolved').length + 1856;
  const escalationsPending = cmEscalations.length + ministerEscalations.length + 5;
  const deptsWithIssuesCount = 8; // All core sectors

  // Compute 38 Districts Grid Map data
  // Green = <10 open, Yellow = 10-50 open, Red = >50 open
  const districtGridData = districtsList.map(dist => {
    const dynamicCount = activeTickets.filter(t => t.district === dist).length;

    // Stable mock baseline count per district based on hash
    const hash = dist.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const mockBaseline = (hash % 62) + 2; // 2 to 64 complaints
    const totalCount = mockBaseline + dynamicCount;

    let colorClass = '';
    let textClass = '';
    let statusLabel = '';
    
    if (totalCount > 50) {
      colorClass = 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 hover:bg-rose-100';
      textClass = 'text-rose-700 dark:text-rose-400';
      statusLabel = 'Red (Critical)';
    } else if (totalCount >= 10) {
      colorClass = 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 hover:bg-amber-100';
      textClass = 'text-amber-700 dark:text-amber-400';
      statusLabel = 'Yellow (Moderate)';
    } else {
      colorClass = 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-250 dark:border-emerald-900/50 hover:bg-emerald-100';
      textClass = 'text-emerald-700 dark:text-emerald-400';
      statusLabel = 'Green (Healthy)';
    }

    // Mock Taluk Breakdown for sidebar panel
    const taluks = [
      { name: `${dist} North`, open: Math.round(totalCount * 0.4), resolved: Math.round(totalCount * 1.5), avg: (hash % 5) + 3 },
      { name: `${dist} South`, open: Math.round(totalCount * 0.6), resolved: Math.round(totalCount * 1.2), avg: (hash % 8) + 4 }
    ];

    return {
      name: dist,
      count: totalCount,
      colorClass,
      textClass,
      statusLabel,
      taluks
    };
  });

  // 5 Sample Critical Escalation Tickets from different districts/departments
  const sampleEscalations = activeTickets.filter(t => {
    return t.priority === 'critical' || t.status === 'escalated';
  }).slice(0, 5);

  const headingText = t('app_name') === 'ஜனநாயகம்'
    ? 'மாண்புமிகு முதலமைச்சர் கட்டுப்பாட்டு தளம்'
    : 'Hon’ble Chief Minister’s Command Center';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12 relative"
    >
      {/* Official Saffron & Green CM Header */}
      <div className="bg-white dark:bg-slate-900 border-l-8 border-l-[#FF6600] border-t-4 border-t-[#138808] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full blur-xl opacity-20"></div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#003366] to-[#0055aa] rounded-full flex items-center justify-center border border-white/20 shadow-md">
            <Landmark className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6600] block">
              Government of Tamil Nadu • Chief Minister's Executive Office
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#003366] dark:text-white mt-1 leading-none">
              {headingText}
            </h1>
          </div>
        </div>
      </div>

      {/* Tab Selection */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-sm max-w-sm">
        <button
          onClick={() => setActiveTab('grid')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-center ${
            activeTab === 'grid'
              ? 'bg-[#003366] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-[#003366]'
          }`}
        >
          {t('app_name') === 'ஜனநாயகம்' ? 'மாநில கட்டளைக் கிரிட்' : 'State Command Grid'}
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'map'
              ? 'bg-[#003366] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-[#003366]'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>{t('app_name') === 'ஜனநாயகம்' ? 'வரைபடம்' : 'Map View'}</span>
        </button>
      </div>

      {activeTab === 'grid' ? (
        <>
          {/* 6 CM Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard 
          label="Statewide Open"
          value={totalOpenStatewide}
          icon={<AlertTriangle className="text-[#003366] w-4.5 h-4.5" />}
          color="blue"
        />
        <StatCard 
          label="Critical Priority"
          value={criticalTickets}
          icon={<ShieldAlert className="text-rose-500 w-4.5 h-4.5" />}
          color="red"
        />
        <StatCard 
          label="Breach Districts"
          value={breachedDistrictsCount}
          icon={<Clock className="text-amber-500 w-4.5 h-4.5" />}
          color="orange"
        />
        <StatCard 
          label="Resolved Month"
          value={resolvedThisMonth}
          icon={<CheckCircle className="text-emerald-500 w-4.5 h-4.5" />}
          color="green"
        />
        <StatCard 
          label="CM Escalations"
          value={escalationsPending}
          icon={<Flame className="text-indigo-500 w-4.5 h-4.5" />}
          color="indigo"
        />
        <StatCard 
          label="Active Sectors"
          value={deptsWithIssuesCount}
          icon={<Users className="text-slate-500 w-4.5 h-4.5" />}
          color="slate"
        />
      </div>

      {/* 38 Districts Grid command dashboard */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b pb-3 pl-1">
          <div className="flex items-center gap-2 text-[#003366]">
            <MapPin className="w-5 h-5" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Tamil Nadu 38-Districts Grid Overview
            </h3>
          </div>
          
          {/* Map Color Legend */}
          <div className="flex items-center gap-3 text-[9px] font-black uppercase text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-emerald-100 border border-emerald-400 rounded"></span> Green (&lt;10)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-amber-100 border border-amber-400 rounded"></span> Yellow (10-50)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-rose-100 border border-rose-400 rounded"></span> Red (&gt;50)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
          {districtGridData.map(dist => (
            <div
              key={dist.name}
              onClick={() => setSelectedDistrict(dist)}
              className={`p-3 border rounded-2xl flex flex-col justify-between h-20 transition-all duration-300 shadow-sm cursor-pointer hover:shadow-md ${dist.colorClass}`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider truncate text-slate-800 dark:text-slate-250">
                {dist.name}
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className={`text-base font-black font-mono leading-none ${dist.textClass}`}>{dist.count}</span>
                <span className="text-[7.5px] font-bold uppercase tracking-widest text-slate-400 leading-none">Complaints</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide-Over Sidebar Panel for District Taluk Breakdown */}
      <AnimatePresence>
        {selectedDistrict && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDistrict(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            ></motion.div>

            {/* Slide over sheet */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl p-6 overflow-y-auto border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between"
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center pb-3 border-b">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#FF6600]" />
                    <h4 className="font-black text-[#003366] dark:text-white text-base uppercase">
                      {selectedDistrict.name} District Breakdown
                    </h4>
                  </div>
                  <button 
                    onClick={() => setSelectedDistrict(null)}
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Status KPI summary in panel */}
                <div className="bg-slate-50 dark:bg-slate-950/20 p-4 rounded-2xl border flex justify-between items-center shadow-inner">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">District Index</span>
                    <span className="text-xs font-black block mt-0.5">{selectedDistrict.statusLabel}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Complaints</span>
                    <span className="text-base font-black font-mono text-rose-600 block mt-0.5">{selectedDistrict.count}</span>
                  </div>
                </div>

                {/* Wards list or Taluk breakdown */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">
                    Taluk-Level Administrative Breakdown
                  </span>
                  
                  <div className="space-y-3">
                    {selectedDistrict.taluks.map(taluk => (
                      <div key={taluk.name} className="bg-white dark:bg-slate-850 p-4 border rounded-2xl shadow-sm space-y-2">
                        <div className="flex justify-between items-center border-b pb-2">
                          <span className="text-xs font-black text-slate-850 dark:text-slate-150">{taluk.name} Taluk</span>
                          <span className="text-xs font-black font-mono text-rose-600">{taluk.open} active</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold text-slate-500">
                          <span>Resolved Grid:</span>
                          <span className="font-mono text-emerald-600">{taluk.resolved} resolved</span>
                        </div>
                        <div className="flex justify-between text-[11px] font-bold text-slate-500">
                          <span>Avg Resolution Speed:</span>
                          <span className="font-mono">{taluk.avg} days</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => { setSelectedDistrict(null); navigate('/cm/report'); }}
                className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-[#003366] to-[#0055aa] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md mt-6"
              >
                <span>Generate Cabinet Summary report</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Statewide Priority Escalations Feed */}
      <div className="space-y-3">
        <div className="flex justify-between items-center pl-1">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
            Hon'ble CM Executive Escalation Feed
          </h3>
          <button 
            onClick={() => navigate('/cm/escalations')}
            className="text-[10px] font-black uppercase text-[#003366] hover:text-[#FF6600] transition-colors"
          >
            All CM Escalations
          </button>
        </div>

        {sampleEscalations.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 font-bold">
            No critical statewide escalations in CM queue
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sampleEscalations.map(ticket => (
              <TicketCard 
                key={ticket.id}
                ticket={ticket}
                role="cm"
                onAction={(id, action) => {
                  if (action === 'view') {
                    navigate('/cm/escalations');
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
      </>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full font-sans"
        >
          <div className="mb-4">
            <h3 className="text-lg font-black text-[#003366] dark:text-[#FF6600] uppercase tracking-wide">
              {t('app_name') === 'ஜனநாயகம்' ? 'தமிழ்நாடு 38-மாவட்ட குறைதீர்ப்பு குறியீட்டு வரைபடம்' : 'Tamil Nadu 38-Districts Grievance Index Map'}
            </h3>
            <p className="text-xs text-slate-500">
              {t('app_name') === 'ஜனநாயகம்' ? 'செயலில் உள்ள குறைதீர்க்கும் எண்ணிக்கையை வரைபடத்தில் கண்காணிக்கவும்' : 'Supervise statewide district ticket distribution and active pressure indicators'}
            </p>
          </div>
          <ErrorBoundary>
            <TnMap lang={i18n.language} citizenMode={false} zoom={7} />
          </ErrorBoundary>
        </motion.div>
      )}
    </motion.div>
  );
}
