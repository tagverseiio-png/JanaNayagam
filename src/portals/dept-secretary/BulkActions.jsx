import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Layers, CheckSquare, ShieldCheck, ArrowRight, X, AlertCircle, Info, Star
} from 'lucide-react';
import TicketCard from '../../shared/components/TicketCard';

export default function BulkActions() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState([]);
  const [selectedDept, setSelectedDept] = useState('roads');
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Confirmation Modal state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState(''); // resolve, priority, assign
  const [bulkActionValue, setBulkActionValue] = useState(''); // low/critical, districtName, etc.

  const departments = ['roads', 'water', 'electricity', 'health', 'education', 'agriculture', 'revenue', 'welfare'];
  
  const districtsList = [
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 
    'Kancheepuram', 'Kanniyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Nagapattinam', 'Nilgiris', 
    'Salem', 'Thanjavur', 'Tiruchirappalli', 'Tirunelveli', 'Tiruppur', 'Vellore', 'Viluppuram'
  ];

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
    setSelectedIds([]); // Clear selection after save
  };

  const handleSelectToggle = (ticketId) => {
    if (selectedIds.includes(ticketId)) {
      setSelectedIds(selectedIds.filter(id => id !== ticketId));
    } else {
      setSelectedIds([...selectedIds, ticketId]);
    }
  };

  const handleSelectAll = (filteredList) => {
    if (selectedIds.length === filteredList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredList.map(t => t.id));
    }
  };

  // Open confirmation modal for specific actions
  const triggerBulkAction = (actionType, actionValue = '') => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one ticket to apply bulk actions');
      return;
    }
    setBulkActionType(actionType);
    setBulkActionValue(actionValue);
    setConfirmModalOpen(true);
  };

  // Execute bulk action
  const handleBulkExecute = () => {
    let updatedTickets = [...tickets];

    if (bulkActionType === 'resolve') {
      updatedTickets = tickets.map(ticket => {
        if (selectedIds.includes(ticket.id)) {
          return { 
            ...ticket, 
            status: 'resolved',
            resolution_text: 'Resolved in bulk by Department Secretary decision.'
          };
        }
        return ticket;
      });
      toast.success(`Successfully resolved ${selectedIds.length} complaints in bulk`);
    } 
    
    else if (bulkActionType === 'priority') {
      updatedTickets = tickets.map(ticket => {
        if (selectedIds.includes(ticket.id)) {
          return { ...ticket, priority: bulkActionValue };
        }
        return ticket;
      });
      toast.success(`Successfully set priority to ${bulkActionValue.toUpperCase()} for ${selectedIds.length} complaints`);
    } 
    
    else if (bulkActionType === 'assign') {
      updatedTickets = tickets.map(ticket => {
        if (selectedIds.includes(ticket.id)) {
          return { ...ticket, district: bulkActionValue };
        }
        return ticket;
      });
      toast.success(`Successfully reassigned ${selectedIds.length} complaints to ${bulkActionValue} District`);
    }

    handleSaveTickets(updatedTickets);
    setConfirmModalOpen(false);
  };

  // 1. Filter by category
  const filteredTickets = tickets.filter(t => {
    return t.category.toLowerCase() === selectedDept && t.status !== 'resolved' && t.status !== 'closed';
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Title */}
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-[#1B5E20]/5 rounded-xl border border-[#1B5E20]/15 text-[#1B5E20]">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
            Statewide {t('bulk_actions')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">
            Resolve, prioritize, or reassign large sets of tickets simultaneously
          </p>
        </div>
      </div>

      {/* Statewide Department Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">
          Active Department Portfolio
        </span>
        <div className="flex gap-2 overflow-x-auto p-1 hide-scrollbar bg-slate-100 dark:bg-slate-850 rounded-2xl border">
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => { setSelectedDept(dept); setSelectedIds([]); }}
              className={`px-4 py-2 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                selectedDept === dept
                  ? 'bg-[#1B5E20] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t(`categories.${dept}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Control Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center pl-1 border-b pb-3">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Bulk Action Suite ({selectedIds.length} selected)
          </span>

          {filteredTickets.length > 0 && (
            <button
              onClick={() => handleSelectAll(filteredTickets)}
              className="text-[10px] font-black uppercase text-[#1B5E20] hover:text-[#003366] transition-colors"
            >
              {selectedIds.length === filteredTickets.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Action 1: Mark Resolved */}
          <button
            onClick={() => triggerBulkAction('resolve')}
            className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-black uppercase shadow-sm transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Mark Selected Resolved</span>
          </button>

          {/* Action 2: Change Priority */}
          <div className="flex items-center border rounded-xl overflow-hidden shadow-sm">
            <select
              onChange={(e) => triggerBulkAction('priority', e.target.value)}
              value=""
              className="bg-slate-50 dark:bg-slate-800 border-none outline-none py-2.5 px-3 text-[10.5px] font-black uppercase text-slate-600 dark:text-slate-350 cursor-pointer"
            >
              <option value="" disabled>Change Priority</option>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical Priority</option>
            </select>
          </div>

          {/* Action 3: Assign to District */}
          <div className="flex items-center border rounded-xl overflow-hidden shadow-sm">
            <select
              onChange={(e) => triggerBulkAction('assign', e.target.value)}
              value=""
              className="bg-slate-50 dark:bg-slate-800 border-none outline-none py-2.5 px-3 text-[10.5px] font-black uppercase text-slate-600 dark:text-slate-350 cursor-pointer"
            >
              <option value="" disabled>Assign to District</option>
              {districtsList.map(dist => (
                <option key={dist} value={dist}>
                  {dist} District
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid List of complaints with Checkbox selection */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-16 text-slate-400 font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm">No open complaints found in this department queue</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTickets.map(ticket => {
            const isChecked = selectedIds.includes(ticket.id);
            return (
              <div 
                key={ticket.id} 
                className="flex items-start gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm hover:border-[#1B5E20]/40 transition-all cursor-pointer"
                onClick={() => handleSelectToggle(ticket.id)}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  className={`w-6 h-6 rounded-xl border flex items-center justify-center shrink-0 shadow-sm mt-1 transition-colors ${
                    isChecked
                      ? 'bg-[#1B5E20] border-[#1B5E20] text-white'
                      : 'bg-slate-50 border-slate-300 dark:bg-slate-800'
                  }`}
                >
                  {isChecked && <CheckSquare className="w-4 h-4" />}
                </button>

                {/* Complaint Card */}
                <div className="flex-1 overflow-hidden pointer-events-none">
                  <TicketCard ticket={ticket} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONFIRMATION MODAL: BEFORE EXECUTING BULK ACTIONS */}
      <AnimatePresence>
        {confirmModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4"
            >
              <div className="mx-auto w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center border border-amber-200">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              
              <div className="space-y-2">
                <h4 className="font-black text-slate-800 dark:text-slate-100 text-base uppercase">
                  Verify Bulk Actions
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 font-extrabold leading-normal px-2">
                  Are you sure you want to apply bulk updates across <strong>{selectedIds.length} selected complaints</strong>? This action updates administrative matrices.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkExecute}
                  className="flex-1 py-3 rounded-xl bg-[#1B5E20] hover:bg-[#003366] text-white font-extrabold text-xs uppercase transition-colors shadow-md flex items-center justify-center gap-1"
                >
                  <span>Confirm Bulk</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
