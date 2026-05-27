import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { AlertCircle, Camera, History, Send, ShieldAlert } from 'lucide-react';
import StatusBadge from '../../shared/components/StatusBadge';

export default function Escalate() {
  const { t } = useTranslation();
  const [target, setTarget] = useState('collector');
  const [summary, setSummary] = useState('');
  const [urgency, setUrgency] = useState('Normal');
  const [evidence, setEvidence] = useState('');
  const [history, setHistory] = useState([]);

  // Initialize mock history
  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('jn_mla_escalations') || '[]');
    if (list.length === 0) {
      const mock = [
        {
          id: 'ESC-8921',
          target: 'collector',
          summary: 'Urgent funding allocation request for desilting storm drains in Ward 142 Velachery.',
          urgency: 'Urgent',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'acknowledged'
        },
        {
          id: 'ESC-8703',
          target: 'minister',
          summary: 'Policy realignment and financial budget approval for high school construction in Ward 145.',
          urgency: 'Normal',
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'resolved'
        }
      ];
      localStorage.setItem('jn_mla_escalations', JSON.stringify(mock));
      setHistory(mock);
    } else {
      setHistory(list);
    }
  }, []);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidence(reader.result);
        toast.success('Evidence uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!summary.trim() || summary.length < 15) {
      toast.error('Detailed summary is required (min 15 chars)');
      return;
    }

    const escId = 'ESC-' + Math.floor(1000 + Math.random() * 9000).toString();
    const newEsc = {
      id: escId,
      target,
      summary,
      urgency,
      created_at: new Date().toISOString(),
      status: 'pending',
      evidence
    };

    const updated = [newEsc, ...history];
    localStorage.setItem('jn_mla_escalations', JSON.stringify(updated));
    setHistory(updated);

    const targetNames = {
      collector: 'District Collector',
      secretary: 'Department Secretary',
      minister: 'Department Minister'
    };

    const targetName = targetNames[target] || target.toUpperCase();
    toast.success(`Escalated to ${targetName}. Reference ID: #${escId}`);

    // Reset form
    setSummary('');
    setEvidence('');
  };

  const getTargetName = (key) => {
    const names = {
      collector: 'District Collector',
      secretary: 'Department Secretary',
      minister: 'Department Minister'
    };
    return names[key] || key.toUpperCase();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Title */}
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-[#1B5E20]/5 rounded-xl border border-[#1B5E20]/15 text-[#1B5E20]">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
          Direct High-Level Escalations
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        
        {/* Escalation Target dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1 block">
            1. {t('escalation_target')}
          </label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 outline-none px-4 py-3.5 rounded-2xl text-slate-800 dark:text-slate-100 font-bold text-sm shadow-sm transition-all cursor-pointer hover:border-slate-300"
          >
            <option value="collector">District Collector (IAS)</option>
            <option value="secretary">Department Secretary (IAS State Secretariat)</option>
            <option value="minister">Department Minister (Cabinet Level)</option>
          </select>
        </div>

        {/* Issue summary */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1 block">
            2. Issue Escalation Summary
          </label>
          <textarea
            required
            rows={4}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Outline the critical issue, timeline delays, or municipal grid failures that justify direct administrative escalation..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20] outline-none px-4 py-3.5 rounded-2xl text-slate-800 dark:text-slate-100 text-sm shadow-sm transition-colors resize-none placeholder-slate-400"
          ></textarea>
        </div>

        {/* Supporting evidence */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1 block">
            3. Upload Supporting Evidence / Report Document
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 shadow-sm rounded-xl px-4 py-3 text-slate-700 font-bold text-xs cursor-pointer transition-colors">
              <Camera className="w-4 h-4 text-[#1B5E20]" />
              <span>Attach Image / File</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
                className="hidden" 
              />
            </label>

            {evidence && (
              <div className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden shadow-sm relative">
                <img src={evidence} alt="Evidence" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setEvidence('')}
                  className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white text-[8px] font-black uppercase"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Urgency */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1 block">
            4. Escalation Urgency Classification
          </label>
          <div className="flex gap-4 pl-1">
            {['Normal', 'Urgent', 'Emergency'].map(level => (
              <label key={level} className="flex items-center gap-2 text-xs font-extrabold cursor-pointer text-slate-700 dark:text-slate-350">
                <input
                  type="radio"
                  name="urgency"
                  value={level}
                  checked={urgency === level}
                  onChange={() => setUrgency(level)}
                  className="w-4 h-4 text-[#1B5E20] border-slate-300 focus:ring-[#1B5E20]"
                />
                <span>{level}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] hover:from-[#003366] hover:to-[#004d99] text-white font-extrabold text-base py-4 rounded-2xl shadow-[0_8px_20px_rgba(27,94,32,0.15)] transition-all duration-300 flex items-center justify-center gap-2"
        >
          <span>Dispatch Escalation Record</span>
          <Send className="w-4.5 h-4.5" />
        </button>

      </form>

      {/* History table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2 pl-1">
          <History className="w-5 h-5 text-[#1B5E20]" />
          {t('past_escalations')}
        </h4>

        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3">ID</th>
                <th className="px-4 py-3">Escalated To</th>
                <th className="px-4 py-3">Urgency</th>
                <th className="px-4 py-3">Summary</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-slate-400 font-medium italic">
                    No past escalations found
                  </td>
                </tr>
              ) : (
                history.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="px-5 py-4 font-mono text-[#1B5E20]">#{row.id}</td>
                    <td className="px-4 py-4 uppercase whitespace-nowrap">{getTargetName(row.target)}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase ${
                        row.urgency === 'Emergency' ? 'bg-rose-100 text-rose-700' :
                        row.urgency === 'Urgent' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {row.urgency}
                      </span>
                    </td>
                    <td className="px-4 py-4 max-w-[200px] truncate font-medium text-slate-600 dark:text-slate-400">
                      {row.summary}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase ${
                        row.status === 'resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' :
                        row.status === 'acknowledged' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-450'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </motion.div>
  );
}
