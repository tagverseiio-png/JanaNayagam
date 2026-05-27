import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Smartphone, Clock } from 'lucide-react';
import StatCard from '../../shared/components/StatCard';
import StatusBadge from '../../shared/components/StatusBadge';
import CategoryIcon from '../../shared/components/CategoryIcon';

export default function VaoDashboard() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('jn_tickets') || '[]');
    setTickets(list);
  }, []);

  // Compute stats
  const openCount = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const raisedTodayCount = tickets.filter(t => t.raised_by === 'VAO' && t.created_at.startsWith(todayStr)).length;
  
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;

  // Filter/Sort recent tickets
  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const formatSla = (sla_deadline) => {
    if (!sla_deadline) return '-';
    const diff = new Date(sla_deadline) - new Date();
    if (diff <= 0) return t('breached');
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    return `${hrs}h left`;
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
          VAO Grievance Dashboard
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">
          Ward 142 Administrative Center
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard 
          label="Village Open Tickets"
          value={openCount}
          icon={<AlertTriangle className="w-5 h-5 text-blue-600" />}
          color="blue"
        />
        <StatCard 
          label="Raised by VAO Today"
          value={raisedTodayCount}
          icon={<Smartphone className="w-5 h-5 text-amber-500" />}
          color="orange"
        />
        <StatCard 
          label="Resolved This Week"
          value={resolvedCount}
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
          color="green"
        />
      </div>

      {/* Recent Tickets Compact Table */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">
          Recent Grievance Queue
        </h3>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-4">ID</th>
                  <th className="px-4 py-4">Category</th>
                  <th className="px-4 py-4">Citizen Name</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-5 py-4">SLA Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-bold text-slate-700 dark:text-slate-300">
                {recentTickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400 font-medium italic">
                      No active tickets in queue
                    </td>
                  </tr>
                ) : (
                  recentTickets.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-5 py-4 font-mono text-[#9a0002] dark:text-rose-400">
                        #{ticket.id}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <CategoryIcon category={ticket.category} />
                          <span className="uppercase tracking-wide">
                            {t(`categories.${ticket.category.toLowerCase()}`)}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {ticket.citizen_name || 'Anonymous'}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-slate-500 font-medium">
                        {formatSla(ticket.sla_deadline)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
