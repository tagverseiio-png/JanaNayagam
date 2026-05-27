import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart2, FileText, ShieldAlert } from 'lucide-react';

import PortalLayout from '../../shared/components/PortalLayout';
import DroDashboard from './DroDashboard';
import RevenueTickets from './RevenueTickets';

export default function DroPortal() {
  const { t } = useTranslation();

  const sidebarLinks = [
    {
      label: t('dashboard'),
      path: '/dro',
      icon: <BarChart2 />
    },
    {
      label: t('revenue_tickets'),
      path: '/dro/tickets',
      icon: <FileText />
    },
    {
      label: t('flagged_to_collector'),
      path: '/dro/flagged',
      icon: <ShieldAlert />
    }
  ];

  return (
    <PortalLayout sidebarLinks={sidebarLinks} roleLabel="District Revenue Officer (DRO) Portal">
      <Routes>
        <Route path="/" element={<DroDashboard />} />
        <Route path="/tickets" element={<RevenueTickets flaggedOnly={false} />} />
        <Route path="/flagged" element={<RevenueTickets flaggedOnly={true} />} />
      </Routes>
    </PortalLayout>
  );
}
