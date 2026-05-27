import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ label, value, icon, color }) {
  const iconBgs = {
    red: 'bg-rose-50 dark:bg-rose-950/20 text-[#8B1A1A] dark:text-rose-400',
    rose: 'bg-rose-50 dark:bg-rose-950/20 text-[#8B1A1A] dark:text-rose-400',
    blue: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
    green: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
    orange: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400',
    amber: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400',
    grey: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    slate: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
  };

  const activeIconBg = iconBgs[color] || iconBgs.blue;

  return (
    <motion.div 
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      className="bg-white dark:bg-slate-900 border border-[#DDE1E7] dark:border-slate-800 rounded-[12px] p-4 flex items-center justify-between shadow-sm relative overflow-hidden select-none w-full"
    >
      <div className="space-y-1">
        <span className="text-[24px] md:text-[28px] font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none block">
          {value}
        </span>
        <span className="text-[12px] md:text-[13px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
          {label}
        </span>
      </div>
      
      {icon && (
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${activeIconBg}`}>
          {React.cloneElement(icon, { className: 'w-4 h-4' })}
        </div>
      )}
    </motion.div>
  );
}
