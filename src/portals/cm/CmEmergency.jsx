import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Zap, AlertTriangle, Send, X, ShieldAlert, CheckCircle, Info, Landmark, History, CheckSquare, ChevronRight, ArrowRight
} from 'lucide-react';
import TableSkeleton from '../../shared/components/TableSkeleton';

export default function CmEmergency() {
  const { t } = useTranslation();
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1); // 1, 2, 3
  
  // Form states
  const [reason, setReason] = useState('');
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loadingTable, setLoadingTable] = useState(true);

  const districtsList = [
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 
    'Kallakurichi', 'Kancheepuram', 'Kanniyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai', 
    'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanathapuram', 'Ranipet', 
    'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 
    'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'
  ];

  useEffect(() => {
    const active = localStorage.getItem('jn_state_emergency') === 'true';
    setEmergencyActive(active);

    const list = JSON.parse(localStorage.getItem('jn_past_emergencies') || '[]');
    if (list.length === 0) {
      const mock = [
        {
          id: 'EMG-9021',
          reason: 'Severe cyclonic storm and heavy rainfall warning across coastal districts requiring localized flood management protocols.',
          districts: ['Chennai', 'Chengalpattu', 'Cuddalore', 'Nagapattinam', 'Thanjavur'],
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'resolved'
        },
        {
          id: 'EMG-8103',
          reason: 'Statewide water grid load realignments due to heatwave-induced municipal storage depletion.',
          districts: districtsList,
          created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'resolved'
        }
      ];
      localStorage.setItem('jn_past_emergencies', JSON.stringify(mock));
      setHistory(mock);
    } else {
      setHistory(list);
    }

    // Pre-select all 38 districts for step 2
    setSelectedDistricts(districtsList);

    const timer = setTimeout(() => {
      setLoadingTable(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleDeactivate = () => {
    localStorage.setItem('jn_state_emergency', 'false');
    setEmergencyActive(false);
    toast.info('State Emergency Deactivated. Normal municipal SLAs restored.');
  };

  const handleDistrictToggle = (dist) => {
    if (selectedDistricts.includes(dist)) {
      setSelectedDistricts(selectedDistricts.filter(d => d !== dist));
    } else {
      setSelectedDistricts([...selectedDistricts, dist]);
    }
  };

  const handleSelectAllDistricts = () => {
    if (selectedDistricts.length === districtsList.length) {
      setSelectedDistricts([]);
    } else {
      setSelectedDistricts(districtsList);
    }
  };

  const executeEmergencyDeclaration = () => {
    localStorage.setItem('jn_state_emergency', 'true');
    setEmergencyActive(true);
    setWizardOpen(false);

    // Save to history
    const emgId = 'EMG-' + Math.floor(1000 + Math.random() * 9000).toString();
    const newEmergency = {
      id: emgId,
      reason,
      districts: selectedDistricts,
      created_at: new Date().toISOString(),
      status: 'active'
    };
    const updatedHistory = [newEmergency, ...history];
    localStorage.setItem('jn_past_emergencies', JSON.stringify(updatedHistory));
    setHistory(updatedHistory);

    // Dynamic ticket SLA override: Contract all statewide SLAs to a super accelerated 12 hours!
    const tickets = JSON.parse(localStorage.getItem('jn_tickets') || '[]');
    const updatedTickets = tickets.map(t => {
      if (t.status !== 'resolved' && t.status !== 'closed') {
        const deadline = new Date();
        deadline.setHours(deadline.getHours() + 12); // Accelerated 12 Hours SLA
        return { ...t, sla_deadline: deadline.toISOString() };
      }
      return t;
    });
    localStorage.setItem('jn_tickets', JSON.stringify(updatedTickets));

    toast.success('STATE EMERGENCY DECREE SIGNED');
  };

  const englishSuccess = "State Emergency Declared. All Collectors, Ministers, and Secretaries notified.";
  const tamilSuccess = "அவசிய நிலை அறிவிக்கப்பட்டது. அனைத்து மாவட்ட ஆட்சியர்கள், அமைச்சர்கள் மற்றும் செயலாளர்கள் அறிவிக்கப்பட்டனர்.";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Title */}
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-rose-50 rounded-xl border border-rose-200 text-rose-600">
          <Zap className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
          Cabinet State Emergency Control
        </h2>
      </div>

      {/* Prominent Red Button Activator */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center space-y-6">
        <div className="max-w-md space-y-2">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">
            Sign State SLA Emergency Executive Order
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Signing a State Emergency mandates that all local administrations collapse resolution deadlines to 12 hours, notifies all Cabinet members instantly, and overrides standard municipal priorities.
          </p>
        </div>

        {emergencyActive ? (
          <button
            onClick={handleDeactivate}
            className="w-64 py-4.5 rounded-full bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-1.5 transition-all"
          >
            <ShieldAlert className="w-4.5 h-4.5 text-emerald-500" />
            <span>Deactivate State Emergency</span>
          </button>
        ) : (
          <motion.button
            onClick={() => { setWizardStep(1); setWizardOpen(true); }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-64 py-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-600/25 flex items-center justify-center gap-1.5 animate-pulse"
          >
            <Zap className="w-4.5 h-4.5 fill-white" />
            <span>{t('declare_emergency')}</span>
          </motion.button>
        )}
      </div>

      {/* Dynamic Big Success Alert Banner */}
      <AnimatePresence>
        {emergencyActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-rose-600 text-white p-6 rounded-3xl space-y-3 shadow-md relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-6 h-6 animate-bounce shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">
                Hon'ble CM Executive Order Decree
              </span>
            </div>
            
            <div className="space-y-1 font-extrabold text-xs sm:text-sm leading-relaxed">
              <p>"{englishSuccess}"</p>
              <p className="opacity-90 font-medium">"{tamilSuccess}"</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3-Step Confirmation wizard modal */}
      <AnimatePresence>
        {wizardOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between max-h-[85vh]"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-3 border-b">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-rose-600" />
                  <h4 className="font-black text-slate-800 dark:text-white text-sm uppercase">
                    Step {wizardStep} of 3: Sign Emergency Order
                  </h4>
                </div>
                <button onClick={() => setWizardOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Step Content */}
              <div className="flex-1 py-6 overflow-y-auto space-y-4">
                
                {/* STEP 1: Are you sure? + Reason justification */}
                {wizardStep === 1 && (
                  <div className="space-y-4">
                    <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-4.5 rounded-2xl flex items-start gap-2.5 shadow-inner">
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-rose-800 dark:text-rose-350 font-extrabold leading-relaxed">
                        Are you sure you want to declare a State-wide Emergency? This action overrides municipal grid structures and collapses all standard resolution timelines to 12 hours.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 block">
                        Mandatory Justification Reason
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Detail specific atmospheric weather emergencies, natural grid failures, or systemic security failures..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border outline-none px-4 py-3 rounded-xl text-slate-800 dark:text-slate-100 text-xs shadow-sm resize-none"
                      ></textarea>
                    </div>
                  </div>
                )}

                {/* STEP 2: Affected Districts selector */}
                {wizardStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pl-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Checklist Affected Districts ({selectedDistricts.length} selected)
                      </span>
                      <button
                        onClick={handleSelectAllDistricts}
                        className="text-[9px] font-black uppercase text-rose-600 hover:text-slate-850"
                      >
                        {selectedDistricts.length === districtsList.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-[40vh] overflow-y-auto border p-3 rounded-2xl shadow-inner bg-slate-50/30">
                      {districtsList.map(dist => {
                        const isChecked = selectedDistricts.includes(dist);
                        return (
                          <button
                            key={dist}
                            onClick={() => handleDistrictToggle(dist)}
                            className={`py-2 px-3 border rounded-xl font-bold text-xs transition-colors flex items-center justify-between ${
                              isChecked
                                ? 'bg-rose-50 border-rose-350 text-rose-700 font-extrabold shadow-sm'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-350'
                            }`}
                          >
                            <span>{dist}</span>
                            {isChecked && <CheckSquare className="w-3.5 h-3.5 text-rose-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 3: Final confirmation */}
                {wizardStep === 3 && (
                  <div className="space-y-4 text-center">
                    <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center border border-rose-200 shadow-md">
                      <ShieldAlert className="w-8 h-8 text-rose-600 animate-pulse" />
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="text-base font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                        Executive Confirm Signature
                      </h5>
                      <p className="text-xs text-slate-500 font-bold leading-relaxed px-6">
                        Clicking the button below signs the Statewide Emergency Order, contract resolution deadlines to 12 hours, and dispatches automated notices to all Cabinet Ministers, Secretaries, and District Collectors.
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950/20 p-3 rounded-2xl border text-left font-bold text-xs max-h-36 overflow-y-auto">
                      <span className="text-[9px] text-[#003366] uppercase tracking-widest block mb-0.5">Summary Justification</span>
                      <p className="text-slate-600 leading-relaxed font-medium">"{reason}"</p>
                    </div>
                  </div>
                )}

              </div>

              {/* Wizard Footer Controls */}
              <div className="pt-4 border-t flex gap-3">
                {wizardStep > 1 && (
                  <button
                    onClick={() => setWizardStep(wizardStep - 1)}
                    className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase"
                  >
                    Back
                  </button>
                )}
                
                {wizardStep < 3 ? (
                  <button
                    onClick={() => {
                      if (wizardStep === 1 && !reason.trim()) {
                        toast.error('Justification reason is required before proceeding');
                        return;
                      }
                      setWizardStep(wizardStep + 1);
                    }}
                    className="flex-1 py-3.5 rounded-xl bg-slate-950 hover:bg-[#003366] text-white font-extrabold text-xs uppercase flex items-center justify-center gap-1 shadow-md"
                  >
                    <span>Proceed Step</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={executeEmergencyDeclaration}
                    className="flex-1 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-750 text-white font-black text-xs uppercase flex items-center justify-center gap-1 shadow-md"
                  >
                    <span>Sign Emergency Decree</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2 pl-1">
          <History className="w-5 h-5 text-slate-700" />
          Past Emergency Declarations Table
        </h4>

        {loadingTable ? (
          <TableSkeleton rows={3} cols={4} />
        ) : (
          <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3">Declaration ID</th>
                <th className="px-4 py-3">Districts Impacted</th>
                <th className="px-4 py-3">Justification Reason</th>
                <th className="px-5 py-3">Timeline Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-bold text-slate-700 dark:text-slate-350">
              {history.map(row => (
                <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="px-5 py-4 font-mono text-rose-600">#{row.id}</td>
                  <td className="px-4 py-4 max-w-[120px] truncate">
                    {row.districts.length === districtsList.length ? 'Statewide (38 districts)' : `${row.districts.length} districts`}
                  </td>
                  <td className="px-4 py-4 max-w-[200px] truncate font-medium text-slate-500">
                    {row.reason}
                  </td>
                  <td className="px-5 py-4 font-mono text-slate-400">
                    {new Date(row.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </motion.div>
  );
}
