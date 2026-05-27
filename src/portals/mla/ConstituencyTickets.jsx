import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  FileText, Landmark, Star, MessageSquare, AlertCircle, X, ShieldAlert 
} from 'lucide-react';
import TicketCard from '../../shared/components/TicketCard';
import StatusBadge from '../../shared/components/StatusBadge';
import CategoryIcon from '../../shared/components/CategoryIcon';

export default function ConstituencyTickets() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState([]);
  const [viewType, setViewType] = useState('flat'); // flat, ward, category
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Note modal state
  const [activeTicket, setActiveTicket] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  // Flag to Collector Modal
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');

  const fetchTickets = () => {
    const list = JSON.parse(localStorage.getItem('jn_tickets') || '[]');
    setTickets(list);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSaveTickets = (updated) => {
    localStorage.setItem('jn_tickets', JSON.stringify(updated));
    setTickets(updated);
  };

  // Flag directly to Collector
  const handleFlagSubmit = (e) => {
    e.preventDefault();
    if (!flagReason.trim()) {
      toast.error('Flag reason is required');
      return;
    }

    const updated = tickets.map(t => {
      if (t.id === activeTicket.id) {
        return { 
          ...t, 
          status: 'escalated',
          flagged_collector: true,
          collector_flag_reason: flagReason
        };
      }
      return t;
    });

    handleSaveTickets(updated);
    setFlagModalOpen(false);
    setFlagReason('');
    toast.success('Complaint flagged to District Collector');
  };

  // Save MLA Note
  const handleNoteSubmit = (e) => {
    e.preventDefault();
    if (!noteText.trim()) {
      toast.error('Observation text cannot be empty');
      return;
    }

    const updated = tickets.map(t => {
      if (t.id === activeTicket.id) {
        return { ...t, mla_note: noteText };
      }
      return t;
    });

    handleSaveTickets(updated);
    setNoteModalOpen(false);
    setNoteText('');
    toast.success('Observation note attached successfully');
  };

  // Request Urgent Action (Adds Star Badge)
  const handleRequestUrgent = (ticketId) => {
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        const currentlyUrgent = !!t.mla_flagged;
        return { ...t, mla_flagged: !currentlyUrgent, priority: 'critical' };
      }
      return t;
    });
    handleSaveTickets(updated);
    toast.success('Marked as MLA Urgent Action (Critical Priority)');
  };

  // Restricted buttons check
  const handleActionClick = (ticketId, actionType) => {
    if (actionType === 'view') {
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) setActiveTicket(ticket);
      return;
    }

    if (actionType === 'close' || actionType === 'assign') {
      const isTamil = t('app_name') === 'ஜனநாயகம்';
      const warningText = isTamil
        ? "நியமிக்கப்பட்ட அதிகாரி மட்டுமே இதை மூட முடியும்."
        : "Only the assigned officer can close this ticket.";
      
      toast.warning(warningText, {
        icon: <ShieldAlert className="w-5 h-5 text-rose-500" />
      });
    }
  };

  // Filter logic
  const filtered = tickets.filter(ticket => {
    if (filterCategory !== 'all' && ticket.category.toLowerCase() !== filterCategory) return false;
    
    if (filterStatus !== 'all') {
      if (filterStatus === 'open') return ticket.status === 'open' || ticket.status === 'in_progress';
      if (ticket.status !== filterStatus) return false;
    }
    return true;
  });

  // Groupings implementation
  const getGroupedTickets = () => {
    if (viewType === 'flat') {
      return { 'Flat List': filtered };
    }

    const groups = {};
    filtered.forEach(ticket => {
      let groupKey = '';
      if (viewType === 'ward') {
        groupKey = `Ward ${ticket.ward || 'General'}`;
      } else if (viewType === 'category') {
        groupKey = t(`categories.${ticket.category.toLowerCase()}`).toUpperCase();
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(ticket);
    });

    return groups;
  };

  const grouped = getGroupedTickets();
  const categoryKeys = ['all', 'roads', 'water', 'electricity', 'health', 'education', 'agriculture', 'revenue', 'welfare'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
          Constituency Grievance Queue
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">
          Velachery Legislative Assembly Constituency
        </p>
      </div>

      {/* Filter and View Controls Panels */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        
        {/* Toggle view group */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">
            Group Layout
          </span>
          <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border shadow-inner">
            {[
              { id: 'flat', name: 'Flat List' },
              { id: 'ward', name: 'Group by Ward' },
              { id: 'category', name: 'Group by Category' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setViewType(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  viewType === tab.id
                    ? 'bg-[#1B5E20] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">
              Filter by Sector
            </span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-2 px-3 text-xs font-bold"
            >
              {categoryKeys.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Sectors' : t(`categories.${cat}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">
              Filter by Status
            </span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-2 px-3 text-xs font-bold"
            >
              <option value="all">All Statuses</option>
              <option value="open">Active Open</option>
              <option value="resolved">Resolved</option>
              <option value="escalated">Escalated</option>
            </select>
          </div>
        </div>

      </div>

      {/* Main Groups Render */}
      <div className="space-y-6">
        {Object.keys(grouped).map(groupName => {
          const groupTickets = grouped[groupName];
          return (
            <div key={groupName} className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1 border-l-4 border-l-[#1B5E20] pl-3">
                {groupName} ({groupTickets.length})
              </h3>

              {groupTickets.length === 0 ? (
                <div className="text-center py-6 bg-white dark:bg-slate-900 border rounded-3xl text-slate-400 font-bold text-xs italic">
                  No tickets found in this group
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {groupTickets.map(ticket => (
                    <div 
                      key={ticket.id} 
                      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 relative ${
                        ticket.mla_flagged ? 'border-2 border-rose-500/50 shadow-rose-500/5' : ''
                      }`}
                    >
                      {/* Red Star MLA Flag badge */}
                      {ticket.mla_flagged && (
                        <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-600 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-sm animate-pulse">
                          <Star className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                          <span>Urgent Action</span>
                        </div>
                      )}

                      {/* Ticket Summary Card */}
                      <TicketCard 
                        ticket={ticket}
                        role="mla"
                        onAction={(id, action) => handleActionClick(id, action)}
                      />

                      {/* Observations display if present */}
                      {ticket.mla_note && (
                        <div className="bg-[#1B5E20]/5 border border-[#1B5E20]/15 p-3 rounded-2xl flex gap-2">
                          <MessageSquare className="w-4 h-4 text-[#1B5E20] shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[9px] font-black text-[#1B5E20] uppercase tracking-wider block">MLA Observation note</span>
                            <p className="text-xs text-[#1B5E20] font-medium leading-relaxed mt-0.5">"{ticket.mla_note}"</p>
                          </div>
                        </div>
                      )}

                      {/* Action buttons controls bar */}
                      {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-2">
                          {/* 1. Flag to Collector */}
                          <button
                            onClick={() => { setActiveTicket(ticket); setFlagModalOpen(true); }}
                            className="flex items-center gap-1 text-[10px] font-black uppercase px-3 py-2 rounded-xl bg-slate-800 hover:bg-[#1B5E20] text-white shadow-sm transition-colors"
                          >
                            <span>{t('flag_to_collector')}</span>
                          </button>

                          {/* 2. Add MLA Note */}
                          <button
                            onClick={() => { setActiveTicket(ticket); setNoteModalOpen(true); }}
                            className="flex items-center gap-1 text-[10px] font-black uppercase px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 text-slate-700 dark:text-slate-300 shadow-sm transition-colors"
                          >
                            <span>{t('mla_note')}</span>
                          </button>

                          {/* 3. Request Urgent Action */}
                          <button
                            onClick={() => handleRequestUrgent(ticket.id)}
                            className={`flex items-center gap-1 text-[10px] font-black uppercase px-3 py-2 rounded-xl border shadow-sm transition-all ${
                              ticket.mla_flagged
                                ? 'bg-rose-600 border-rose-500 text-white'
                                : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-600'
                            }`}
                          >
                            <Star className={`w-3 h-3 ${ticket.mla_flagged ? 'fill-white' : ''}`} />
                            <span>{t('urgent_action')}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Flag to Collector */}
      <AnimatePresence>
        {flagModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-black text-[#003366] dark:text-slate-100 text-base uppercase">
                  Flag to District Collector
                </h4>
                <button onClick={() => setFlagModalOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleFlagSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 block">
                    Reason for Direct Collector Intervention
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={flagReason}
                    onChange={(e) => setFlagReason(e.target.value)}
                    placeholder="Provide justification for why this issue requires urgent attention from the District Collector..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF6600] outline-none px-4 py-3 rounded-xl text-slate-800 dark:text-slate-100 text-xs shadow-sm resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-slate-950 hover:bg-[#1B5E20] text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-md"
                >
                  Verify and Flag
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Add MLA Note */}
      <AnimatePresence>
        {noteModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-black text-[#1B5E20] text-base uppercase">
                  Add MLA Observation Note
                </h4>
                <button onClick={() => setNoteModalOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleNoteSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 block">
                    MLA Assessment / Observation
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="This note will be permanently pinned to the ticket and visible to Ward Officers, VAOs, and higher officials..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#1B5E20] outline-none px-4 py-3 rounded-xl text-slate-800 dark:text-slate-100 text-xs shadow-sm resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-md"
                >
                  Save Pinned Note
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Details modal */}
      <AnimatePresence>
        {activeTicket && !noteModalOpen && !flagModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveTicket(null)}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="bg-[#003366] text-white p-5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CategoryIcon category={activeTicket.category} />
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-300">Ticket ID: #{activeTicket.id}</span>
                    <h4 className="text-sm font-black uppercase mt-0.5">
                      {t(`categories.${activeTicket.category.toLowerCase()}`)}
                    </h4>
                  </div>
                </div>
                <button onClick={() => setActiveTicket(null)} className="p-1 rounded-lg hover:bg-white/10 text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div className="flex gap-2.5 items-center">
                  <StatusBadge status={activeTicket.status} />
                  <span className="text-[10.5px] font-bold text-slate-400 font-mono">
                    Date: {new Date(activeTicket.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Observation</h5>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {activeTicket.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                  <div className="bg-slate-50 dark:bg-slate-950/30 border p-3 rounded-xl">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">Ward Assignment</span>
                    <span className="text-slate-800 dark:text-slate-200">Ward {activeTicket.ward}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/30 border p-3 rounded-xl">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">Reporter</span>
                    <span className="text-slate-800 dark:text-slate-200">{activeTicket.citizen_name || 'Anonymous'}</span>
                  </div>
                </div>

                {activeTicket.photo && (
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Evidence Attachment</h5>
                    <div className="w-full h-44 border rounded-xl overflow-hidden shadow-inner">
                      <img src={activeTicket.photo} alt="Evidence" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
