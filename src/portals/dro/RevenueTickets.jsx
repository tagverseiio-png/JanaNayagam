import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  FileText, Landmark, ShieldAlert, ArrowUpRight, MessageSquare, AlertCircle, X, ShieldCheck
} from 'lucide-react';
import TicketCard from '../../shared/components/TicketCard';
import StatusBadge from '../../shared/components/StatusBadge';
import CategoryIcon from '../../shared/components/CategoryIcon';

export default function RevenueTickets({ flaggedOnly = false }) {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState([]);
  const [activeSubtype, setActiveSubtype] = useState('all');
  const [activeTicket, setActiveTicket] = useState(null);

  const fetchTickets = () => {
    const list = JSON.parse(localStorage.getItem('jn_tickets') || '[]');
    setTickets(list);
  };

  useEffect(() => {
    fetchTickets();
  }, [flaggedOnly]);

  const handleSaveTickets = (updated) => {
    localStorage.setItem('jn_tickets', JSON.stringify(updated));
    setTickets(updated);
  };

  // Helper to resolve/assign sub-type dynamically if not present
  const getSubtype = (ticket) => {
    if (ticket.sub_type) return ticket.sub_type;
    const desc = ticket.description.toLowerCase();
    if (desc.includes('patta')) return 'Patta';
    if (desc.includes('encroach') || desc.includes('occupy') || desc.includes('land grab')) return 'Encroachment';
    if (desc.includes('boundary') || desc.includes('dispute') || desc.includes('fence')) return 'Boundary Dispute';
    return 'Land Records';
  };

  // Flag to Collector handler
  const handleFlagToCollector = (ticketId) => {
    const updated = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return { 
          ...ticket, 
          status: 'escalated',
          flagged_collector: true,
          flagged_collector_at: new Date().toISOString()
        };
      }
      return ticket;
    });

    handleSaveTickets(updated);
    toast.success(t('app_name') === 'ஜனநாயகம்' 
      ? 'புகார் கலெக்டருக்கு வெற்றிகரமாக அனுப்பப்பட்டது' 
      : 'Revenue complaint flagged to District Collector'
    );
  };

  // Catch generic actions from TicketCard
  const handleActionClick = (ticketId, actionType) => {
    if (actionType === 'view') {
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) setActiveTicket(ticket);
      return;
    }

    if (actionType === 'close' || actionType === 'escalate') {
      // Show restricted message
      const isTamil = t('app_name') === 'ஜனநாயகம்';
      const warningText = isTamil
        ? "நில வருவாய் அதிகாரி புகார்களை நேரடியாக மூடவோ அல்லது மறுஒதுக்கீடு செய்யவோ முடியாது."
        : "DRO cannot directly close or reassign general municipal complaints.";
      
      toast.warning(warningText, {
        icon: <ShieldAlert className="w-5 h-5 text-rose-500" />
      });
    }
  };

  // 1. Filter by category = 'revenue'
  const revenueList = tickets.filter(t => t.category.toLowerCase() === 'revenue');

  // 2. Filter by flaggedOnly status if accessed through Flagged link
  const listAfterFlagged = flaggedOnly 
    ? revenueList.filter(t => t.flagged_collector === true)
    : revenueList;

  // 3. Filter by active sub-type tab
  const filteredTickets = listAfterFlagged.filter(ticket => {
    if (activeSubtype === 'all') return true;
    return getSubtype(ticket).toLowerCase().replace(' ', '_') === activeSubtype;
  });

  const subTypeTabs = [
    { id: 'all', label: 'All Revenue' },
    { id: 'land_records', label: t('land_records') },
    { id: 'patta', label: t('patta') },
    { id: 'encroachment', label: t('encroachment') },
    { id: 'boundary_dispute', label: t('boundary_dispute') }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
          {flaggedOnly ? 'Collector Flagged Queue' : t('revenue_tickets')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">
          {flaggedOnly ? 'Revenue issues escalated for direct IAS intervention' : 'Supervise land records and patta dispute grids'}
        </p>
      </div>

      {/* Sub-type Tab Bar (only visible when not strictly displaying flagged items for simplicity) */}
      {!flaggedOnly && (
        <div className="flex rounded-2xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner overflow-x-auto hide-scrollbar">
          {subTypeTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubtype(tab.id)}
              className={`px-4 py-2 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                activeSubtype === tab.id
                  ? 'bg-[#9a0002] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Tickets Feed */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-16 text-slate-400 font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm">No revenue complaints found in this section</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredTickets.map(ticket => {
            const hasBeenFlagged = !!ticket.flagged_collector;
            return (
              <div 
                key={ticket.id} 
                className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 relative ${
                  hasBeenFlagged ? 'border-2 border-rose-500/40 shadow-rose-500/5' : ''
                }`}
              >
                {/* Sub-type indicator badge */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#9a0002]/5 border border-[#9a0002]/15 text-[#9a0002] px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider">
                  <Landmark className="w-3 h-3" />
                  <span>{getSubtype(ticket)}</span>
                </div>

                <TicketCard 
                  ticket={ticket}
                  role="dro"
                  onAction={(id, action) => handleActionClick(id, action)}
                />

                {/* Flag to Collector Action Panel */}
                {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Administrative Control
                    </span>
                    <button
                      onClick={() => handleFlagToCollector(ticket.id)}
                      disabled={hasBeenFlagged}
                      className={`flex items-center gap-1 text-[10px] font-black uppercase px-3 py-2 rounded-xl transition-all shadow-sm ${
                        hasBeenFlagged
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                          : 'bg-[#9a0002] hover:bg-rose-800 text-white'
                      }`}
                    >
                      {hasBeenFlagged ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      <span>{hasBeenFlagged ? t('flagged_to_collector') : t('flag_to_collector')}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed view Modal */}
      <AnimatePresence>
        {activeTicket && (
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
              <div className="bg-[#9a0002] text-[#efe6de] p-5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CategoryIcon category={activeTicket.category} />
                  <div>
                    <span className="text-[10px] font-mono font-bold text-rose-200">Ticket ID: #{activeTicket.id}</span>
                    <h4 className="text-sm font-black uppercase mt-0.5">
                      {t(`categories.${activeTicket.category.toLowerCase()}`)} • {getSubtype(activeTicket)}
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
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Grievance Summary</h5>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {activeTicket.description}
                  </p>
                </div>

                {activeTicket.flagged_collector && (
                  <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-[#9a0002] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-[#9a0002] uppercase tracking-wider block">Escalated to District Collector</span>
                      <p className="text-xs text-rose-800 font-medium leading-relaxed">
                        This land-revenue complaint has been flagged directly to the District Collector's dashboard for immediate administrative intervention and policy alignment.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                  <div className="bg-slate-50 dark:bg-slate-950/30 border p-3 rounded-xl">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">Ward Assignment</span>
                    <span className="text-slate-800 dark:text-slate-200">Ward {activeTicket.ward || 'N/A'}</span>
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
