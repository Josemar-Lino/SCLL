import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Pages
import AccessProfile from './pages/AccessProfile';
import Dashboard from './pages/Dashboard';
import DeliveryManagement from './pages/DeliveryManagement';
import AppointmentForm from './pages/AppointmentForm';
import SupervisorAppointment from './pages/SupervisorAppointment';
import DisplayBoard from './pages/DisplayBoard';
import UserManagement from './pages/UserManagement';
import BranchManagement from './pages/BranchManagement';
import PreparerManagement from './pages/PreparerManagement';
import VehicleForm from './pages/VehicleForm';
import PreparerAppointment from './pages/PreparerAppointment';
import VehicleRegistration from './pages/VehicleRegistration';
import AppointmentBoard from './pages/AppointmentBoard';

// Components
import Layout from './components/Layout';

// Protected Route component
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/access-profile" replace />;
};

const App = () => {
  return (
    <div className="app">
      <Routes>
        <Route path="/access-profile" element={<AccessProfile />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/delivery-management"
          element={
            <PrivateRoute>
              <Layout>
                <DeliveryManagement />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/appointment-form"
          element={
            <PrivateRoute>
              <Layout>
                <AppointmentForm />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/supervisor/appointment"
          element={
            <PrivateRoute>
              <Layout>
                <SupervisorAppointment />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/preparer/appointment"
          element={
            <PrivateRoute>
              <Layout>
                <PreparerAppointment />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <Layout>
                <UserManagement />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/branches"
          element={
            <PrivateRoute>
              <Layout>
                <BranchManagement />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/preparers"
          element={
            <PrivateRoute>
              <Layout>
                <PreparerManagement />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/vehicle-form"
          element={
            <PrivateRoute>
              <Layout>
                <VehicleForm />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/vehicle/registration"
          element={
            <PrivateRoute>
              <Layout>
                <VehicleRegistration />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/appointments/board"
          element={
            <PrivateRoute>
              <Layout>
                <AppointmentBoard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/access-profile" replace />} />
        <Route path="*" element={<Navigate to="/access-profile" replace />} />
      </Routes>
    </div>
  );
};

export default App;