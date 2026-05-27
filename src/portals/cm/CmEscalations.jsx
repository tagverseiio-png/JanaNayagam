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

export default function CmEscalations() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState([]);
  
  // Interactive Action Modals
  const [activeTicket, setActiveTicket] = useState(null);
  const [directiveModalOpen, setDirectiveModalOpen] = useState(false);
  const [directiveText, setDirectiveText] = useState('');
  
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);

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

  // 1. Issue Executive Directive Pinned Note
  const handleDirectiveSubmit = (e) => {
    e.preventDefault();
    if (!directiveText.trim()) {
      toast.error('Directive instructions are required');
      return;
    }

    const updated = tickets.map(ticket => {
      if (ticket.id === activeTicket.id) {
        return { 
          ...ticket, 
          cm_directive: directiveText,
          cm_directive_at: new Date().toISOString()
        };
      }
      return ticket;
    });

    handleSaveTickets(updated);
    setDirectiveModalOpen(false);
    setDirectiveText('');
    toast.success(t('app_name') === 'ஜனநாயகம்' 
      ? 'முதலமைச்சர் உத்தரவு வெற்றிகரமாக இணைக்கப்பட்டது' 
      : 'Hon’ble CM executive directive note attached'
    );
  };

  // 2. Reassign directly to Ministerial portfolio
  const handleReassignToMinister = (ticketId, targetPortfolio) => {
    const updated = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return { 
          ...ticket, 
          category: targetPortfolio.toLowerCase(),
          status: 'in_progress', // Reset status to active in the new sector
          notes: `Reassigned directly to the ${targetPortfolio} Ministerial Portfolio by CM office.`
        };
      }
      return ticket;
    });

    handleSaveTickets(updated);
    toast.success(`Complaint reassigned to the ${targetPortfolio} Ministerial Portfolio`);
  };

  // 3. CM Override & Close Complaint
  const handleOverrideClose = () => {
    const updated = tickets.map(ticket => {
      if (ticket.id === activeTicket.id) {
        return { 
          ...ticket, 
          status: 'closed',
          cm_override: true,
          resolution_text: 'Closed directly by Hon’ble Chief Minister Executive Override Decree.'
        };
      }
      return ticket;
    });

    handleSaveTickets(updated);
    setOverrideModalOpen(false);
    toast.success(t('app_name') === 'ஜனநாயகம்' 
      ? 'முதலமைச்சர் அதிகாரத்தால் புகார் வெற்றிகரமாக மூடப்பட்டது' 
      : 'Grievance closed successfully by Chief Minister Override'
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

    if (actionType === 'close') {
      setActiveTicket(ticket);
      setOverrideModalOpen(true);
      return;
    }
  };

  // CM-level tickets: escalated tickets
  const cmEscalatedTickets = tickets.filter(t => t.status === 'escalated');

  const portfolioList = [
    { id: 'roads', label: 'Municipal Roads' },
    { id: 'water', label: 'Water Resources' },
    { id: 'electricity', label: 'Energy Dept' },
    { id: 'health', label: 'Health Ministry' },
    { id: 'education', label: 'School Education' },
    { id: 'agriculture', label: 'Agriculture Ministry' },
    { id: 'revenue', label: 'Revenue Department' },
    { id: 'welfare', label: 'Welfare Ministry' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
          Statewide Grievance Escalations Queue
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">
          Oversight of critical and state-level escalated civic grids
        </p>
      </div>

      {/* Tickets Queue */}
      {cmEscalatedTickets.length === 0 ? (
        <div className="text-center py-16 text-slate-400 font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm">No escalated complaints in the statewide CM queue</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {cmEscalatedTickets.map(ticket => {
            const hasDirective = !!ticket.cm_directive;
            return (
              <div 
                key={ticket.id} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 relative"
              >
                {/* CM directive note pinned if present */}
                {hasDirective && (
                  <div className="bg-[#003366]/5 border border-[#003366]/15 p-3 rounded-2xl flex gap-2">
                    <MessageSquare className="w-4 h-4 text-[#003366] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[9px] font-black text-[#003366] uppercase tracking-wider block">CM directive Attached</span>
                      <p className="text-xs text-[#003366] font-medium leading-relaxed mt-0.5">"{ticket.cm_directive}"</p>
                    </div>
                  </div>
                )}

                <TicketCard 
                  ticket={ticket}
                  role="cm"
                  onAction={(id, action) => handleActionClick(id, action)}
                />

                {/* CM Action Suite */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-2.5 items-center justify-between">
                  
                  {/* Left: Reassign to Minister select list */}
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reassign Minister</span>
                    <select
                      onChange={(e) => handleReassignToMinister(ticket.id, e.target.value)}
                      value=""
                      className="bg-slate-50 dark:bg-slate-800 border rounded-xl py-1 px-2.5 text-[10px] font-bold text-slate-700 dark:text-slate-350 cursor-pointer"
                    >
                      <option value="" disabled>Select Portfolio</option>
                      {portfolioList.map(p => <option key={p.id} value={p.label}>{p.label}</option>)}
                    </select>
                  </div>

                  {/* Right: Directive & Override Close actions */}
                  <div className="flex items-center gap-2">
                    {/* Issue Directive */}
                    <button
                      onClick={() => { setActiveTicket(ticket); setDirectiveModalOpen(true); }}
                      className="flex items-center gap-1 text-[10px] font-black uppercase px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 text-slate-700 dark:text-slate-350 shadow-sm"
                    >
                      <span>{t('issue_directive')}</span>
                    </button>

                    {/* Override & Close */}
                    <button
                      onClick={() => { setActiveTicket(ticket); setOverrideModalOpen(true); }}
                      className="flex items-center gap-1.5 text-[10px] font-black uppercase px-3.5 py-2.5 rounded-xl bg-slate-950 hover:bg-[#FF6600] text-white shadow-md transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{t('override_close')}</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: CM Directive Composer */}
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
                  Issue Executive CM Directive
                </h4>
                <button onClick={() => setDirectiveModalOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleDirectiveSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 block">
                    CM Executive Instructions
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={directiveText}
                    onChange={(e) => setDirectiveText(e.target.value)}
                    placeholder="Provide detailed, mandatory guidelines to target Ministers, Secretaries, and Collectors to immediately resolve this complaint..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF6600] outline-none px-4 py-3 rounded-xl text-slate-800 dark:text-slate-100 text-xs shadow-sm resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-slate-950 hover:bg-[#FF6600] text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-md"
                >
                  Confirm and Dispatch Directive
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: CM Override Closure */}
      <AnimatePresence>
        {overrideModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4"
            >
              <div className="mx-auto w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center border border-rose-200">
                <ShieldAlert className="w-6 h-6 text-rose-600 animate-bounce" />
              </div>
              
              <div className="space-y-2">
                <h4 className="font-black text-slate-800 dark:text-slate-100 text-base uppercase">
                  Confirm Executive Override
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 font-extrabold leading-normal px-2">
                  Are you sure you want to execute CM Override and close this grievance? This directly completes the ticket and marks it closed statewide.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setOverrideModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleOverrideClose}
                  className="flex-1 py-3 rounded-xl bg-slate-950 hover:bg-[#FF6600] text-white font-extrabold text-xs uppercase transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>Override & Close</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Details modal */}
      <AnimatePresence>
        {activeTicket && !directiveModalOpen && !overrideModalOpen && (
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
                  <p className="text-xs text-slate-700 dark:text-slate-350 font-medium leading-relaxed">
                    {activeTicket.description}
                  </p>
                </div>

                {activeTicket.cm_directive && (
                  <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl flex items-start gap-2.5">
                    <MessageSquare className="w-5 h-5 text-[#003366] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-[#003366] uppercase tracking-wider block">CM Executive Directive</span>
                      <p className="text-xs text-[#003366] font-medium leading-relaxed">
                        "{activeTicket.cm_directive}"
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
