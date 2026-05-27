import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart2, FileText, AlertTriangle, ArrowUpRight, TrendingUp } from 'lucide-react';

import PortalLayout from '../../shared/components/PortalLayout';
import MlaDashboard from './MlaDashboard';
import ConstituencyTickets from './ConstituencyTickets';
import RaiseIssue from './RaiseIssue';
import MlaAnalytics from './MlaAnalytics';
import Escalate from './Escalate';

export default function MlaPortal() {
  const { t } = useTranslation();

  const sidebarLinks = [
    {
      label: t('dashboard'),
      path: '/mla',
      icon: <BarChart2 />
    },
    {
      label: 'Constituency Tickets',
      path: '/mla/tickets',
      icon: <FileText />
    },
    {
      label: t('raise_issue'),
      path: '/mla/raise',
      icon: <AlertTriangle />
    },
    {
      label: 'Analytics',
      path: '/mla/analytics',
      icon: <TrendingUp />
    },
    {
      label: 'Escalate',
      path: '/mla/escalate',
      icon: <ArrowUpRight />
    }
  ];

  return (
    <PortalLayout sidebarLinks={sidebarLinks} roleLabel="Member of Legislative Assembly (MLA) Portal">
      <Routes>
        <Route path="/" element={<MlaDashboard />} />
        <Route path="/tickets" element={<ConstituencyTickets />} />
        <Route path="/raise" element={<RaiseIssue />} />
        <Route path="/analytics" element={<MlaAnalytics />} />
        <Route path="/escalate" element={<Escalate />} />
      </Routes>
    </PortalLayout>
  );
}
