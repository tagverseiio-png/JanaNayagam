import React from 'react';
import { useTranslation } from 'react-i18next';

export default function StatusBadge({ status }) {
  const { t } = useTranslation();
  const normalized = (status || '').toLowerCase().replace(' ', '_');

  const styles = {
    open: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
    in_progress: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
    assigned: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
    resolved: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
    escalated: 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50',
    closed: 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
  };

  const getTranslationKey = () => {
    if (normalized === 'assigned' || normalized === 'in_progress') return 'status_labels.in_progress';
    if (normalized === 'open') return 'status_labels.open';
    if (normalized === 'resolved') return 'status_labels.resolved';
    if (normalized === 'escalated') return 'status_labels.escalated';
    if (normalized === 'closed') return 'status_labels.closed';
    return 'status_labels.open';
  };

  const currentStyle = styles[normalized] || styles.open;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${currentStyle}`}>
      {t(getTranslationKey())}
    </span>
  );
}
