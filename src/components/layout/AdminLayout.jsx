import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import Spinner from '../ui/Spinner.jsx';

const AdminLayout = () => {
  const { admin, checkAuth, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
    };
    initAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Redirect if not authorized
    if (!isLoading && !admin) {
      navigate('/login');
    }
  }, [admin, isLoading, navigate]);

  if (isLoading && !admin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <div className="ml-[260px] min-h-screen flex flex-col">
        {/* Top Header */}
        <TopBar />

        {/* Dynamic Nested Content */}
        <main className="flex-1 p-8 pt-24 bg-primary-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
