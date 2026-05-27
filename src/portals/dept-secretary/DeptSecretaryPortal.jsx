import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart2, FileText, Layers, TrendingUp, AlertTriangle } from 'lucide-react';

import PortalLayout from '../../shared/components/PortalLayout';
import SecretaryDashboard from './SecretaryDashboard';
import BulkActions from './BulkActions';
import SecretaryReports from './SecretaryReports';
import EscalateMinister from './EscalateMinister';

export default function DeptSecretaryPortal() {
  const { t } = useTranslation();

  const sidebarLinks = [
    {
      label: t('dashboard'),
      path: '/dept-secretary',
      icon: <BarChart2 />
    },
    {
      label: t('bulk_actions'),
      path: '/dept-secretary/bulk',
      icon: <Layers />
    },
    {
      label: t('reports'),
      path: '/dept-secretary/reports',
      icon: <TrendingUp />
    },
    {
      label: t('escalate_minister'),
      path: '/dept-secretary/escalate',
      icon: <AlertTriangle />
    }
  ];

  return (
    <PortalLayout sidebarLinks={sidebarLinks} roleLabel="Department Secretary (IAS) Portal">
      <Routes>
        <Route path="/" element={<SecretaryDashboard />} />
        <Route path="/bulk" element={<BulkActions />} />
        <Route path="/reports" element={<SecretaryReports />} />
        <Route path="/escalate" element={<EscalateMinister />} />
      </Routes>
    </PortalLayout>
  );
}
