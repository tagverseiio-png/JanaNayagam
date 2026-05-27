import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart2, FileText, Settings, TrendingUp, AlertTriangle } from 'lucide-react';

import PortalLayout from '../../shared/components/PortalLayout';
import CollectorDashboard from './CollectorDashboard';
import DistrictTickets from './DistrictTickets';
import WardManagement from './WardManagement';
import CollectorPerformance from './CollectorPerformance';

export default function CollectorPortal() {
  const { t } = useTranslation();

  const sidebarLinks = [
    {
      label: t('dashboard'),
      path: '/collector',
      icon: <BarChart2 />
    },
    {
      label: t('district_tickets'),
      path: '/collector/tickets',
      icon: <FileText />
    },
    {
      label: t('ward_management'),
      path: '/collector/wards',
      icon: <Settings />
    },
    {
      label: t('performance'),
      path: '/collector/performance',
      icon: <TrendingUp />
    },
    {
      label: t('escalate'),
      path: '/collector/escalations',
      icon: <AlertTriangle />
    }
  ];

  return (
    <PortalLayout sidebarLinks={sidebarLinks} roleLabel="District Collector (IAS) Control Portal">
      <Routes>
        <Route path="/" element={<CollectorDashboard />} />
        <Route path="/tickets" element={<DistrictTickets />} />
        <Route path="/wards" element={<WardManagement />} />
        <Route path="/performance" element={<CollectorPerformance />} />
        <Route path="/escalations" element={<DistrictTickets escalatedOnly={true} />} />
      </Routes>
    </PortalLayout>
  );
}
