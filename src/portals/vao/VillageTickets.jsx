import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { AlertCircle, PlusCircle, CheckCircle, Search, ShieldAlert, Landmark, X } from 'lucide-react';
import TicketCard from '../../shared/components/TicketCard';
import StatusBadge from '../../shared/components/StatusBadge';
import CategoryIcon from '../../shared/components/CategoryIcon';

export default function VillageTickets() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [observations, setObservations] = useState({});
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = () => {
    const list = JSON.parse(localStorage.getItem('jn_tickets') || '[]');
    setTickets(list);

    // Populate existing observations
    const notes = {};
    list.forEach(ticket => {
      if (ticket.vao_observation) {
        notes[ticket.id] = ticket.vao_observation;
      }
    });
    setObservations(notes);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSaveObservation = (ticketId) => {
    const note = observations[ticketId] || '';
    
    // Save to localStorage
    const list = JSON.parse(localStorage.getItem('jn_tickets') || '[]');
    const updated = list.map(ticket => {
      if (ticket.id === ticketId) {
        return { ...ticket, vao_observation: note };
      }
      return ticket;
    });

    localStorage.setItem('jn_tickets', JSON.stringify(updated));
    setTickets(updated);
    toast.success('Field observation saved successfully');
  };

  const handleAction = (ticketId, actionType) => {
    if (actionType === 'view') {
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) setSelectedTicket(ticket);
      return;
    }

    if (actionType === 'escalate' || actionType === 'close') {
      // Direct warning toast showing role restriction tooltip
      toast.warning(t('ward_officer_warning'), {
        icon: <ShieldAlert className="w-5 h-5 text-rose-500" />
      });
      return;
    }

    if (actionType === 'assign') {
      // Assign to local block (update status to in_progress)
      const updated = tickets.map(ticket => {
        if (ticket.id === ticketId) {
          return { ...ticket, status: 'in_progress' };
        }
        return ticket;
      });
      localStorage.setItem('jn_tickets', JSON.stringify(updated));
      setTickets(updated);
      toast.success('Ticket status changed: Assigned to Block Field Engineer');
    }
  };

  // Filter logic
  const filtered = tickets.filter(ticket => {
    if (filter === 'all') return true;
    if (filter === 'open') return ticket.status === 'open' || ticket.status === 'in_progress';
    if (filter === 'resolved') return ticket.status === 'resolved';
    return true;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
          Village Grievances List
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">
          Grievances queue for Velachery Ward 142
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex rounded-2xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner overflow-x-auto hide-scrollbar">
        {['all', 'open', 'resolved'].map(f => {
          const isActive = filter === f;
          const label = f === 'all' ? 'All' : t(f);
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#003366] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Grid of Tickets */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm">{t('empty_tickets')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filtered.map(ticket => (
            <div key={ticket.id} className="space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              {/* Core TicketCard */}
              <TicketCard 
                ticket={ticket}
                role="vao"
                onAction={(id, action) => handleAction(id, action)}
              />

              {/* Field observations input section */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 block">
                  {t('observations')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={observations[ticket.id] || ''}
                    onChange={(e) => setObservations({ ...observations, [ticket.id]: e.target.value })}
                    placeholder={t('field_observation') + '...'}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF6600] outline-none px-3 py-2 rounded-xl text-slate-800 dark:text-slate-100 text-xs shadow-sm transition-colors placeholder-slate-400"
                  />
                  <button
                    onClick={() => handleSaveObservation(ticket.id)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-[#003366] text-white font-extrabold text-[10px] uppercase tracking-wider shadow-sm transition-colors shrink-0"
                  >
                    {t('save_note')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTicket(null)}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="bg-[#003366] text-white p-5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CategoryIcon category={selectedTicket.category} />
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-300">#{selectedTicket.id}</span>
                    <h4 className="text-sm font-black uppercase leading-none mt-0.5">
                      {t(`categories.${selectedTicket.category.toLowerCase()}`)}
                    </h4>
                  </div>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="p-1 rounded-lg hover:bg-white/10 text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="flex gap-2 items-center">
                  <StatusBadge status={selectedTicket.status} />
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    Created: {new Date(selectedTicket.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Description</h5>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {selectedTicket.description}
                  </p>
                </div>

                {/* Submitter info */}
                <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reporter Details</h5>
                  <div className="text-xs text-slate-700 dark:text-slate-300 font-bold space-y-1">
                    <p>Name: <span className="text-slate-500">{selectedTicket.citizen_name || 'Anonymous'}</span></p>
                    {selectedTicket.raised_by && <p>Raised by: <span className="text-[#9a0002]">{selectedTicket.raised_by}</span></p>}
                    {selectedTicket.citizen_id && <p>ID Reference: <span className="text-slate-500">{selectedTicket.citizen_id}</span></p>}
                  </div>
                </div>

                {/* Location */}
                {selectedTicket.location && (
                  <div className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Geotag / Location</h5>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-mono font-bold">
                      {selectedTicket.location.manual ? selectedTicket.location.manual : `Lat: ${selectedTicket.location.lat}°N, Lng: ${selectedTicket.location.lng}°E`}
                    </p>
                  </div>
                )}

                {/* Photo */}
                {selectedTicket.photo && (
                  <div className="space-y-1">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Image Evidence</h5>
                    <div className="w-full h-44 rounded-2xl border overflow-hidden">
                      <img src={selectedTicket.photo} alt="Evidence" className="w-full h-full object-cover" />
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
