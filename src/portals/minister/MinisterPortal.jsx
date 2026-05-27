import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart2, ShieldAlert, Zap, AlertTriangle } from 'lucide-react';

import PortalLayout from '../../shared/components/PortalLayout';
import MinisterDashboard from './MinisterDashboard';
import CrisisMode from './CrisisMode';
import EscalateCm from './EscalateCm';

export default function MinisterPortal() {
  const { t } = useTranslation();

  const sidebarLinks = [
    {
      label: t('dashboard'),
      path: '/minister',
      icon: <BarChart2 />
    },
    {
      label: t('dept_view'),
      path: '/minister/dept',
      icon: <ShieldAlert />
    },
    {
      label: t('crisis_mode'),
      path: '/minister/crisis',
      icon: <Zap />
    },
    {
      label: t('escalate_cm'),
      path: '/minister/escalate',
      icon: <AlertTriangle />
    }
  ];

  return (
    <PortalLayout sidebarLinks={sidebarLinks} roleLabel="Cabinet Minister Portal">
      <Routes>
        <Route path="/" element={<MinisterDashboard />} />
        <Route path="/dept" element={<MinisterDashboard deptView={true} />} />
        <Route path="/crisis" element={<CrisisMode />} />
        <Route path="/escalate" element={<EscalateCm />} />
      </Routes>
    </PortalLayout>
  );
}
