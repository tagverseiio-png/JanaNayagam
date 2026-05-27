import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Settings, Layers, Users, MapPin, AlertCircle, X, ShieldAlert, ArrowRight, Check
} from 'lucide-react';

export default function WardManagement() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState([]);
  const [expandedWards, setExpandedWards] = useState({});

  const toggleWardExpand = (wardName) => {
    setExpandedWards(prev => ({ ...prev, [wardName]: !prev[wardName] }));
  };
  
  // Wards administrative state (mocked and synced with dynamic ticket counts)
  const [wards, setWards] = useState([
    { name: '140', taluk: 'Velachery', officer: 'Suresh M.' },
    { name: '141', taluk: 'Velachery', officer: 'Anitha K.' },
    { name: '142', taluk: 'Velachery', officer: 'Karthik Raj S.' },
    { name: '143', taluk: 'Velachery', officer: 'Ramya V.' },
    { name: '144', taluk: 'Sholinganallur', officer: 'Selvam P.' },
    { name: '145', taluk: 'Sholinganallur', officer: 'Divya N.' },
    { name: '146', taluk: 'Sholinganallur', officer: 'Manoj S.' },
    { name: '147', taluk: 'Sholinganallur', officer: 'Priya R.' },
    { name: '120', taluk: 'Mylapore', officer: 'Ganesh P.' },
    { name: '121', taluk: 'Mylapore', officer: 'Subha S.' },
    { name: '130', taluk: 'Guindy', officer: 'Naveen Kumar' },
    { name: '131', taluk: 'Guindy', officer: 'Vimala Devi' }
  ]);

  // Merge Wards states
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [sourceWard, setSourceWard] = useState('');
  const [targetWard, setTargetWard] = useState('');

  // Officer list for reassignment dropdown
  const availableOfficers = [
    'Suresh M.', 'Anitha K.', 'Karthik Raj S.', 'Ramya V.', 
    'Selvam P.', 'Divya N.', 'Manoj S.', 'Priya R.', 
    'Ganesh P.', 'Subha S.', 'Naveen Kumar', 'Vimala Devi',
    'Arun Kumar A.', 'Meenakshi R.'
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
  };

  // Get active tickets count dynamically for each ward
  const getOpenCount = (wardName) => {
    return tickets.filter(t => {
      return String(t.ward) === String(wardName) && t.status !== 'resolved' && t.status !== 'closed';
    }).length;
  };

  // Reassign Officer
  const handleOfficerChange = (wardName, newOfficer) => {
    const updatedWards = wards.map(w => {
      if (w.name === wardName) {
        return { ...w, officer: newOfficer };
      }
      return w;
    });
    setWards(updatedWards);
    toast.success(`Ward ${wardName} officer reassigned to ${newOfficer}`);
  };

  // Execute Mock Ward Merge: Reassign all tickets from Ward A to Ward B
  const handleMergeSubmit = (e) => {
    e.preventDefault();

    if (!sourceWard || !targetWard) {
      toast.error('Both source and target wards must be selected');
      return;
    }

    if (sourceWard === targetWard) {
      toast.error('Source and Target wards cannot be the same');
      return;
    }

    // Reassign tickets
    const updatedTickets = tickets.map(ticket => {
      if (String(ticket.ward) === String(sourceWard)) {
        return { ...ticket, ward: targetWard, notes: `Reassigned from Ward ${sourceWard} due to Ward Merge action.` };
      }
      return ticket;
    });

    handleSaveTickets(updatedTickets);
    setMergeModalOpen(false);

    // Remove source ward from the administrative listing to simulate merge deletion
    const updatedWards = wards.filter(w => w.name !== sourceWard);
    setWards(updatedWards);

    toast.success(`Wards merged! All active complaints transferred from Ward ${sourceWard} to Ward ${targetWard}.`);
    setSourceWard('');
    setTargetWard('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Title */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#003366]/5 rounded-xl border border-[#003366]/15 text-[#003366] dark:text-sky-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
              {t('ward_management')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              Supervise administrative boundaries and ward officer assignments
            </p>
          </div>
        </div>

        {/* Merge Ward CTA button */}
        <button
          onClick={() => setMergeModalOpen(true)}
          className="flex items-center gap-1.5 text-xs font-black uppercase px-4 py-2.5 rounded-2xl bg-[#003366] hover:bg-[#FF6600] text-white shadow-md transition-all"
        >
          <Layers className="w-4 h-4" />
          <span>{t('merge_ward')}</span>
        </button>
      </div>

      {/* Ward Administration Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto rounded-2xl border">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Ward Name</th>
                <th className="px-5 py-3.5">Taluk Name</th>
                <th className="px-5 py-3.5">Open Tickets</th>
                <th className="px-5 py-3.5">Assigned Ward Officer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-bold text-slate-700 dark:text-slate-350">
              {wards.map(ward => {
                const openCount = getOpenCount(ward.name);
                return (
                  <tr key={ward.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="px-5 py-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#003366]" />
                      <span className="font-extrabold text-slate-800 dark:text-slate-100">Ward {ward.name}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-medium">{ward.taluk} Taluk</td>
                    <td className="px-5 py-4 font-mono text-rose-600">{openCount} active</td>
                    <td className="px-5 py-4">
                      {/* Officer Reassign Select Dropdown */}
                      <select
                        value={ward.officer}
                        onChange={(e) => handleOfficerChange(ward.name, e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800 border rounded-xl py-1.5 px-3.5 font-bold text-slate-700 dark:text-slate-300 cursor-pointer outline-none focus:border-[#003366]"
                      >
                        {availableOfficers.map(officer => (
                          <option key={officer} value={officer}>
                            {officer}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View - Convert Table Rows to Expandable Cards */}
        <div className="md:hidden flex flex-col gap-3">
          {wards.map(ward => {
            const openCount = getOpenCount(ward.name);
            const isExpanded = !!expandedWards[ward.name];
            return (
              <div 
                key={ward.name} 
                onClick={() => toggleWardExpand(ward.name)}
                className="bg-slate-50 dark:bg-slate-800/40 border border-[#DDE1E7] dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5 transition-all active:bg-slate-100/55 cursor-pointer"
              >
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#8B1A1A]" />
                    <span className="font-extrabold text-slate-850 dark:text-slate-100">Ward {ward.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-full">
                      {openCount} active
                    </span>
                    <span className={`transform transition-transform text-slate-400 ${isExpanded ? 'rotate-90' : ''}`}>
                      ▶
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="pt-2.5 border-t border-slate-200/50 dark:border-slate-700/50 space-y-2.5 text-xs text-slate-550 dark:text-slate-450">
                    <div className="flex justify-between">
                      <span className="font-bold">Taluk:</span>
                      <span className="font-black text-slate-855 dark:text-slate-200">{ward.taluk} Taluk</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-bold">Assigned Ward Officer:</span>
                      <div onClick={(e) => e.stopPropagation()}>
                        <select
                          value={ward.officer}
                          onChange={(e) => handleOfficerChange(ward.name, e.target.value)}
                          className="w-full bg-white dark:bg-slate-850 border rounded-xl py-2 px-3 font-bold text-slate-700 dark:text-slate-300 cursor-pointer outline-none focus:border-[#8B1A1A]"
                        >
                          {availableOfficers.map(officer => (
                            <option key={officer} value={officer}>
                              {officer}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* MODAL: Merge Ward Component */}
      <AnimatePresence>
        {mergeModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-black text-[#003366] dark:text-slate-100 text-base uppercase flex items-center gap-1.5">
                  <Layers className="w-5 h-5" />
                  <span>Merge Municipal Wards</span>
                </h4>
                <button onClick={() => setMergeModalOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-4.5 rounded-2xl flex items-start gap-2.5 shadow-inner">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 dark:text-amber-300 font-extrabold leading-relaxed">
                  WARNING: This action is administrative-level. Merging Wards will automatically transfer all active and resolved complaints from the Source Ward into the Target Ward, permanently updating ticket records.
                </p>
              </div>

              <form onSubmit={handleMergeSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  {/* Source Ward */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 block">
                      Source Ward (To merge)
                    </label>
                    <select
                      required
                      value={sourceWard}
                      onChange={(e) => setSourceWard(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-2 px-3 text-xs font-bold"
                    >
                      <option value="" disabled>Select Ward</option>
                      {wards.map(w => <option key={w.name} value={w.name}>Ward {w.name}</option>)}
                    </select>
                  </div>

                  {/* Target Ward */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 block">
                      Target Ward (To absorb)
                    </label>
                    <select
                      required
                      value={targetWard}
                      onChange={(e) => setTargetWard(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-2 px-3 text-xs font-bold"
                    >
                      <option value="" disabled>Select Ward</option>
                      {wards.map(w => <option key={w.name} value={w.name}>Ward {w.name}</option>)}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#003366] hover:bg-[#FF6600] text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>Verify and Execute Merge</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
