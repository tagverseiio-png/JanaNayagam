import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Eye, User, ArrowUpRight, Check, CheckSquare } from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import StatusBadge from './StatusBadge';
import SlaTimer from './SlaTimer';

export default function TicketCard({ ticket, role, onAction }) {
  const { t } = useTranslation();
  const { id, category, description, status, priority, created_at, sla_deadline, ward, district, citizen_name } = ticket;

  const priorityClasses = {
    low: 'ticket-border-low',
    medium: 'ticket-border-medium',
    high: 'ticket-border-high',
    critical: 'ticket-border-critical'
  };

  const borderClass = priorityClasses[(priority || '').toLowerCase()] || 'ticket-border-medium';

  const handleActionClick = (e, actionType) => {
    e.stopPropagation();
    if (onAction) {
      onAction(id, actionType);
    }
  };

  const handleCardClick = () => {
    if (onAction) {
      onAction(id, 'view');
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`w-full bg-white dark:bg-slate-900 border border-[#DDE1E7] dark:border-slate-800 rounded-[12px] p-[14px] flex flex-col gap-3 shadow-sm hover:shadow-md transition-all cursor-pointer ${borderClass} select-none`}
    >
      {/* Row 1: Category Icon + Name (left) + Status Badge (right) */}
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          <CategoryIcon category={category} />
          <span className="text-[13px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">
            {t(`categories.${category.toLowerCase()}`)}
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-450">
            #{id}
          </span>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Row 2: Description (2 lines max, ellipsis) */}
      <p 
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}
        className="text-[13px] text-slate-650 dark:text-slate-350 font-bold leading-normal pr-1"
      >
        {description}
      </p>

      {/* Row 3: Ward + Location (left) + SLA Timer (right) */}
      <div className="flex justify-between items-center w-full text-[12px] text-slate-450 dark:text-slate-500 font-bold">
        <div className="flex items-center gap-3">
          {ward && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#8B1A1A]" />
              <span>Ward {ward}</span>
            </span>
          )}
          {district && (
            <span className="hidden sm:inline-block">· {district}</span>
          )}
        </div>
        {status !== 'resolved' && status !== 'closed' && sla_deadline && (
          <SlaTimer sla_deadline={sla_deadline} />
        )}
      </div>

      {/* Row 4: Action Buttons (horizontal scroll if many) */}
      <div className="w-full overflow-x-auto hide-scrollbar pt-1 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 mt-1">
        <span className="text-[11px] text-slate-400 font-bold uppercase truncate max-w-[120px]">
          {citizen_name || 'Anonymous'}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* View Button */}
          <button
            onClick={(e) => handleActionClick(e, 'view')}
            className="h-[34px] px-3 text-[13px] font-black uppercase rounded-lg border border-[#DDE1E7] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t('actions.view')}</span>
          </button>

          {/* Role specific actions */}
          {role !== 'citizen' && role !== undefined && (
            <>
              {role === 'vao' && (
                <>
                  <button
                    onClick={(e) => handleActionClick(e, 'assign')}
                    className="h-[34px] px-3 text-[13px] font-black uppercase rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{t('actions.assign')}</span>
                  </button>
                  <button
                    onClick={(e) => handleActionClick(e, 'escalate')}
                    className="h-[34px] px-3 text-[13px] font-black uppercase rounded-lg bg-[#8B1A1A] text-white hover:bg-red-800 transition-colors shadow-sm flex items-center gap-1"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>{t('actions.escalate')}</span>
                  </button>
                </>
              )}

              {role === 'ward_officer' && (
                <>
                  <button
                    onClick={(e) => handleActionClick(e, 'close')}
                    className="h-[34px] px-3 text-[13px] font-black uppercase rounded-lg bg-[#8B1A1A] text-white hover:bg-red-800 transition-colors shadow-sm flex items-center gap-1"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>{t('actions.close')}</span>
                  </button>
                </>
              )}

              {role === 'bdo' && (
                <>
                  <button
                    onClick={(e) => handleActionClick(e, 'assign')}
                    className="h-[34px] px-3 text-[13px] font-black uppercase rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1"
                  >
                    <span>{t('actions.assign')}</span>
                  </button>
                  <button
                    onClick={(e) => handleActionClick(e, 'close')}
                    className="h-[34px] px-3 text-[13px] font-black uppercase rounded-lg bg-slate-600 text-white hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-1"
                  >
                    <span>{t('actions.close')}</span>
                  </button>
                </>
              )}

              {role !== 'vao' && role !== 'ward_officer' && role !== 'bdo' && (
                <>
                  <button
                    onClick={(e) => handleActionClick(e, 'escalate')}
                    className="h-[34px] px-3 text-[13px] font-black uppercase rounded-lg bg-[#8B1A1A] text-white hover:bg-red-800 transition-colors shadow-sm flex items-center gap-1"
                  >
                    <span>{t('actions.escalate')}</span>
                  </button>
                  <button
                    onClick={(e) => handleActionClick(e, 'close')}
                    className="h-[34px] px-3 text-[13px] font-black uppercase rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1"
                  >
                    <span>{t('actions.close')}</span>
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

    </div>
  );
}
