import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  TrendingUp, Calendar, FileText, Printer, Download, X, HelpCircle 
} from 'lucide-react';

export default function SecretaryReports() {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const districtsList = [
    'Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli', 'Tirunelveli', 'Vellore', 
    'Erode', 'Thanjavur', 'Thoothukudi', 'Dindigul', 'Kancheepuram', 'Cuddalore', 'Nagapattinam'
  ];

  // Mock report dataset that uses reproducible hashes based on date selections
  const generateReportData = () => {
    // Generate dates based calculations to simulate true filtering
    const startNum = startDate ? new Date(startDate).getTime() % 10 : 3;
    const endNum = endDate ? new Date(endDate).getTime() % 10 : 7;
    const offset = Math.abs(endNum - startNum) + 1;

    return districtsList.map(dist => {
      const hash = dist.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const open = (hash % 15) + offset;
      const resolved = (hash % 25) + (offset * 2);
      const breach = Math.round(((hash % 18) / (open || 1)) * 100) % 40;
      const avgDays = (hash % 6) + 3;

      return {
        name: dist,
        open,
        resolved,
        breach,
        avgDays
      };
    });
  };

  const reportData = generateReportData();

  const handleGenerateReport = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error('Both start and end dates are required');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date cannot be after end date');
      return;
    }

    setReportModalOpen(true);
    toast.success('Grievance performance report compiled successfully');
  };

  // Trigger browser window print
  const handlePrint = () => {
    window.print();
  };

  // Generate and download raw CSV file
  const handleDownloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "District,Open Complaints,Resolved,Breach %,Avg Resolution Days (SLA)\n";

    reportData.forEach(row => {
      csvContent += `${row.name},${row.open},${row.resolved},${row.breach}%,${row.avgDays}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Secretariat_Grievance_Report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Spreadsheet CSV download completed');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Title */}
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-[#1B5E20]/5 rounded-xl border border-[#1B5E20]/15 text-[#1B5E20]">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
            Statewide Grievances {t('reports')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">
            Compile performance audits and temporal resolution reports
          </p>
        </div>
      </div>

      {/* Date Pickers Form */}
      <form onSubmit={handleGenerateReport} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 text-[#1B5E20] border-b pb-3 pl-1">
          <Calendar className="w-5 h-5 text-[#1B5E20]" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Temporal Search Boundary
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Start Date */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 block">
              Start Date
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border outline-none px-4 py-3 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-350 focus:border-[#1B5E20]"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 block">
              End Date
            </label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border outline-none px-4 py-3 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-350 focus:border-[#1B5E20]"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] hover:from-[#003366] hover:to-[#004d99] text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          <span>Compile Grievance Performance Audit</span>
        </button>
      </form>

      {/* PRINTABLE AUDIT SUMMARY REPORT MODAL */}
      <AnimatePresence>
        {reportModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 print:border-none print:shadow-none print:bg-white print:text-black my-8"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 print:hidden">
                <h4 className="font-black text-[#1B5E20] text-base uppercase flex items-center gap-1.5">
                  <FileText className="w-5 h-5" />
                  <span>Statewide Performance Audit Report</span>
                </h4>
                <button onClick={() => setReportModalOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Printable Content Block */}
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#1B5E20] bg-[#1B5E20]/5 px-2 py-0.5 rounded border border-[#1B5E20]/15 print:border-black">
                    Tamil Nadu Government Secretariat
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide">
                    Grievance Performance Summary Audit
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500 font-mono">
                    Temporal Boundary: {startDate} to {endDate}
                  </p>
                </div>

                <div className="overflow-x-auto rounded-2xl border print:border-black">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-wider print:bg-slate-100 print:text-black print:border-black">
                        <th className="px-5 py-3">District Name</th>
                        <th className="px-4 py-3">Open Grievances</th>
                        <th className="px-4 py-3">Resolved</th>
                        <th className="px-4 py-3">SLA Breach %</th>
                        <th className="px-5 py-3">Avg Resolution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-bold text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900 print:text-black print:divide-black">
                      {reportData.map(row => (
                        <tr key={row.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <td className="px-5 py-3 font-extrabold text-slate-800 dark:text-slate-200 print:text-black">{row.name} District</td>
                          <td className="px-4 py-3 font-mono text-rose-600">{row.open} open</td>
                          <td className="px-4 py-3 font-mono text-emerald-600">{row.resolved} items</td>
                          <td className="px-4 py-3 font-mono text-amber-600">{row.breach}%</td>
                          <td className="px-5 py-3 font-mono">{row.avgDays} days</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons pane */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-3 print:hidden">
                {/* Download CSV */}
                <button
                  onClick={handleDownloadCSV}
                  className="flex items-center gap-1 text-[10.5px] font-black uppercase px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white hover:bg-slate-50 text-slate-700 dark:text-slate-350 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('download_csv')}</span>
                </button>

                {/* Print */}
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1 text-[10.5px] font-black uppercase px-4 py-2.5 bg-[#1B5E20] hover:bg-[#003366] text-white rounded-xl shadow-md transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
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
