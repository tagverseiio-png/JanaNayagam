import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, CheckCircle, Flame, Clock, MapPin, Landmark, ArrowRight, ShieldAlert, ChevronDown, ChevronUp, Users, Map
} from 'lucide-react';
import StatCard from '../../shared/components/StatCard';
import TicketCard from '../../shared/components/TicketCard';
import TnMap from '../../shared/components/TnMap';
import TableSkeleton from '../../shared/components/TableSkeleton';
import ErrorBoundary from '../../shared/components/ErrorBoundary';

export default function CollectorDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' or 'map'
  const [loadingTable, setLoadingTable] = useState(true);
  
  // Sorting and expanding table states
  const [sortField, setSortField] = useState('open');
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedTaluk, setExpandedTaluk] = useState(null);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('jn_tickets') || '[]');
    setTickets(list);

    const timer = setTimeout(() => {
      setLoadingTable(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const now = new Date();
  const activeTickets = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed');
  
  // Calculate dynamic stats
  const totalOpen = activeTickets.length;
  const criticalCount = activeTickets.filter(t => t.priority === 'critical').length;
  
  // SLA Breach Calculation
  const breachedTickets = activeTickets.filter(t => {
    if (!t.sla_deadline) return false;
    return now > new Date(t.sla_deadline);
  });
  const breachRate = totalOpen > 0 ? Math.round((breachedTickets.length / totalOpen) * 100) : 0;
  
  const escalatedToState = tickets.filter(t => t.flagged_state === true).length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;

  // Mock initial taluk configuration that integrates dynamic counts
  const baseTaluks = [
    { 
      id: 'velachery', 
      name: 'Velachery', 
      bdo: 'K. Srinivasan', 
      openOffset: 4, 
      resolvedOffset: 45, 
      breachOffset: 12, 
      avgDays: 5,
      wards: [
        { name: 'Ward 140', open: 2, resolved: 12, officer: 'Suresh M.' },
        { name: 'Ward 141', open: 1, resolved: 14, officer: 'Anitha K.' },
        { name: 'Ward 142', open: 1, resolved: 10, officer: 'Karthik Raj S.' },
        { name: 'Ward 143', open: 0, resolved: 9, officer: 'Ramya V.' }
      ]
    },
    { 
      id: 'sholinganallur', 
      name: 'Sholinganallur', 
      bdo: 'M. Senthil Kumar', 
      openOffset: 8, 
      resolvedOffset: 52, 
      breachOffset: 25, 
      avgDays: 8,
      wards: [
        { name: 'Ward 144', open: 3, resolved: 18, officer: 'Selvam P.' },
        { name: 'Ward 145', open: 2, resolved: 14, officer: 'Divya N.' },
        { name: 'Ward 146', open: 2, resolved: 11, officer: 'Manoj S.' },
        { name: 'Ward 147', open: 1, resolved: 9, officer: 'Priya R.' }
      ]
    },
    { 
      id: 'guindy', 
      name: 'Guindy', 
      bdo: 'R. Anbarasan', 
      openOffset: 2, 
      resolvedOffset: 34, 
      breachOffset: 8, 
      avgDays: 4,
      wards: [
        { name: 'Ward 130', open: 1, resolved: 20, officer: 'Naveen Kumar' },
        { name: 'Ward 131', open: 1, resolved: 14, officer: 'Vimala Devi' }
      ]
    },
    { 
      id: 'mylapore', 
      name: 'Mylapore', 
      bdo: 'S. Rajasekaran', 
      openOffset: 3, 
      resolvedOffset: 41, 
      breachOffset: 15, 
      avgDays: 6,
      wards: [
        { name: 'Ward 120', open: 2, resolved: 22, officer: 'Ganesh P.' },
        { name: 'Ward 121', open: 1, resolved: 19, officer: 'Subha S.' }
      ]
    }
  ];

  // Calculate stats for table dynamically using base mocks + localStorage data
  const talukTableData = baseTaluks.map(t => {
    // Dynamically query tickets assigned to this taluk or matching ward ids
    const activeInTaluk = activeTickets.filter(ticket => {
      if (ticket.taluk === t.name) return true;
      if (t.id === 'velachery') return ticket.ward >= 140 && ticket.ward <= 143;
      if (t.id === 'sholinganallur') return ticket.ward >= 144 && ticket.ward <= 147;
      return false;
    }).length;

    const resolvedInTaluk = tickets.filter(ticket => {
      if (ticket.status !== 'resolved' && ticket.status !== 'closed') return false;
      if (ticket.taluk === t.name) return true;
      if (t.id === 'velachery') return ticket.ward >= 140 && ticket.ward <= 143;
      if (t.id === 'sholinganallur') return ticket.ward >= 144 && ticket.ward <= 147;
      return false;
    }).length;

    const openCount = t.openOffset + activeInTaluk;
    const resolvedCount = t.resolvedOffset + resolvedInTaluk;
    const breachPercent = t.breachOffset; // Keep base baseline

    return {
      ...t,
      open: openCount,
      resolved: resolvedCount,
      breach: breachPercent
    };
  });

  // Table Sort logic
  const sortedTalukData = [...talukTableData].sort((a, b) => {
    let fieldA = a[sortField];
    let fieldB = b[sortField];
    
    if (typeof fieldA === 'string') {
      fieldA = fieldA.toLowerCase();
      fieldB = fieldB.toLowerCase();
    }

    if (fieldA < fieldB) return sortAsc ? -1 : 1;
    if (fieldA > fieldB) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const toggleTalukExpand = (talukId) => {
    if (expandedTaluk === talukId) {
      setExpandedTaluk(null);
    } else {
      setExpandedTaluk(talukId);
    }
  };

  // Critical Escalations Feed: Filter flagged collector or critical
  const escalationsFeed = activeTickets.filter(ticket => {
    return ticket.priority === 'critical' || ticket.flagged_collector === true;
  }).slice(0, 5);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* IAS emblem header banner */}
      <div className="bg-gradient-to-r from-[#003366] to-[#0055aa] rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
        <span className="text-[9px] font-black uppercase tracking-widest bg-white/15 px-2.5 py-1 rounded border border-white/20">
          Chennai District Grievance Monitoring Control
        </span>
        <h2 className="text-2xl font-black mt-3">
          {t('app_name') === 'ஜனநாயகம்' ? 'மாவட்ட ஆட்சியர் டாஷ்போர்டு' : 'District Collector Command Dashboard'}
        </h2>
        <p className="text-xs text-sky-100 font-bold uppercase tracking-wider mt-1 opacity-90">
          Supervise regional municipal administration, budget approvals, and civic systems
        </p>
      </div>

      {/* Tab Selection */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-sm max-w-sm">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-center ${
            activeTab === 'summary'
              ? 'bg-[#003366] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          {t('app_name') === 'ஜனநாயகம்' ? 'சுருக்கம்' : 'Summary View'}
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5 ${
            activeTab === 'map'
              ? 'bg-[#003366] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>{t('app_name') === 'ஜனநாயகம்' ? 'வரைபடம்' : 'Map View'}</span>
        </button>
      </div>

      {activeTab === 'summary' ? (
        <>
          {/* 5 KPI Stat Cards */}
      <div className="stat-grid-5">
        <StatCard 
          label={t('district_open')}
          value={totalOpen}
          icon={<AlertTriangle className="text-[#003366] w-4.5 h-4.5" />}
          color="blue"
        />
        <StatCard 
          label={t('critical_tickets')}
          value={criticalCount}
          icon={<ShieldAlert className="text-rose-500 w-4.5 h-4.5" />}
          color="red"
        />
        <StatCard 
          label={t('sla_breach_rate')}
          value={`${breachRate}%`}
          icon={<Clock className="text-amber-500 w-4.5 h-4.5" />}
          color="orange"
        />
        <StatCard 
          label={t('escalated_state')}
          value={escalatedToState}
          icon={<Flame className="text-indigo-500 w-4.5 h-4.5" />}
          color="slate"
        />
        <StatCard 
          label={t('resolved_month')}
          value={resolvedCount}
          icon={<CheckCircle className="text-emerald-500 w-4.5 h-4.5" />}
          color="green"
        />
      </div>

      {/* Taluk Performance Interactive & Collapsible Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 text-[#003366] dark:text-sky-400">
          <Landmark className="w-5 h-5" />
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">
            Taluk Administration Performance Index
          </h3>
        </div>

        {loadingTable ? (
          <TableSkeleton rows={4} cols={6} />
        ) : (
          <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-wider select-none">
                <th onClick={() => handleSort('name')} className="px-5 py-3.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center gap-1">
                    <span>Taluk</span>
                    {sortField === 'name' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th onClick={() => handleSort('bdo')} className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center gap-1">
                    <span>BDO In-Charge</span>
                    {sortField === 'bdo' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th onClick={() => handleSort('open')} className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center gap-1">
                    <span>Open Tickets</span>
                    {sortField === 'open' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th onClick={() => handleSort('resolved')} className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center gap-1">
                    <span>Resolved</span>
                    {sortField === 'resolved' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th onClick={() => handleSort('breach')} className="px-4 py-3.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center gap-1">
                    <span>SLA Breach %</span>
                    {sortField === 'breach' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
                <th onClick={() => handleSort('avgDays')} className="px-5 py-3.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center gap-1">
                    <span>Avg Resolution</span>
                    {sortField === 'avgDays' && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
              {sortedTalukData.map(row => {
                const isExpanded = expandedTaluk === row.id;
                return (
                  <React.Fragment key={row.id}>
                    <tr 
                      onClick={() => toggleTalukExpand(row.id)}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/10 cursor-pointer transition-colors ${
                        isExpanded ? 'bg-sky-50/50 dark:bg-sky-950/10' : ''
                      }`}
                    >
                      <td className="px-5 py-4 flex items-center gap-2">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-[#003366]" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        <span className="font-extrabold text-slate-800 dark:text-slate-100">{row.name} Taluk</span>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-500">{row.bdo}</td>
                      <td className="px-4 py-4 text-rose-600 font-mono">{row.open} active</td>
                      <td className="px-4 py-4 text-emerald-600 font-mono">{row.resolved} items</td>
                      <td className="px-4 py-4 font-mono text-amber-600">{row.breach}%</td>
                      <td className="px-5 py-4 font-mono">{row.avgDays} days</td>
                    </tr>
                    
                    {/* Collapsible Ward Breakdown */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="bg-slate-50 dark:bg-slate-900/60 p-4 border-l-4 border-l-[#003366]">
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-3 pl-4"
                          >
                            <span className="text-[10px] font-black text-[#003366] uppercase tracking-widest block mb-2">
                              {row.name} Ward Level Performance Breakdown
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {row.wards.map(ward => (
                                <div key={ward.name} className="bg-white dark:bg-slate-850 p-3 rounded-xl border flex items-center justify-between shadow-sm">
                                  <div>
                                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">{ward.name}</span>
                                    <span className="text-[10px] font-medium text-slate-400">Officer: {ward.officer}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xs font-extrabold text-rose-600 block">{ward.open} open</span>
                                    <span className="text-[9px] font-mono text-emerald-600 font-bold">{ward.resolved} resolved</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Critical Escalations inbox */}
      <div className="space-y-3">
        <div className="flex justify-between items-center pl-1">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
            Collector Critical Escalations Feed
          </h3>
          <button 
            onClick={() => navigate('/collector/tickets')}
            className="text-[10px] font-black uppercase text-[#003366] hover:text-[#FF6600] transition-colors"
          >
            Manage Grid
          </button>
        </div>

        {escalationsFeed.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 font-bold">
            No critical escalations in Collector's queue
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {escalationsFeed.map(ticket => (
              <div key={ticket.id} className="relative">
                {ticket.flagged_collector && (
                  <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider animate-pulse">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>DRO Flagged</span>
                  </div>
                )}
                <TicketCard 
                  ticket={ticket}
                  role="collector"
                  onAction={(id, action) => {
                    if (action === 'view') {
                      navigate('/collector/tickets');
                    }
                  }}
                />
              </div>
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
            <h3 className="text-lg font-black text-[#003366] dark:text-sky-400 uppercase tracking-wide">
              {t('app_name') === 'ஜனநாயகம்' ? 'சென்னை மாவட்ட குறைதீர்க்கும் வரைபடம்' : 'Chennai District Grievance Map'}
            </h3>
            <p className="text-xs text-slate-500">
              {t('app_name') === 'ஜனநாயகம்' ? 'செயலில் உள்ள தாலுகா வார்டு மற்றும் குறைதீர்க்கும் எண்ணிக்கையை கண்காணிக்கவும்' : 'Supervise regional taluk ticket distribution and active pressure indicators'}
            </p>
          </div>
          <ErrorBoundary>
            <TnMap lang={i18n.language} citizenMode={true} zoom={9} />
          </ErrorBoundary>
        </motion.div>
      )}
    </motion.div>
  );
}
