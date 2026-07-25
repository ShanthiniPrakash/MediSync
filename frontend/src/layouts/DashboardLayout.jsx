import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const DashboardLayout = () => {
  return (
    <div className="d-flex min-vh-100">
      {/* Responsive Sidebar */}
      <Sidebar />
      
      {/* Primary Workspace */}
      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        <Navbar />
        <main className="p-4 flex-grow-1" style={{ overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
