import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  FileText, Landmark, Printer, X, Download, ShieldCheck, TrendingUp, AlertTriangle
} from 'lucide-react';

export default function CabinetReport() {
  const { t } = useTranslation();
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // High fidelity Cabinet mock data
  const stateSummary = {
    totalOpen: 456,
    totalResolved: 3409,
    slaBreachRate: 14,
    emergencyStatus: 'Active Emergency Protocols (Accelerated 12h SLA)'
  };

  const topDistricts = [
    { rank: '1', name: 'Chennai District', rate: 96, open: 12 },
    { rank: '2', name: 'Coimbatore District', rate: 94, open: 8 },
    { rank: '3', name: 'Madurai District', rate: 92, open: 14 },
    { rank: '4', name: 'Salem District', rate: 90, open: 11 },
    { rank: '5', name: 'Vellore District', rate: 88, open: 15 }
  ];

  const bottomDistricts = [
    { rank: '38', name: 'Ariyalur District', rate: 42, open: 64 },
    { rank: '37', name: 'Dharmapuri District', rate: 48, open: 52 },
    { rank: '36', name: 'Cuddalore District', rate: 52, open: 48 },
    { rank: '35', name: 'Nagapattinam District', rate: 55, open: 41 },
    { rank: '34', name: 'Karur District', rate: 58, open: 39 }
  ];

  const topCategories = [
    { name: t('categories.water'), count: 145, percentage: 32 },
    { name: t('categories.roads'), count: 122, percentage: 27 },
    { name: t('categories.electricity'), count: 72, percentage: 16 },
    { name: t('categories.sanitation'), count: 68, percentage: 15 },
    { name: t('categories.welfare'), count: 49, percentage: 10 }
  ];

  const deptBreakdown = [
    { dept: 'Municipal Roads', open: 122, resolved: 890, speed: '3.4 days' },
    { dept: 'Water Resources', open: 145, resolved: 1045, speed: '4.2 days' },
    { dept: 'Energy Department', open: 72, resolved: 654, speed: '2.1 days' },
    { dept: 'Health Ministry', open: 32, resolved: 412, speed: '1.8 days' },
    { dept: 'School Education', open: 18, resolved: 231, speed: '2.5 days' }
  ];

  const handleGenerateReport = () => {
    setReportModalOpen(true);
    toast.success('Cabinet Summary Audit Report compiled successfully');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Title */}
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-[#003366]/5 rounded-xl border border-[#003366]/15 text-[#003366] dark:text-sky-400">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
            State Cabinet Summary Report
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">
            Compile statewide grievance metrics and ministerial portfolios audit reports
          </p>
        </div>
      </div>

      {/* Generate Report Form Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 flex flex-col items-center text-center">
        <div className="max-w-md space-y-2">
          <Landmark className="w-12 h-12 text-[#003366] mx-auto" />
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100 mt-2">
            State Executive Grievances Audit Summary
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Compiling this cabinet report queries statewide districts, aggregates sector counts, compiles resolution rate ratios, and generates printable summary audits matching CM executive styles.
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-[#003366] to-[#0055aa] hover:from-[#FF6600] hover:to-[#ff802b] text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2"
        >
          <FileText className="w-4.5 h-4.5" />
          <span>{t('generate_cabinet_summary')}</span>
        </button>
      </div>

      {/* PRINTABLE CABINET REPORT SUMMARY MODAL */}
      <AnimatePresence>
        {reportModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 print:border-none print:shadow-none print:bg-white print:text-black my-8"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 print:hidden">
                <h4 className="font-black text-[#003366] dark:text-slate-100 text-base uppercase flex items-center gap-1.5">
                  <FileText className="w-5 h-5" />
                  <span>State Cabinet Grievance Summary Audit</span>
                </h4>
                <button onClick={() => setReportModalOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Printable Content Block */}
              <div className="space-y-6 text-left">
                
                {/* Official Cover Title */}
                <div className="text-center space-y-1.5 border-b pb-4 print:border-black">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6600] bg-[#FF6600]/5 px-3 py-0.5 rounded border border-[#FF6600]/15 print:border-black">
                    Chief Minister's Cabinet Council
                  </span>
                  <h3 className="text-xl font-black text-[#003366] dark:text-white uppercase tracking-wide">
                    Tamil Nadu Statewide Grievance Summary Audit
                  </h3>
                  <p className="text-[9px] font-bold text-slate-400 font-mono">
                    Report Compiled: {new Date().toLocaleDateString()} • CM-CMD-AUDIT
                  </p>
                </div>

                {/* 1. Statewide Executive Summary */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-[#003366] uppercase tracking-widest block border-l-4 border-l-[#FF6600] pl-2 leading-none">
                    1. Statewide Executive Summary
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold bg-slate-50 dark:bg-slate-950/20 p-4 rounded-2xl border print:border-black print:text-black">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">Total open</span>
                      <span className="text-slate-800 dark:text-slate-100 text-sm font-black print:text-black">{stateSummary.totalOpen} active</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">Resolved this month</span>
                      <span className="text-slate-800 dark:text-slate-100 text-sm font-black print:text-black">{stateSummary.totalResolved} items</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">SLA Breach Ratio</span>
                      <span className="text-slate-800 dark:text-slate-100 text-sm font-black print:text-black">{stateSummary.slaBreachRate}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block mb-0.5">Emergency protocol</span>
                      <span className="text-emerald-600 text-[10px] font-black block leading-tight">{stateSummary.emergencyStatus}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Top & Bottom 5 Districts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Top 5 Wards / Districts */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-[#138808] uppercase tracking-widest block border-l-4 border-l-[#138808] pl-2 leading-none">
                      Top 5 Districts (Resolution Rate)
                    </span>
                    <div className="border rounded-2xl overflow-hidden print:border-black">
                      <table className="w-full text-left border-collapse text-[10px]">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800 border-b text-[8px] font-black text-slate-500 uppercase tracking-wider print:bg-slate-100 print:text-black print:border-black">
                            <th className="px-3 py-2">District</th>
                            <th className="px-3 py-2">Resolution Rate</th>
                            <th className="px-3 py-2">Active Open</th>
                          </tr>
                        </thead>
                        <tbody className="font-bold text-slate-700 dark:text-slate-350 print:text-black">
                          {topDistricts.map(row => (
                            <tr key={row.name} className="border-b dark:border-slate-800 print:border-black">
                              <td className="px-3 py-2">#{row.rank} {row.name}</td>
                              <td className="px-3 py-2 font-mono text-emerald-600">{row.rate}%</td>
                              <td className="px-3 py-2 font-mono">{row.open} open</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Bottom 5 Districts */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest block border-l-4 border-l-rose-500 pl-2 leading-none">
                      Bottom 5 Districts (Requires Action)
                    </span>
                    <div className="border rounded-2xl overflow-hidden print:border-black">
                      <table className="w-full text-left border-collapse text-[10px]">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800 border-b text-[8px] font-black text-slate-500 uppercase tracking-wider print:bg-slate-100 print:text-black print:border-black">
                            <th className="px-3 py-2">District</th>
                            <th className="px-3 py-2">Resolution Rate</th>
                            <th className="px-3 py-2">Active Open</th>
                          </tr>
                        </thead>
                        <tbody className="font-bold text-slate-700 dark:text-slate-350 print:text-black">
                          {bottomDistricts.map(row => (
                            <tr key={row.name} className="border-b dark:border-slate-800 print:border-black">
                              <td className="px-3 py-2">#{row.rank} {row.name}</td>
                              <td className="px-3 py-2 font-mono text-rose-600">{row.rate}%</td>
                              <td className="px-3 py-2 font-mono text-rose-600">{row.open} open</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* 3. Top Issue Categories */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-[#003366] uppercase tracking-widest block border-l-4 border-l-[#FF6600] pl-2 leading-none">
                    3. Statewide Sector Grievances Distribution
                  </span>
                  <div className="border rounded-2xl overflow-hidden print:border-black">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800 border-b text-[8px] font-black text-slate-500 uppercase tracking-wider print:bg-slate-100 print:text-black print:border-black">
                          <th className="px-5 py-2">Sector / Category</th>
                          <th className="px-4 py-2">Statewide Open Complaints</th>
                          <th className="px-5 py-2">Distribution Ratio</th>
                        </tr>
                      </thead>
                      <tbody className="font-bold text-slate-700 dark:text-slate-350 print:text-black">
                        {topCategories.map(row => (
                          <tr key={row.name} className="border-b dark:border-slate-800 print:border-black">
                            <td className="px-5 py-2">{row.name} Sector</td>
                            <td className="px-4 py-2 font-mono text-rose-600">{row.count} active</td>
                            <td className="px-5 py-2 font-mono">{row.percentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Department-wise breakdown */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-[#003366] uppercase tracking-widest block border-l-4 border-l-[#FF6600] pl-2 leading-none">
                    4. Ministerial Portfolio Performance Metrics
                  </span>
                  <div className="border rounded-2xl overflow-hidden print:border-black">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800 border-b text-[8px] font-black text-slate-500 uppercase tracking-wider print:bg-slate-100 print:text-black print:border-black">
                          <th className="px-5 py-2">Cabinet Ministry Portfolio</th>
                          <th className="px-4 py-2">Active Open</th>
                          <th className="px-4 py-2">Resolved Grid</th>
                          <th className="px-5 py-2">Avg SLA resolution speed</th>
                        </tr>
                      </thead>
                      <tbody className="font-bold text-slate-700 dark:text-slate-350 print:text-black">
                        {deptBreakdown.map(row => (
                          <tr key={row.dept} className="border-b dark:border-slate-800 print:border-black">
                            <td className="px-5 py-2">{row.dept}</td>
                            <td className="px-4 py-2 font-mono text-rose-600">{row.open} open</td>
                            <td className="px-4 py-2 font-mono text-emerald-600">{row.resolved} items</td>
                            <td className="px-5 py-2 font-mono">{row.speed}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Action buttons print */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-3 print:hidden">
                <button
                  onClick={() => setReportModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-650 font-bold text-xs uppercase"
                >
                  Close
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 text-[10.5px] font-black uppercase px-4 py-2.5 bg-[#003366] hover:bg-[#FF6600] text-white rounded-xl shadow-md transition-all"
                >
                  <Printer className="w-4.5 h-4.5" />
                  <span>{t('print')}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
