import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, CheckCircle, Flame, Clock, MapPin, Landmark, ArrowRight, ShieldAlert 
} from 'lucide-react';
import StatCard from '../../shared/components/StatCard';
import TicketCard from '../../shared/components/TicketCard';

export default function MlaDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('jn_tickets') || '[]');
    setTickets(list);
  }, []);

  const now = new Date();
  const openWardsTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress');
  
  // Calculate dynamic stats
  const totalOpen = openWardsTickets.length;
  const criticalCount = openWardsTickets.filter(t => t.priority === 'critical').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;
  const escalatedCount = tickets.filter(t => t.status === 'escalated').length;
  
  const pending7DaysCount = openWardsTickets.filter(t => {
    const age = now - new Date(t.created_at);
    return age > 7 * 24 * 60 * 60 * 1000; // > 7 days
  }).length;

  // Priority feed: critical or unresolved > 7 days
  const priorityFeed = openWardsTickets.filter(t => {
    const age = now - new Date(t.created_at);
    return t.priority === 'critical' || age > 7 * 24 * 60 * 60 * 1000;
  }).slice(0, 5);

  const headingText = t('app_name') === 'ஜனநாயகம்'
    ? 'சட்டமன்ற உறுப்பினர் தொகுதி டாஷ்போர்டு'
    : 'MLA Constituency Dashboard';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Government Colored Top Ribbed Greeting */}
      <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
        <span className="text-[9px] font-black uppercase tracking-widest bg-white/15 px-2.5 py-1 rounded border border-white/20">
          Legislative Assembly Representative
        </span>
        <h2 className="text-2xl font-black mt-3">
          {headingText}
        </h2>
        <p className="text-xs text-emerald-100 font-bold uppercase tracking-wider mt-1 opacity-90">
          Velachery Constituency (Wards 140-147)
        </p>
      </div>

      {/* KPI Stats Grid - 5 Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="col-span-1">
          <StatCard 
            label="Total Open"
            value={totalOpen}
            icon={<AlertTriangle className="text-[#1B5E20] w-4.5 h-4.5" />}
            color="blue"
          />
        </div>
        <div className="col-span-1">
          <StatCard 
            label="Critical Issues"
            value={criticalCount}
            icon={<ShieldAlert className="text-rose-500 w-4.5 h-4.5" />}
            color="red"
          />
        </div>
        <div className="col-span-1">
          <StatCard 
            label="Resolved"
            value={resolvedCount}
            icon={<CheckCircle className="text-emerald-500 w-4.5 h-4.5" />}
            color="green"
          />
        </div>
        <div className="col-span-1">
          <StatCard 
            label="Escalated"
            value={escalatedCount}
            icon={<Flame className="text-amber-500 w-4.5 h-4.5" />}
            color="orange"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <StatCard 
            label="Pending > 7 Days"
            value={pending7DaysCount}
            icon={<Clock className="text-slate-500 w-4.5 h-4.5" />}
            color="slate"
          />
        </div>
      </div>

      {/* Constituency Coverage */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 text-[#1B5E20]">
          <Landmark className="w-6 h-6" />
          <h3 className="font-extrabold text-base uppercase tracking-wider text-slate-800 dark:text-slate-100">
            Constituency Jurisdiction
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
          <div className="bg-slate-50 dark:bg-slate-950/20 p-3 rounded-xl border">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-0.5">District</span>
            <span className="text-slate-800 dark:text-slate-200 text-sm">Chennai</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/20 p-3 rounded-xl border">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-0.5">Taluks Included</span>
            <span className="text-slate-800 dark:text-slate-200 text-sm">Velachery, Sholinganallur</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/20 p-3 rounded-xl border col-span-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-0.5">Covered Wards (8)</span>
            <span className="text-[#1B5E20] text-sm">Wards 140, 141, 142, 143, 144, 145, 146, 147</span>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <button 
        onClick={() => navigate('/mla/raise')}
        className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] hover:from-[#003366] hover:to-[#004d99] text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all duration-300"
      >
        <span>{t('raise_issue')}</span>
        <ArrowRight className="w-4.5 h-4.5" />
      </button>

      {/* Priority issues feed */}
      <div className="space-y-3">
        <div className="flex justify-between items-center pl-1">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
            Constituency Priority Feed
          </h3>
          <button 
            onClick={() => navigate('/mla/tickets')}
            className="text-[10px] font-black uppercase text-[#1B5E20] hover:text-[#003366] transition-all"
          >
            All Tickets
          </button>
        </div>

        {priorityFeed.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 font-bold">
            No critical or aged tickets in constituency queue
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {priorityFeed.map(ticket => (
              <TicketCard 
                key={ticket.id}
                ticket={ticket}
                role="mla"
                onAction={(id, action) => {
                  if (action === 'view') {
                    navigate('/mla/tickets');
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

    </motion.div>
  );
}
