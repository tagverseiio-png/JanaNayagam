import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  FileText, Landmark, ShieldAlert, Star, MessageSquare, AlertCircle, X, ShieldCheck, ArrowUpRight, Check
} from 'lucide-react';
import TicketCard from '../../shared/components/TicketCard';
import StatusBadge from '../../shared/components/StatusBadge';
import CategoryIcon from '../../shared/components/CategoryIcon';

export default function DistrictTickets({ escalatedOnly = false }) {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState([]);
  
  // Filters state
  const [filterTaluk, setFilterTaluk] = useState('all');
  const [filterWard, setFilterWard] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Interactive Action Modals
  const [activeTicket, setActiveTicket] = useState(null);
  const [directiveModalOpen, setDirectiveModalOpen] = useState(false);
  const [directiveText, setDirectiveText] = useState('');
  
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);

  const fetchTickets = () => {
    const list = JSON.parse(localStorage.getItem('jn_tickets') || '[]');
    setTickets(list);
  };

  useEffect(() => {
    fetchTickets();
  }, [escalatedOnly]);

  const handleSaveTickets = (updated) => {
    localStorage.setItem('jn_tickets', JSON.stringify(updated));
    setTickets(updated);
  };

  // 1. Add Collector Directive Pinned Note
  const handleDirectiveSubmit = (e) => {
    e.preventDefault();
    if (!directiveText.trim()) {
      toast.error('Directive text is required');
      return;
    }

    const updated = tickets.map(ticket => {
      if (ticket.id === activeTicket.id) {
        return { 
          ...ticket, 
          collector_directive: directiveText,
          collector_directive_at: new Date().toISOString()
        };
      }
      return ticket;
    });

    handleSaveTickets(updated);
    setDirectiveModalOpen(false);
    setDirectiveText('');
    toast.success(t('app_name') === 'ஜனநாயகம்' 
      ? 'கலெக்டர் உத்தரவு வெற்றிகரமாக இணைக்கப்பட்டது' 
      : 'District Collector directive note attached'
    );
  };

  // 2. Reassign Taluk directly
  const handleReassignTaluk = (ticketId, targetTaluk) => {
    const updated = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return { 
          ...ticket, 
          taluk: targetTaluk,
          // Reassign to ward 0 or default to prevent collision
          ward: targetTaluk === 'Velachery' ? '140' : targetTaluk === 'Sholinganallur' ? '144' : 'General'
        };
      }
      return ticket;
    });

    handleSaveTickets(updated);
    toast.success(`Ticket reassigned to ${targetTaluk} Taluk`);
  };

  // 3. Escalate directly to State Secretariat
  const handleEscalateToState = () => {
    const updated = tickets.map(ticket => {
      if (ticket.id === activeTicket.id) {
        return { 
          ...ticket, 
          status: 'escalated',
          flagged_state: true,
          flagged_state_at: new Date().toISOString()
        };
      }
      return ticket;
    });

    handleSaveTickets(updated);
    setEscalateModalOpen(false);
    toast.success(t('app_name') === 'ஜனநாயகம்' 
      ? 'மாநில தலைமைச் செயலகத்திற்கு மேல்முறையீடு செய்யப்பட்டது' 
      : 'Complaint escalated to State Department Secretariat (IAS)'
    );
  };

  // Catch generic actions from TicketCard
  const handleActionClick = (ticketId, actionType) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    if (actionType === 'view') {
      setActiveTicket(ticket);
      return;
    }

    if (actionType === 'escalate') {
      setActiveTicket(ticket);
      setEscalateModalOpen(true);
      return;
    }

    if (actionType === 'close') {
      // Direct Collector complete closure
      const updated = tickets.map(t => {
        if (t.id === ticketId) {
          return { ...t, status: 'closed' };
        }
        return t;
      });
      handleSaveTickets(updated);
      toast.success('Complaint closed directly by District Collector');
    }
  };

  // Filtering Logic
  const filteredTickets = tickets.filter(ticket => {
    // Escalate page check
    if (escalatedOnly && ticket.status !== 'escalated') return false;

    // Taluk filtering
    if (filterTaluk !== 'all') {
      if (filterTaluk === 'Velachery') {
        const inWard = ticket.ward >= 140 && ticket.ward <= 143;
        if (ticket.taluk !== 'Velachery' && !inWard) return false;
      } else if (filterTaluk === 'Sholinganallur') {
        const inWard = ticket.ward >= 144 && ticket.ward <= 147;
        if (ticket.taluk !== 'Sholinganallur' && !inWard) return false;
      } else if (ticket.taluk !== filterTaluk) {
        return false;
      }
    }

    // Ward filtering
    if (filterWard !== 'all' && String(ticket.ward) !== filterWard) return false;

    // Category filtering
    if (filterCategory !== 'all' && ticket.category.toLowerCase() !== filterCategory) return false;

    // Status filtering
    if (filterStatus !== 'all' && ticket.status !== filterStatus) return false;

    // Priority filtering
    if (filterPriority !== 'all' && ticket.priority !== filterPriority) return false;

    return true;
  });

  const categoryKeys = ['roads', 'water', 'electricity', 'sanitation', 'health', 'education', 'agriculture', 'revenue', 'welfare'];
  const talukList = ['Velachery', 'Sholinganallur', 'Guindy', 'Mylapore'];
  const wardList = ['120', '121', '130', '131', '140', '141', '142', '143', '144', '145', '146', '147'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
          {escalatedOnly ? 'District Escalations Panel' : t('district_tickets')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">
          {escalatedOnly ? 'Supervise high-level administrative grid escalations' : 'Interactive district-wide complaints management'}
        </p>
      </div>

      {/* Advanced Filters Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">
          Filter District Grievance Matrix
        </span>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          {/* Taluk */}
          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Taluk</span>
            <select
              value={filterTaluk}
              onChange={(e) => setFilterTaluk(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-2 px-3 text-xs font-bold"
            >
              <option value="all">All Taluks</option>
              {talukList.map(t => <option key={t} value={t}>{t} Taluk</option>)}
            </select>
          </div>

          {/* Ward */}
          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Ward</span>
            <select
              value={filterWard}
              onChange={(e) => setFilterWard(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-2 px-3 text-xs font-bold"
            >
              <option value="all">All Wards</option>
              {wardList.map(w => <option key={w} value={w}>Ward {w}</option>)}
            </select>
          </div>

          {/* Sector */}
          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Sector</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-2 px-3 text-xs font-bold"
            >
              <option value="all">All Sectors</option>
              {categoryKeys.map(cat => <option key={cat} value={cat}>{t(`categories.${cat}`)}</option>)}
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Status</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-2 px-3 text-xs font-bold"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="escalated">Escalated</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Priority */}
          <div className="space-y-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Priority</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-2 px-3 text-xs font-bold"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Queue Display */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-16 text-slate-400 font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm">No complaints match your specific query filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredTickets.map(ticket => {
            const hasDirective = !!ticket.collector_directive;
            const hasEscalatedState = !!ticket.flagged_state;
            
            return (
              <div 
                key={ticket.id} 
                className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 relative ${
                  hasEscalatedState ? 'border-2 border-indigo-500/40 shadow-indigo-500/5' : ''
                }`}
              >
                {/* Collector directive banner if present */}
                {hasDirective && (
                  <div className="bg-[#003366]/5 border border-[#003366]/15 p-3 rounded-2xl flex gap-2">
                    <MessageSquare className="w-4 h-4 text-[#003366] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] font-black text-[#003366] uppercase tracking-wider block">Collector Directive Attached</span>
                      <p className="text-xs text-[#003366] font-medium leading-relaxed mt-0.5">"{ticket.collector_directive}"</p>
                    </div>
                  </div>
                )}

                <TicketCard 
                  ticket={ticket}
                  role="collector"
                  onAction={(id, action) => handleActionClick(id, action)}
                />

                {/* Collector Administrative Actions Suite */}
                {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-2.5 items-center justify-between">
                    
                    {/* Left: Reassign dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reassign Taluk</span>
                      <select
                        onChange={(e) => handleReassignTaluk(ticket.id, e.target.value)}
                        defaultValue={ticket.taluk || ''}
                        className="bg-slate-50 dark:bg-slate-800 border rounded-xl py-1 px-2.5 text-[10px] font-bold text-slate-700 dark:text-slate-350 cursor-pointer"
                      >
                        <option value="" disabled>Select Taluk</option>
                        {talukList.map(t => <option key={t} value={t}>{t} Taluk</option>)}
                      </select>
                    </div>

                    {/* Right: Directive & State Escalation buttons */}
                    <div className="flex items-center gap-2">
                      {/* Add Directive */}
                      <button
                        onClick={() => { setActiveTicket(ticket); setDirectiveModalOpen(true); }}
                        className="flex items-center gap-1 text-[10px] font-black uppercase px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 text-slate-700 dark:text-slate-300 shadow-sm"
                      >
                        <span>{t('add_directive')}</span>
                      </button>

                      {/* Escalate to State */}
                      <button
                        onClick={() => { setActiveTicket(ticket); setEscalateModalOpen(true); }}
                        disabled={hasEscalatedState}
                        className={`flex items-center gap-1 text-[10px] font-black uppercase px-3 py-2 rounded-xl transition-all shadow-sm ${
                          hasEscalatedState
                            ? 'bg-slate-100 text-slate-400 border cursor-not-allowed'
                            : 'bg-indigo-650 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>{hasEscalatedState ? t('escalated_state') : t('escalate_state')}</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Add Collector Directive */}
      <AnimatePresence>
        {directiveModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-black text-[#003366] dark:text-slate-100 text-base uppercase">
                  Add Collector Administrative Directive
                </h4>
                <button onClick={() => setDirectiveModalOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleDirectiveSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 block">
                    Administrative Instruction Notes
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={directiveText}
                    onChange={(e) => setDirectiveText(e.target.value)}
                    placeholder="This instruction will be pinned to the ticket and sent directly as an alert to BDOs, DROs, and local Ward Officers..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#003366] outline-none px-4 py-3 rounded-xl text-slate-800 dark:text-slate-100 text-xs shadow-sm resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#003366] hover:bg-[#FF6600] text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-md"
                >
                  Verify and Attach Pinned Note
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Escalate to State Secretariat */}
      <AnimatePresence>
        {escalateModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4"
            >
              <div className="mx-auto w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-200">
                <ShieldAlert className="w-6 h-6 text-indigo-600" />
              </div>
              
              <div className="space-y-2">
                <h4 className="font-black text-slate-800 dark:text-slate-100 text-base uppercase">
                  State Escalation
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 font-extrabold leading-normal px-2">
                  Are you sure you want to escalate this complaint to the State Secretariat? This notifies the Department Secretary directly.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEscalateModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEscalateToState}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-750 text-white font-extrabold text-xs uppercase transition-colors shadow-md"
                >
                  Confirm Escalation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ticket Details View Modal */}
      <AnimatePresence>
        {activeTicket && !directiveModalOpen && !escalateModalOpen && (
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
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Grievance Description</h5>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {activeTicket.description}
                  </p>
                </div>

                {activeTicket.collector_directive && (
                  <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl flex items-start gap-2.5">
                    <MessageSquare className="w-5 h-5 text-[#003366] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-[#003366] uppercase tracking-wider block">Collector Administrative Directive</span>
                      <p className="text-xs text-[#003366] font-medium leading-relaxed">
                        "{activeTicket.collector_directive}"
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 text-xs font-bold">
                  <div className="bg-slate-50 dark:bg-slate-950/30 border p-3 rounded-xl">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">Ward</span>
                    <span className="text-slate-800 dark:text-slate-200">Ward {activeTicket.ward || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/30 border p-3 rounded-xl">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">Taluk</span>
                    <span className="text-slate-800 dark:text-slate-200">{activeTicket.taluk || 'Velachery'}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/30 border p-3 rounded-xl">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">Reporter</span>
                    <span className="text-slate-800 dark:text-slate-200">{activeTicket.citizen_name || 'Anonymous'}</span>
                  </div>
                </div>

                {activeTicket.photo && (
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document Evidence</h5>
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
