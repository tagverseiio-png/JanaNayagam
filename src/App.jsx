import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useTranslation } from 'react-i18next';

// Import LoginPage
import LoginPage from './pages/LoginPage';

// Import Portal Components
import CitizenPortal from './portals/citizen/CitizenPortal';
import VaoPortal from './portals/vao/VaoPortal';
import WardOfficerPortal from './portals/ward-officer/WardOfficerPortal';
import BdoPortal from './portals/bdo/BdoPortal';
import DroPortal from './portals/dro/DroPortal';
import CollectorPortal from './portals/collector/CollectorPortal';
import DeptSecretaryPortal from './portals/dept-secretary/DeptSecretaryPortal';
import MinisterPortal from './portals/minister/MinisterPortal';
import CmPortal from './portals/cm/CmPortal';
import MlaPortal from './portals/mla/MlaPortal';

// Route Guard for Protected Routes
const ProtectedRoute = ({ requiredRole, children }) => {
  const role = localStorage.getItem('jn_role');
  if (role === requiredRole) {
    return children;
  }
  return <Navigate to="/" replace />;
};

export default function App() {
  const { i18n } = useTranslation();
  const [isMobile, setIsMobile] = React.useState(false);

  useEffect(() => {
    // 1. Mobile responsive check for toast placement
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // 2. Restore Elderly Mode on load
    const isElderly = localStorage.getItem('jn_elderly_mode') === 'true';
    if (isElderly) {
      document.body.classList.add('elderly-mode');
    } else {
      document.body.classList.remove('elderly-mode');
    }

    // 3. Set default title
    if (window.location.pathname === '/') {
      document.title = 'JanaNayagam | Login';
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sync Tamil Mode Font Class
  useEffect(() => {
    if (i18n.language === 'ta') {
      document.body.classList.add('tamil-mode');
    } else {
      document.body.classList.remove('tamil-mode');
    }
  }, [i18n.language]);

  return (
    <>
      <Toaster 
        position={isMobile ? "top-center" : "top-right"} 
        duration={4000} 
        richColors 
      />
      <Router>
        <Routes>
          {/* Public Login Route */}
          <Route path="/" element={<LoginPage />} />

          {/* Protected Portal Routes for all 9 Roles */}
          <Route 
            path="/citizen/*" 
            element={
              <ProtectedRoute requiredRole="citizen">
                <CitizenPortal />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/vao/*" 
            element={
              <ProtectedRoute requiredRole="vao">
                <VaoPortal />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/ward-officer/*" 
            element={
              <ProtectedRoute requiredRole="ward_officer">
                <WardOfficerPortal />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/bdo/*" 
            element={
              <ProtectedRoute requiredRole="bdo">
                <BdoPortal />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/mla/*" 
            element={
              <ProtectedRoute requiredRole="mla">
                <MlaPortal />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dro/*" 
            element={
              <ProtectedRoute requiredRole="dro">
                <DroPortal />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/collector/*" 
            element={
              <ProtectedRoute requiredRole="collector">
                <CollectorPortal />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dept-secretary/*" 
            element={
              <ProtectedRoute requiredRole="dept_secretary">
                <DeptSecretaryPortal />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/minister/*" 
            element={
              <ProtectedRoute requiredRole="minister">
                <MinisterPortal />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/cm/*" 
            element={
              <ProtectedRoute requiredRole="cm">
                <CmPortal />
              </ProtectedRoute>
            } 
          />

          {/* Fallback to Login page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}
