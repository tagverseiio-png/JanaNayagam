import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  TrendingUp, BarChart2, PieChart, Star, MapPin, CheckCircle, HelpCircle 
} from 'lucide-react';
import StatCard from '../../shared/components/StatCard';

export default function CollectorPerformance() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState([]);
  const [chartMode, setChartMode] = useState('top'); // top or bottom wards

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('jn_tickets') || '[]');
    setTickets(list);
  }, []);

  // Compute dynamic category distribution district-wide
  const getCategoryCount = (cat) => {
    return tickets.filter(t => t.category.toLowerCase() === cat).length + 4; // Mock baseline
  };

  const categories = [
    { name: t('categories.water'), count: getCategoryCount('water'), color: '#3b82f6', dash: '0 100' },
    { name: t('categories.roads'), count: getCategoryCount('roads'), color: '#ef4444', dash: '0 100' },
    { name: t('categories.electricity'), count: getCategoryCount('electricity'), color: '#f59e0b', dash: '0 100' },
    { name: t('categories.sanitation'), count: getCategoryCount('sanitation'), color: '#10b981', dash: '0 100' },
    { name: t('categories.welfare'), count: getCategoryCount('welfare'), color: '#6366f1', dash: '0 100' }
  ];

  const totalCategoryTickets = categories.reduce((sum, item) => sum + item.count, 0);

  // Compute SVG Donut segment properties
  let accumulatedPercent = 0;
  const categoriesWithAngles = categories.map(cat => {
    const percent = totalCategoryTickets > 0 ? (cat.count / totalCategoryTickets) * 100 : 0;
    const startAngle = (accumulatedPercent / 100) * 360;
    accumulatedPercent += percent;
    const endAngle = (accumulatedPercent / 100) * 360;
    
    // Circumference of SVG circle with r=15.91549430918954 is 100
    // strokeDasharray = "percent gap"
    const strokeDash = `${percent.toFixed(1)} ${(100 - percent).toFixed(1)}`;
    const strokeOffset = (100 - (startAngle / 360) * 100).toFixed(1);

    return {
      ...cat,
      percent,
      strokeDash,
      strokeOffset
    };
  });

  // Top 5 / Bottom 5 resolution rates
  const topWards = [
    { name: 'Ward 144 (Velachery)', rate: 98, color: 'bg-emerald-500' },
    { name: 'Ward 141 (Velachery)', rate: 95, color: 'bg-emerald-500' },
    { name: 'Ward 147 (Sholinganallur)', rate: 92, color: 'bg-emerald-500' },
    { name: 'Ward 131 (Guindy)', rate: 90, color: 'bg-emerald-500' },
    { name: 'Ward 140 (Velachery)', rate: 88, color: 'bg-emerald-500' }
  ];

  const bottomWards = [
    { name: 'Ward 142 (Velachery)', rate: 45, color: 'bg-rose-500' },
    { name: 'Ward 120 (Mylapore)', rate: 58, color: 'bg-rose-500' },
    { name: 'Ward 146 (Sholinganallur)', rate: 62, color: 'bg-rose-500' },
    { name: 'Ward 121 (Mylapore)', rate: 68, color: 'bg-rose-500' },
    { name: 'Ward 130 (Guindy)', rate: 72, color: 'bg-rose-500' }
  ];

  const activeWardsChart = chartMode === 'top' ? topWards : bottomWards;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
          {t('performance')} Analytics Index
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">
          Chennai district-wide performance graphs and resolution indexes
        </p>
      </div>

      {/* Grid containing the High-Fidelity SVG Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Top/Bottom Wards Resolution Rate (Tailwind-based bar chart with toggler) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div className="flex items-center gap-2 text-[#003366]">
              <BarChart2 className="w-5 h-5" />
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">
                Resolution Rate by Ward
              </h4>
            </div>

            {/* Toggle chart mode */}
            <div className="flex rounded-xl p-0.5 bg-slate-100 dark:bg-slate-800 border shadow-inner">
              <button
                onClick={() => setChartMode('top')}
                className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                  chartMode === 'top'
                    ? 'bg-[#003366] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Top 5
              </button>
              <button
                onClick={() => setChartMode('bottom')}
                className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                  chartMode === 'bottom'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Bottom 5
              </button>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {activeWardsChart.map((ward, i) => (
              <div key={ward.name} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-350">{ward.name}</span>
                  <span className="text-slate-500 font-mono">{ward.rate}% resolved</span>
                </div>
                <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${ward.rate}%` }}
                    transition={{ delay: i * 0.15, duration: 0.8, ease: 'easeOut' }}
                    className={`h-full ${ward.color} rounded-full`}
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. District Category Distribution Donut Chart (SVG Circle-based chart) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#003366]">
            <PieChart className="w-5 h-5" />
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Complaints Category Distribution
            </h4>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            
            {/* SVG Donut Circle */}
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
                <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f1f5f9" strokeWidth="4.5" />
                
                {categoriesWithAngles.map(cat => (
                  <circle
                    key={cat.name}
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke={cat.color}
                    strokeWidth="4.5"
                    strokeDasharray={cat.strokeDash}
                    strokeDashoffset={cat.strokeOffset}
                    className="transition-all duration-1000"
                  />
                ))}
              </svg>

              {/* Centered Total Indicator */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total</span>
                <span className="text-lg font-black text-slate-850 dark:text-slate-100 font-mono mt-0.5">{totalCategoryTickets}</span>
              </div>
            </div>

            {/* Color Legend Grid */}
            <div className="flex-1 space-y-2.5">
              {categoriesWithAngles.map(cat => (
                <div key={cat.name} className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></span>
                    <span className="text-slate-700 dark:text-slate-350">{cat.name}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px]">{cat.percent.toFixed(0)}%</span>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

      {/* District-wide Achievement Highlights */}
      <div className="bg-[#003366]/5 border border-[#003366]/15 rounded-3xl p-6 shadow-sm space-y-4">
        <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2 pl-1">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          District Grievances Resolution Performance Index
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
          The district has maintained a <strong>74% overall resolution index</strong> this month, showing a 4% increase in BDO block-level response timelines compared to last quarter. Velachery Ward 144 stands as the highest performing municipal ward with an average grievance closure time of 2.1 days.
        </p>
      </div>

    </motion.div>
  );
}
