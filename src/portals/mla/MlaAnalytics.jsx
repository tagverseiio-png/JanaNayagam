import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  TrendingUp, BarChart2, Calendar, MapPin, Users, Star, ArrowUpRight, AlertTriangle 
} from 'lucide-react';
import StatCard from '../../shared/components/StatCard';

export default function MlaAnalytics() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('jn_tickets') || '[]');
    setTickets(list);
  }, []);

  // Compute local tickets data if helpful, or use static high fidelity mocks combined with active ticket counts
  const roadsCount = tickets.filter(t => t.category === 'roads').length + 8;
  const waterCount = tickets.filter(t => t.category === 'water').length + 12;
  const electricityCount = tickets.filter(t => t.category === 'electricity').length + 5;
  const healthCount = tickets.filter(t => t.category === 'health').length + 2;
  const educationCount = tickets.filter(t => t.category === 'education').length + 1;
  const welfareCount = tickets.filter(t => t.category === 'welfare').length + 3;

  const categoriesData = [
    { name: t('categories.water'), count: waterCount, color: 'bg-blue-500' },
    { name: t('categories.roads'), count: roadsCount, color: 'bg-[#9a0002]' },
    { name: t('categories.electricity'), count: electricityCount, color: 'bg-amber-500' },
    { name: t('categories.welfare'), count: welfareCount, color: 'bg-indigo-500' },
    { name: t('categories.health'), count: healthCount, color: 'bg-emerald-500' },
    { name: t('categories.education'), count: educationCount, color: 'bg-teal-500' }
  ].sort((a, b) => b.count - a.count);

  const wardComparison = [
    { ward: '142', open: tickets.filter(t => t.status !== 'resolved').length + 14, resolved: 45, avgDays: 8, officer: 'Karthik Raj S.', isWorst: true },
    { ward: '140', open: 2, resolved: 12, avgDays: 3, officer: 'Suresh M.', isWorst: false },
    { ward: '141', open: 1, resolved: 14, avgDays: 2, officer: 'Anitha K.', isWorst: false },
    { ward: '143', open: 3, resolved: 18, avgDays: 4, officer: 'Ramya V.', isWorst: false },
    { ward: '144', open: 0, resolved: 22, avgDays: 2, officer: 'Selvam P.', isWorst: false },
    { ward: '145', open: 2, resolved: 19, avgDays: 3, officer: 'Divya N.', isWorst: false },
    { ward: '146', open: 1, resolved: 15, avgDays: 3, officer: 'Manoj S.', isWorst: false },
    { ward: '147', open: 0, resolved: 11, avgDays: 2, officer: 'Priya R.', isWorst: false }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
          Constituency Analytics Dashboard
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">
          Velachery Regional Performance Reports
        </p>
      </div>

      {/* Grid of Custom High-Fidelity Chart Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Category Bar Chart (Tailwind-based bar grid) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#1B5E20]">
            <BarChart2 className="w-5 h-5" />
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Grievances by Category
            </h4>
          </div>

          <div className="space-y-3.5 pt-2">
            {categoriesData.map((item, i) => {
              const maxCount = Math.max(...categoriesData.map(d => d.count));
              const percent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                    <span className="text-slate-500 font-mono">{item.count} tickets</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ delay: i * 0.1, duration: 0.8, ease: 'easeOut' }}
                      className={`h-full ${item.color} rounded-full`}
                    ></motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Last 30 Days Open vs Resolved Line Chart (SVG Line Chart) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#1B5E20]">
            <TrendingUp className="w-5 h-5" />
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">
              30-Day Resolution Index
            </h4>
          </div>

          <div className="h-48 w-full relative pt-4">
            {/* Custom SVG Line Chart */}
            <svg viewBox="0 0 300 120" className="w-full h-full">
              <defs>
                <linearGradient id="gradientOpen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9a0002" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#9a0002" stopOpacity="0.0"/>
                </linearGradient>
                <linearGradient id="gradientResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              
              {/* Horizontal Grid lines */}
              <line x1="0" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
              <line x1="0" y1="60" x2="300" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
              <line x1="0" y1="100" x2="300" y2="100" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />

              {/* Open tickets path (red) */}
              <path 
                d="M 10,80 Q 70,65 130,75 T 250,30" 
                fill="none" 
                stroke="#9a0002" 
                strokeWidth="3.5" 
                strokeLinecap="round"
              />
              <path 
                d="M 10,80 Q 70,65 130,75 T 250,30 L 250,110 L 10,110 Z" 
                fill="url(#gradientOpen)"
              />

              {/* Resolved tickets path (green) */}
              <path 
                d="M 10,20 Q 70,40 130,50 T 250,90" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="3.5" 
                strokeLinecap="round"
              />
              <path 
                d="M 10,20 Q 70,40 130,50 T 250,90 L 250,110 L 10,110 Z" 
                fill="url(#gradientResolved)"
              />

              {/* Point highlights */}
              <circle cx="250" cy="30" r="5" fill="#9a0002" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="250" cy="90" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
            </svg>

            {/* Legend */}
            <div className="flex justify-center items-center gap-4 text-[10px] font-black uppercase text-slate-500 pt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#9a0002] rounded-full"></span> Open Tickets
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-[#10b981] rounded-full"></span> Resolved Tickets
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Ward Comparison Performance Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm space-y-4 p-5">
        <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2 pl-1">
          <MapPin className="w-5 h-5 text-[#1B5E20]" />
          Ward Performance Metrics
        </h4>

        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5">Ward</th>
                <th className="px-4 py-3.5">Open Tickets</th>
                <th className="px-4 py-3.5">Resolved</th>
                <th className="px-4 py-3.5">Avg Days to Resolve</th>
                <th className="px-5 py-3.5">Assigned Officer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
              {wardComparison.map(row => (
                <tr 
                  key={row.ward} 
                  className={`transition-colors ${
                    row.isWorst 
                      ? 'bg-rose-50/70 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 font-extrabold border-l-4 border-l-rose-500' 
                      : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/10'
                  }`}
                >
                  <td className="px-5 py-4">Ward {row.ward}</td>
                  <td className="px-4 py-4">{row.open}</td>
                  <td className="px-4 py-4">{row.resolved}</td>
                  <td className="px-4 py-4 font-mono">{row.avgDays} days</td>
                  <td className="px-5 py-4 font-medium text-slate-600 dark:text-slate-400">
                    {row.officer}
                    {row.isWorst && (
                      <span className="ml-2 bg-rose-200 dark:bg-rose-900 text-rose-700 dark:text-rose-200 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                        Worst Rating
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top 3 most common issues in constituency */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <h4 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2 pl-1">
          <Star className="w-5 h-5 text-amber-500" />
          Top 3 Grievance Pain Points
        </h4>

        <div className="space-y-3">
          {[
            { rank: '1', title: 'Velachery Canal Water Leakages & Blocks', count: 18, emoji: '💧', desc: 'Silt blockages in storm drains leading to minor road overflows.' },
            { rank: '2', title: 'Main Junction Road Potholes', count: 12, emoji: '🛣️', desc: 'Heavy vehicle transit wearing down bitumen on roads.' },
            { rank: '3', title: ' temple street voltage drops', count: 8, emoji: '⚡', desc: 'Transformers requiring load realignment across ward grids.' }
          ].map((item, index) => (
            <div 
              key={item.rank}
              className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-950/20 border rounded-2xl shadow-sm hover:border-[#1B5E20]/45 transition-colors"
            >
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 border rounded-full flex items-center justify-center shrink-0 text-base font-black text-slate-700 dark:text-slate-350">
                #{item.rank}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-center text-sm font-black text-slate-850 dark:text-slate-150">
                  <span className="flex items-center gap-1.5">
                    <span>{item.emoji}</span>
                    <span>{item.title}</span>
                  </span>
                  <span className="text-xs text-[#1B5E20] font-bold shrink-0">{item.count} grievances</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  );
}
