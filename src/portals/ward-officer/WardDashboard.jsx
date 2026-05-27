import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AlertOctagon, AlertTriangle, CheckCircle2, Flame, Inbox, ShieldAlert } from 'lucide-react';
import StatCard from '../../shared/components/StatCard';
import TicketCard from '../../shared/components/TicketCard';

export default function WardDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('jn_tickets') || '[]');
    setTickets(list);
  }, []);

  // SLA calculations
  const now = new Date();
  
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress');
  const totalOpenCount = openTickets.length;
  
  const overdueCount = openTickets.filter(t => t.sla_deadline && new Date(t.sla_deadline) < now).length;
  
  const resolvedTodayCount = tickets.filter(t => t.status === 'resolved').length;
  const escalatedCount = tickets.filter(t => t.status === 'escalated').length;

  // Priority Inbox: open tickets sorted by SLA urgency (earliest deadline first)
  const priorityTickets = [...openTickets]
    .sort((a, b) => new Date(a.sla_deadline || 0) - new Date(b.sla_deadline || 0))
    .slice(0, 5);

  const getAlertText = () => {
    const isTamil = t('app_name') === 'ஜனநாயகம்';
    if (isTamil) {
      return `${overdueCount} புகார்கள் காலக்கெடு தாண்டியது! உடனே நடவடிக்கை எடுங்கள்.`;
    }
    return `${overdueCount} tickets are overdue! Act now.`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
          Ward Officer Dashboard
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">
          Velachery Ward 142 Control Board
        </p>
      </div>

      {/* Red Alert Banner for Overdue Tickets */}
      {overdueCount > 0 && (
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-500 dark:border-rose-900 rounded-3xl p-5 shadow-[0_4px_15px_rgba(225,29,72,0.1)] flex items-start gap-4"
        >
          <div className="p-2.5 bg-rose-500 text-white rounded-xl shadow-md shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-black text-rose-700 dark:text-rose-400 uppercase tracking-wide">
              Critical Warning
            </h4>
            <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-300 font-extrabold mt-1 leading-relaxed">
              {getAlertText()}
            </p>
          </div>
        </motion.div>
      )}

      {/* KPI Cards Grid */}
      <div className="stat-grid">
        <StatCard 
          label="Total Open"
          value={totalOpenCount}
          icon={<Inbox className="w-5 h-5 text-blue-500" />}
          color="blue"
        />
        <StatCard 
          label="Overdue (SLA Breached)"
          value={overdueCount}
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          color="red"
        />
        <StatCard 
          label="Resolved Today"
          value={resolvedTodayCount}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          color="green"
        />
        <StatCard 
          label="Escalated to BDO"
          value={escalatedCount}
          icon={<Flame className="w-5 h-5 text-amber-500" />}
          color="orange"
        />
      </div>

      {/* Priority Inbox list */}
      <div className="space-y-3">
        <div className="flex justify-between items-center pl-1">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
            Priority Inbox (SLA Urgency)
          </h3>
          <button 
            onClick={() => navigate('/ward-officer/inbox')}
            className="text-[10px] font-black uppercase text-[#003366] hover:text-[#FF6600] transition-colors"
          >
            View Full Inbox
          </button>
        </div>

        {priorityTickets.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 font-bold">
            No pending tickets in queue!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {priorityTickets.map(ticket => {
              // Highlight orange if ticket is older than 20 hours
              const hoursSinceCreation = (new Date() - new Date(ticket.created_at)) / (1000 * 60 * 60);
              const isOld = hoursSinceCreation > 20;

              return (
                <div 
                  key={ticket.id} 
                  className={`rounded-2xl transition-all ${
                    isOld 
                      ? 'p-1.5 bg-amber-50/70 border border-amber-200 dark:bg-amber-950/10 dark:border-amber-900/50 shadow-sm' 
                      : ''
                  }`}
                >
                  <TicketCard 
                    ticket={ticket}
                    role="ward_officer"
                    onAction={(id, action) => {
                      if (action === 'view') {
                        navigate('/ward-officer/inbox');
                      }
                    }}
                  />
                  {isOld && (
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 pl-4 pt-1 block">
                      ⚠️ Warning: Ticket is older than 20 hours!
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
