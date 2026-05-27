import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, Landmark, AlertTriangle, Users, Star, Flame, CheckCircle, Clock, Map
} from 'lucide-react';
import StatCard from '../../shared/components/StatCard';
import TnMap from '../../shared/components/TnMap';
import TableSkeleton from '../../shared/components/TableSkeleton';
import ErrorBoundary from '../../shared/components/ErrorBoundary';

export default function MinisterDashboard({ deptView = false }) {
  const { t, i18n } = useTranslation();
  const [tickets, setTickets] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [selectedDept, setSelectedDept] = useState('roads');
  const [activeTab, setActiveTab] = useState('grid'); // 'grid' or 'map'
  const [loadingTable, setLoadingTable] = useState(true);

  const districtsList = [
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 
    'Kallakurichi', 'Kancheepuram', 'Kanniyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai', 
    'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 
    'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 
    'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'
  ];

  const fetchState = () => {
    const list = JSON.parse(localStorage.getItem('jn_tickets') || '[]');
    setTickets(list);

    const escList = JSON.parse(localStorage.getItem('jn_minister_escalations') || '[]');
    setEscalations(escList);
  };

  useEffect(() => {
    fetchState();

    const timer = setTimeout(() => {
      setLoadingTable(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const activeTickets = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed');
  const openInDept = activeTickets.filter(t => t.category.toLowerCase() === selectedDept).length;
  
  // Calculate dynamic stats
  const totalDeptOpen = openInDept + 78; // Mock baseline offset
  const overdueCount = activeTickets.filter(t => {
    return t.category.toLowerCase() === selectedDept && t.sla_deadline && new Date() > new Date(t.sla_deadline);
  }).length + 15;

  const criticalCount = activeTickets.filter(t => t.category.toLowerCase() === selectedDept && t.priority === 'critical').length + 8;
  const resolvedCount = tickets.filter(t => t.category.toLowerCase() === selectedDept && t.status === 'resolved').length + 245;
  const activeDirectives = activeTickets.filter(t => t.category.toLowerCase() === selectedDept && t.collector_directive).length + 4;
  const escalatedToCm = JSON.parse(localStorage.getItem('jn_cm_escalations') || '[]').length + 2;

  // Compute 38 Districts Colored Grid Map data
  const districtGrid = districtsList.map(dist => {
    const dynamicCount = activeTickets.filter(ticket => {
      return ticket.district === dist && ticket.category.toLowerCase() === selectedDept;
    }).length;

    // Stable mock baseline count per district based on hash
    const hash = dist.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const mockBaseline = (hash % 22) + 1; // 1 to 22 complaints
    const totalCount = mockBaseline + dynamicCount;

    // Grid color determination
    // Green <= 5, Yellow 6-15, Red > 15
    let colorClass = 'bg-emerald-500 border-emerald-600 text-emerald-100 hover:bg-emerald-600';
    let statusLabel = 'Low Pressure';
    if (totalCount > 15) {
      colorClass = 'bg-rose-500 border-rose-600 text-rose-100 hover:bg-rose-600';
      statusLabel = 'Critical Failure';
    } else if (totalCount > 5) {
      colorClass = 'bg-amber-500 border-amber-600 text-amber-100 hover:bg-amber-600';
      statusLabel = 'Moderate Pressure';
    }

    return {
      name: dist,
      count: totalCount,
      colorClass,
      statusLabel
    };
  });

  const headingText = t('app_name') === 'ஜனநாயகம்'
    ? 'மாநில அமைச்சர் தளம்'
    : 'State Minister Portfolio Dashboard';

  const departments = ['roads', 'water', 'electricity', 'health', 'education', 'agriculture', 'revenue', 'welfare'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Cabinet Header Banner */}
      <div className="bg-gradient-to-r from-[#003366] to-[#9a0002] rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
        <span className="text-[9px] font-black uppercase tracking-widest bg-white/15 px-2.5 py-1 rounded border border-white/20">
          State Cabinet Minister • Policy Execution Control
        </span>
        <h2 className="text-2xl font-black mt-3">
          {headingText}
        </h2>
        <p className="text-xs text-rose-100 font-bold uppercase tracking-wider mt-1 opacity-90">
          Statewide Grievance Analytics & District Map Control
        </p>
      </div>

      {/* Portfolio Selector Toggler */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">
          Active Department Portfolio Portfolio
        </span>
        <div className="flex gap-2 overflow-x-auto p-1 hide-scrollbar bg-slate-100 dark:bg-slate-850 rounded-2xl border">
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-4 py-2 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                selectedDept === dept
                  ? 'bg-[#9a0002] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t(`categories.${dept}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Selection */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-sm max-w-sm">
        <button
          onClick={() => setActiveTab('grid')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-center ${
            activeTab === 'grid'
              ? 'bg-[#9a0002] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-[#9a0002]'
          }`}
        >
          {t('app_name') === 'ஜனநாயகம்' ? 'கிரிட் காட்சி' : 'Grid View'}
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'map'
              ? 'bg-[#9a0002] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-[#9a0002]'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>{t('app_name') === 'ஜனநாயகம்' ? 'வரைபடம்' : 'Map View'}</span>
        </button>
      </div>

      {activeTab === 'grid' ? (
        <>
          {/* 6 Department Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard 
          label="Total statewide open"
          value={totalDeptOpen}
          icon={<AlertTriangle className="text-[#003366] w-4.5 h-4.5" />}
          color="blue"
        />
        <StatCard 
          label="Overdue SLA"
          value={overdueCount}
          icon={<Clock className="text-rose-500 w-4.5 h-4.5" />}
          color="red"
        />
        <StatCard 
          label="Critical Priority"
          value={criticalCount}
          icon={<ShieldAlert className="text-amber-500 w-4.5 h-4.5" />}
          color="orange"
        />
        <StatCard 
          label="Statewide Resolved"
          value={resolvedCount}
          icon={<CheckCircle className="text-emerald-500 w-4.5 h-4.5" />}
          color="green"
        />
        <StatCard 
          label="Active Directives"
          value={activeDirectives}
          icon={<Landmark className="text-slate-500 w-4.5 h-4.5" />}
          color="slate"
        />
        <StatCard 
          label="CM Escalated"
          value={escalatedToCm}
          icon={<Flame className="text-indigo-500 w-4.5 h-4.5" />}
          color="indigo"
        />
      </div>

      {/* Statewide Interactive 38-Districts Grid Map */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3 pl-1">
          <div className="flex items-center gap-2 text-[#9a0002] dark:text-rose-400">
            <Landmark className="w-5 h-5" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Tamil Nadu 38-Districts Grievance Index Map
            </h3>
          </div>
          
          {/* Map Color Legend */}
          <div className="flex items-center gap-3 text-[9px] font-black uppercase text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded"></span> Low (&le;5)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded"></span> Moderate (6-15)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded"></span> Critical (&gt;15)
            </span>
          </div>
        </div>

        {/* 38 districts color grid representation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-2">
          {districtGrid.map(dist => (
            <div
              key={dist.name}
              className={`p-3 border rounded-2xl flex flex-col justify-between h-20 transition-all duration-300 shadow-sm cursor-help ${dist.colorClass}`}
              title={`${dist.name} District - ${dist.statusLabel}`}
            >
              <span className="text-[10px] font-black uppercase tracking-wider truncate">
                {dist.name}
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-base font-black font-mono leading-none">{dist.count}</span>
                <span className="text-[7.5px] font-bold uppercase tracking-widest opacity-80 leading-none">Open</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Escalation Inbox from Department Secretary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2 pl-1">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
          Secretary Cabinet Escalations Queue ({escalations.length})
        </h4>

        {loadingTable ? (
          <TableSkeleton rows={3} cols={4} />
        ) : escalations.length === 0 ? (
          <div className="text-center py-8 text-slate-400 font-bold text-xs italic">
            No pending Secretary escalations in ministry queue
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Escalation ID</th>
                  <th className="px-4 py-3">Urgency Classification</th>
                  <th className="px-4 py-3">Secretary Summary</th>
                  <th className="px-5 py-3">Timeline Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-bold text-slate-700 dark:text-slate-350">
                {escalations.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="px-5 py-4 font-mono text-[#9a0002]">#{row.id}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase ${
                        row.urgency === 'Emergency' ? 'bg-rose-100 text-rose-700' :
                        row.urgency === 'Urgent' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800'
                      }`}>
                        {row.urgency}
                      </span>
                    </td>
                    <td className="px-4 py-4 max-w-[200px] truncate font-medium text-slate-600 dark:text-slate-450">
                      {row.summary}
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-400">
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            <h3 className="text-lg font-black text-[#9a0002] dark:text-rose-400 uppercase tracking-wide">
              {t('app_name') === 'ஜனநாயகம்' ? 'மாநில அமைச்சர் துறை வரைபடம்' : 'State Minister Portfolio Map'}
            </h3>
            <p className="text-xs text-slate-500">
              {t('app_name') === 'ஜனநாயகம்' ? 'மாநில அளவிலான துறை வாரியாக குறைதீர்க்கும் எண்ணிக்கையை கண்காணிக்கவும்' : `Statewide district distribution for ${t(`categories.${selectedDept}`)} portfolio`}
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
