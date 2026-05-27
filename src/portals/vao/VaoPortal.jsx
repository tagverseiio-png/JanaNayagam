import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart2, AlertTriangle, FileText } from 'lucide-react';

import PortalLayout from '../../shared/components/PortalLayout';
import VaoDashboard from './VaoDashboard';
import RaiseOnBehalf from './RaiseOnBehalf';
import VillageTickets from './VillageTickets';

export default function VaoPortal() {
  const { t } = useTranslation();

  const sidebarLinks = [
    {
      label: t('dashboard'),
      path: '/vao',
      icon: <BarChart2 />
    },
    {
      label: t('file') + ' (On Behalf)',
      path: '/vao/raise',
      icon: <AlertTriangle />
    },
    {
      label: 'Village Tickets',
      path: '/vao/tickets',
      icon: <FileText />
    }
  ];

  return (
    <PortalLayout sidebarLinks={sidebarLinks} roleLabel="Village Administrative Officer (VAO)">
      <Routes>
        <Route path="/" element={<VaoDashboard />} />
        <Route path="/raise" element={<RaiseOnBehalf />} />
        <Route path="/tickets" element={<VillageTickets />} />
      </Routes>
    </PortalLayout>
  );
}
